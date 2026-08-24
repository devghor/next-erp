<?php

namespace App\Services\Product;

use App\Models\Product\DamageStock;
use App\Models\Product\DamageStockItem;
use App\Models\Product\ProductWarehouse;
use App\Models\Settings\Company;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DamageStockService implements DamageStockServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function currentUserId(): ?int
    {
        /** @var (Authenticatable&object{id: int})|null $user */
        $user = Auth::user();

        return $user?->id;
    }

    protected function baseScopedQuery(): Builder
    {
        return DamageStock::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()->with(['warehouse', 'user', 'items.product'])
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(damage_stocks.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['reference_no'] ?? null, fn (Builder $query, string $ref) => $query->where('damage_stocks.reference_no', 'like', "%{$ref}%"))
            ->when($filters['warehouse_id'] ?? null, fn (Builder $query, string $id) => $query->where('damage_stocks.warehouse_id', $id))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('damage_stocks.damaged_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('damage_stocks.damaged_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('damage_stocks.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    protected function persistItems(DamageStock $damageStock, array $items): void
    {
        $totalQty = 0.0;

        foreach ($items as $item) {
            $qty = (float) $item['qty'];

            DamageStockItem::create([
                'damage_stock_id' => $damageStock->id,
                'product_id' => $item['product_id'],
                'variant_id' => $item['variant_id'] ?? null,
                'batch_id' => $item['batch_id'] ?? null,
                'qty' => $qty,
                'unit_cost' => $item['unit_cost'] ?? null,
            ]);

            $this->deductStock(
                (int) $item['product_id'],
                $item['variant_id'] ?? null,
                $item['batch_id'] ?? null,
                $damageStock->warehouse_id,
                $qty,
            );

            $totalQty += $qty;
        }

        $damageStock->update(['total_qty' => $totalQty]);
    }

    protected function deductStock(int $productId, ?int $variantId, ?int $batchId, int $warehouseId, float $qty): void
    {
        $stock = ProductWarehouse::firstOrNew([
            'product_id' => $productId,
            'variant_id' => $variantId,
            'batch_id' => $batchId,
            'warehouse_id' => $warehouseId,
        ]);
        $stock->qty = ($stock->qty ?? 0) - $qty;
        $stock->save();
    }

    protected function restoreStock(DamageStock $damageStock): void
    {
        foreach ($damageStock->items as $item) {
            $this->deductStock(
                $item->product_id,
                $item->variant_id,
                $item->batch_id,
                $damageStock->warehouse_id,
                -1 * (float) $item->qty,
            );
        }
    }

    protected function storeDocument(?UploadedFile $document): ?string
    {
        if (! $document) {
            return null;
        }

        return $document->store('damage-stocks', 'public');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): DamageStock
    {
        return DB::transaction(function () use ($data) {
            $damageStock = DamageStock::create([
                'company_id' => $this->activeCompany()->id,
                'reference_no' => $data['reference_no'] ?? ('DMG-'.now()->format('Ymd').'-'.now()->format('His')),
                'warehouse_id' => $data['warehouse_id'],
                'user_id' => $this->currentUserId(),
                'damaged_at' => $data['damaged_at'],
                'document' => $this->storeDocument($data['document'] ?? null),
                'note' => $data['note'] ?? null,
            ]);

            $this->persistItems($damageStock, $data['items']);

            return $damageStock->load(['items.product', 'warehouse', 'user']);
        });
    }

    public function findScoped(int $id): DamageStock
    {
        return $this->baseScopedQuery()
            ->with(['warehouse', 'user', 'items.product', 'items.variant', 'items.batch'])
            ->where('damage_stocks.id', $id)
            ->firstOrFail();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): DamageStock
    {
        return DB::transaction(function () use ($id, $data) {
            $damageStock = $this->findScoped($id);

            $this->restoreStock($damageStock);
            $damageStock->items()->delete();

            $newDocument = $this->storeDocument($data['document'] ?? null);
            if ($newDocument && $damageStock->document) {
                Storage::disk('public')->delete($damageStock->document);
            }

            $damageStock->update([
                'warehouse_id' => $data['warehouse_id'] ?? $damageStock->warehouse_id,
                'damaged_at' => $data['damaged_at'] ?? $damageStock->damaged_at,
                'document' => $newDocument ?? $damageStock->document,
                'note' => $data['note'] ?? $damageStock->note,
            ]);

            $this->persistItems($damageStock, $data['items']);

            return $damageStock->load(['items.product', 'warehouse', 'user']);
        });
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $damageStock = $this->findScoped($id);
            $this->restoreStock($damageStock);

            if ($damageStock->document) {
                Storage::disk('public')->delete($damageStock->document);
            }

            $damageStock->delete();
        });
    }

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int
    {
        return DB::transaction(function () use ($ids) {
            $damageStocks = $this->baseScopedQuery()->whereIn('damage_stocks.id', $ids)->get();
            foreach ($damageStocks as $damageStock) {
                $this->restoreStock($damageStock);

                if ($damageStock->document) {
                    Storage::disk('public')->delete($damageStock->document);
                }

                $damageStock->delete();
            }

            return $damageStocks->count();
        });
    }
}
