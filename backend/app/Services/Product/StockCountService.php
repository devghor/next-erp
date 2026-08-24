<?php

namespace App\Services\Product;

use App\Models\Product\ProductWarehouse;
use App\Models\Product\StockCount;
use App\Models\Product\StockCountItem;
use App\Models\Settings\Company;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockCountService implements StockCountServiceInterface
{
    public function __construct(protected AdjustmentServiceInterface $adjustmentService) {}

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
        return StockCount::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()->with(['warehouse', 'user'])
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(stock_counts.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['reference_no'] ?? null, fn (Builder $query, string $ref) => $query->where('stock_counts.reference_no', 'like', "%{$ref}%"))
            ->when($filters['warehouse_id'] ?? null, fn (Builder $query, string $id) => $query->where('stock_counts.warehouse_id', $id))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('stock_counts.status', $status))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('stock_counts.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('stock_counts.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('stock_counts.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): StockCount
    {
        return DB::transaction(function () use ($data) {
            $categoryIds = $data['category_ids'] ?? null;
            $brandIds = $data['brand_ids'] ?? null;

            $stockCount = StockCount::create([
                'company_id' => $this->activeCompany()->id,
                'reference_no' => $data['reference_no'] ?? ('SCR-'.now()->format('Ymd').'-'.now()->format('His')),
                'warehouse_id' => $data['warehouse_id'],
                'user_id' => $this->currentUserId(),
                'type' => empty($categoryIds) && empty($brandIds) ? 'full' : 'partial',
                'status' => 'draft',
                'category_ids' => $categoryIds,
                'brand_ids' => $brandIds,
                'note' => $data['note'] ?? null,
            ]);

            $stockLines = ProductWarehouse::query()
                ->where('warehouse_id', $data['warehouse_id'])
                ->whereHas('product', function (Builder $query) use ($categoryIds, $brandIds) {
                    $query->where('company_id', $this->activeCompany()->id)
                        ->when(! empty($categoryIds), fn (Builder $q) => $q->whereIn('category_id', $categoryIds))
                        ->when(! empty($brandIds), fn (Builder $q) => $q->whereIn('brand_id', $brandIds));
                })
                ->with('product')
                ->get();

            foreach ($stockLines as $line) {
                StockCountItem::create([
                    'stock_count_id' => $stockCount->id,
                    'product_id' => $line->product_id,
                    'variant_id' => $line->variant_id,
                    'batch_id' => $line->batch_id,
                    'expected_qty' => $line->qty,
                    'unit_cost' => $line->product?->cost,
                ]);
            }

            return $stockCount->load(['items.product', 'warehouse', 'user']);
        });
    }

    public function findScoped(int $id): StockCount
    {
        return $this->baseScopedQuery()
            ->with(['warehouse', 'user', 'adjustment', 'items.product', 'items.variant', 'items.batch'])
            ->where('stock_counts.id', $id)
            ->firstOrFail();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): StockCount
    {
        $stockCount = $this->findScoped($id);

        if ($stockCount->status === 'adjusted') {
            throw ValidationException::withMessages(['status' => 'An adjusted stock count can no longer be edited.']);
        }

        $stockCount->update([
            'note' => $data['note'] ?? $stockCount->note,
        ]);

        return $stockCount->fresh(['items.product', 'warehouse', 'user']);
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    public function submitCount(int $id, array $items): StockCount
    {
        $stockCount = $this->findScoped($id);

        if ($stockCount->status === 'adjusted') {
            throw ValidationException::withMessages(['status' => 'An adjusted stock count can no longer be recounted.']);
        }

        DB::transaction(function () use ($stockCount, $items) {
            foreach ($items as $item) {
                $stockCountItem = $stockCount->items()->whereKey($item['id'])->first();
                if (! $stockCountItem) {
                    continue;
                }

                $countedQty = (float) $item['counted_qty'];
                $stockCountItem->update([
                    'counted_qty' => $countedQty,
                    'difference' => $countedQty - (float) $stockCountItem->expected_qty,
                ]);
            }

            $stockCount->update(['status' => 'counted']);
        });

        return $stockCount->fresh(['items.product', 'warehouse', 'user']);
    }

    public function adjust(int $id): StockCount
    {
        $stockCount = $this->findScoped($id);

        if ($stockCount->status !== 'counted') {
            throw ValidationException::withMessages(['status' => 'Only a counted stock count can be adjusted.']);
        }

        return DB::transaction(function () use ($stockCount) {
            $adjustmentItems = $stockCount->items
                ->filter(fn (StockCountItem $item) => $item->difference !== null && (float) $item->difference !== 0.0)
                ->map(fn (StockCountItem $item) => [
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'batch_id' => $item->batch_id,
                    'action' => (float) $item->difference > 0 ? '+' : '-',
                    'qty' => abs((float) $item->difference),
                    'unit_cost' => $item->unit_cost,
                ])
                ->values()
                ->all();

            if (! empty($adjustmentItems)) {
                $adjustment = $this->adjustmentService->create([
                    'reference_no' => 'ADJ-'.$stockCount->reference_no,
                    'warehouse_id' => $stockCount->warehouse_id,
                    'note' => 'Auto-generated from stock count '.$stockCount->reference_no,
                    'items' => $adjustmentItems,
                ]);

                $stockCount->adjustment_id = $adjustment->id;
            }

            $stockCount->status = 'adjusted';
            $stockCount->save();

            return $stockCount->fresh(['items.product', 'warehouse', 'user', 'adjustment']);
        });
    }

    public function delete(int $id): void
    {
        $stockCount = $this->findScoped($id);

        if ($stockCount->status === 'adjusted') {
            throw ValidationException::withMessages(['status' => 'An adjusted stock count can no longer be deleted.']);
        }

        $stockCount->delete();
    }

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int
    {
        return DB::transaction(function () use ($ids) {
            $stockCounts = $this->baseScopedQuery()->whereIn('stock_counts.id', $ids)->where('status', '!=', 'adjusted')->get();
            foreach ($stockCounts as $stockCount) {
                $stockCount->delete();
            }

            return $stockCounts->count();
        });
    }
}
