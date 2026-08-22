<?php

namespace App\Services\Product;

use App\Models\Product\Adjustment;
use App\Models\Product\ProductAdjustment;
use App\Models\Product\ProductWarehouse;
use App\Models\Settings\Company;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AdjustmentService implements AdjustmentServiceInterface
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
        return Adjustment::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()->with(['warehouse', 'user', 'items.product'])
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(adjustments.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['reference_no'] ?? null, fn (Builder $query, string $ref) => $query->where('adjustments.reference_no', 'like', "%{$ref}%"))
            ->when($filters['warehouse_id'] ?? null, fn (Builder $query, string $id) => $query->where('adjustments.warehouse_id', $id))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('adjustments.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('adjustments.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('adjustments.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    protected function persistItems(Adjustment $adjustment, array $items): void
    {
        $totalQty = 0.0;

        foreach ($items as $item) {
            $qty = (float) $item['qty'];
            $signedQty = $item['action'] === '-' ? -$qty : $qty;

            ProductAdjustment::create([
                'adjustment_id' => $adjustment->id,
                'product_id' => $item['product_id'],
                'variant_id' => $item['variant_id'] ?? null,
                'batch_id' => $item['batch_id'] ?? null,
                'action' => $item['action'],
                'qty' => $qty,
                'unit_cost' => $item['unit_cost'] ?? null,
            ]);

            $this->adjustStock(
                (int) $item['product_id'],
                $item['variant_id'] ?? null,
                $item['batch_id'] ?? null,
                $adjustment->warehouse_id,
                $signedQty,
            );

            $totalQty += $qty;
        }

        $adjustment->update(['total_qty' => $totalQty]);
    }

    protected function adjustStock(int $productId, ?int $variantId, ?int $batchId, int $warehouseId, float $signedQty): void
    {
        $stock = ProductWarehouse::firstOrNew([
            'product_id' => $productId,
            'variant_id' => $variantId,
            'batch_id' => $batchId,
            'warehouse_id' => $warehouseId,
        ]);
        $stock->qty = ($stock->qty ?? 0) + $signedQty;
        $stock->save();
    }

    protected function reverseStock(Adjustment $adjustment): void
    {
        foreach ($adjustment->items as $item) {
            $signedQty = $item->action === '-' ? -1 * (float) $item->qty : (float) $item->qty;

            $this->adjustStock(
                $item->product_id,
                $item->variant_id,
                $item->batch_id,
                $adjustment->warehouse_id,
                -1 * $signedQty,
            );
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Adjustment
    {
        return DB::transaction(function () use ($data) {
            $adjustment = Adjustment::create([
                'company_id' => $this->activeCompany()->id,
                'reference_no' => $data['reference_no'] ?? ('ADJ-'.now()->format('Ymd').'-'.now()->format('His')),
                'warehouse_id' => $data['warehouse_id'],
                'user_id' => $this->currentUserId(),
                'note' => $data['note'] ?? null,
            ]);

            $this->persistItems($adjustment, $data['items']);

            return $adjustment->load(['items', 'warehouse', 'user']);
        });
    }

    public function findScoped(int $id): Adjustment
    {
        return $this->baseScopedQuery()
            ->with(['warehouse', 'user', 'items.product', 'items.variant', 'items.batch'])
            ->where('adjustments.id', $id)
            ->firstOrFail();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): Adjustment
    {
        return DB::transaction(function () use ($id, $data) {
            $adjustment = $this->findScoped($id);

            $this->reverseStock($adjustment);
            $adjustment->items()->delete();

            $adjustment->update([
                'warehouse_id' => $data['warehouse_id'] ?? $adjustment->warehouse_id,
                'note' => $data['note'] ?? $adjustment->note,
            ]);

            $this->persistItems($adjustment, $data['items']);

            return $adjustment->load(['items', 'warehouse', 'user']);
        });
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $adjustment = $this->findScoped($id);
            $this->reverseStock($adjustment);
            $adjustment->delete();
        });
    }

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int
    {
        return DB::transaction(function () use ($ids) {
            $adjustments = $this->baseScopedQuery()->whereIn('adjustments.id', $ids)->get();
            foreach ($adjustments as $adjustment) {
                $this->reverseStock($adjustment);
                $adjustment->delete();
            }

            return $adjustments->count();
        });
    }
}
