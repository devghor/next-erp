<?php

namespace App\Services\Sale;

use App\Models\Product\ProductWarehouse;
use App\Models\Sale\PackingSlip;
use App\Models\Sale\PackingSlipProduct;
use App\Models\Sale\ProductSale;
use App\Models\Sale\Sale;
use App\Models\Settings\Company;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PackingSlipService implements PackingSlipServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function baseScopedQuery(): Builder
    {
        return PackingSlip::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->with(['sale.customer', 'products.product', 'products.variant'])
            ->when($filters['reference_no'] ?? null, fn (Builder $query, string $ref) => $query->where('packing_slips.reference_no', 'like', "%{$ref}%"))
            ->when($filters['sale_id'] ?? null, fn (Builder $query, string $id) => $query->where('packing_slips.sale_id', $id))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('packing_slips.status', $status));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('packing_slips.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    public function findScoped(int $id): PackingSlip
    {
        return $this->baseScopedQuery()
            ->with(['sale.customer', 'products.product', 'products.variant'])
            ->where('packing_slips.id', $id)
            ->firstOrFail();
    }

    protected function nextReferenceNo(): string
    {
        $count = $this->baseScopedQuery()->count();

        return 'PS-'.(1001 + $count);
    }

    protected function adjustStock(int $productId, ?int $variantId, ?int $batchId, int $warehouseId, float $deltaQty): void
    {
        $stock = ProductWarehouse::firstOrNew([
            'product_id' => $productId,
            'variant_id' => $variantId,
            'batch_id' => $batchId,
            'warehouse_id' => $warehouseId,
        ]);
        $stock->qty = ($stock->qty ?? 0) + $deltaQty;
        $stock->save();
    }

    /**
     * The `product_sales` lines on a sale not yet flagged as packed.
     */
    public function availableLines(int $saleId): Collection
    {
        $sale = Sale::query()
            ->where('company_id', $this->activeCompany()->id)
            ->where('id', $saleId)
            ->firstOrFail();

        return $sale->items()->where('is_packing', false)->with(['product', 'variant'])->get();
    }

    /**
     * Packing is a physical stock-pull separate from the sale-time deduction —
     * intentionally a second decrement pass against the same product_warehouses
     * ledger, matching the reference system's packing-stage behaviour.
     *
     * @param  array{sale_id: int, lines: array<int, array{product_sale_id: int, product_id: int, variant_id?: int|null}>}  $data
     */
    public function create(array $data): PackingSlip
    {
        return DB::transaction(function () use ($data) {
            $sale = Sale::query()
                ->where('company_id', $this->activeCompany()->id)
                ->where('id', $data['sale_id'])
                ->firstOrFail();

            $amount = 0.0;

            $packingSlip = PackingSlip::create([
                'company_id' => $this->activeCompany()->id,
                'reference_no' => $this->nextReferenceNo(),
                'sale_id' => $sale->id,
                'amount' => 0,
                'status' => 'pending',
            ]);

            foreach ($data['lines'] as $line) {
                /** @var ProductSale $productSaleLine */
                $productSaleLine = $sale->items()->where('id', $line['product_sale_id'])->firstOrFail();

                if ($productSaleLine->is_packing) {
                    throw ValidationException::withMessages([
                        'lines' => "Line #{$productSaleLine->id} has already been packed.",
                    ]);
                }

                $productSaleLine->update(['is_packing' => true]);

                $this->adjustStock(
                    $productSaleLine->product_id,
                    $productSaleLine->variant_id,
                    $productSaleLine->batch_id,
                    $sale->warehouse_id,
                    -1 * (float) $productSaleLine->qty,
                );

                PackingSlipProduct::create([
                    'packing_slip_id' => $packingSlip->id,
                    'product_id' => $productSaleLine->product_id,
                    'variant_id' => $productSaleLine->variant_id,
                ]);

                $amount += (float) $productSaleLine->total;
            }

            $packingSlip->update(['amount' => $amount]);

            return $packingSlip->fresh(['sale.customer', 'products.product', 'products.variant']);
        });
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $packingSlip = $this->findScoped($id);

            if ($packingSlip->status !== 'pending') {
                throw ValidationException::withMessages([
                    'status' => 'Only a pending packing slip can be deleted — it has already been handed to a courier.',
                ]);
            }

            $sale = $packingSlip->sale;

            foreach ($packingSlip->products as $packedProduct) {
                $productSaleLine = ProductSale::query()
                    ->where('sale_id', $sale->id)
                    ->where('product_id', $packedProduct->product_id)
                    ->where('variant_id', $packedProduct->variant_id)
                    ->where('is_packing', true)
                    ->first();

                if ($productSaleLine) {
                    $this->adjustStock(
                        $productSaleLine->product_id,
                        $productSaleLine->variant_id,
                        $productSaleLine->batch_id,
                        $sale->warehouse_id,
                        (float) $productSaleLine->qty,
                    );

                    $productSaleLine->update(['is_packing' => false]);
                }
            }

            $packingSlip->products()->delete();
            $packingSlip->delete();
        });
    }
}
