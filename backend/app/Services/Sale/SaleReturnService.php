<?php

namespace App\Services\Sale;

use App\Models\Product\ProductWarehouse;
use App\Models\Sale\Payment;
use App\Models\Sale\ProductSale;
use App\Models\Sale\Sale;
use App\Models\Sale\SaleReturn;
use App\Models\Sale\SaleReturnProduct;
use App\Models\Settings\Company;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class SaleReturnService implements SaleReturnServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function baseScopedQuery(): Builder
    {
        return SaleReturn::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->with(['sale', 'customer', 'warehouse', 'biller'])
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(sale_returns.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['reference_no'] ?? null, fn (Builder $query, string $ref) => $query->where('sale_returns.reference_no', 'like', "%{$ref}%"))
            ->when($filters['sale_id'] ?? null, fn (Builder $query, string $id) => $query->where('sale_returns.sale_id', $id))
            ->when($filters['customer_id'] ?? null, fn (Builder $query, string $id) => $query->where('sale_returns.customer_id', $id))
            ->when($filters['warehouse_id'] ?? null, fn (Builder $query, string $id) => $query->where('sale_returns.warehouse_id', $id))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('sale_returns.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('sale_returns.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('sale_returns.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)->orderByDesc('sale_returns.created_at')->get();
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
     * product_sales lines for a sale where qty - return_qty > 0 (still returnable).
     */
    public function availableLines(int $saleId): Collection
    {
        return ProductSale::query()
            ->where('sale_id', $saleId)
            ->whereColumn('qty', '>', 'return_qty')
            ->with(['product', 'variant', 'batch', 'saleUnit'])
            ->get();
    }

    /**
     * @param  array{sale_id: int, lines: array<int, array{product_sale_id: int, qty: float}>, refund?: bool, refund_amount?: float|null, account_id?: int|null, paying_method?: string|null, return_note?: string|null, staff_note?: string|null, change_sale_status?: bool}  $data
     */
    public function create(array $data): SaleReturn
    {
        return DB::transaction(function () use ($data) {
            $sale = Sale::query()->where('company_id', $this->activeCompany()->id)->findOrFail($data['sale_id']);

            $return = SaleReturn::create([
                'company_id' => $this->activeCompany()->id,
                'reference_no' => 'RR-'.now()->format('Ymd').'-'.now()->format('His'),
                'sale_id' => $sale->id,
                'customer_id' => $sale->customer_id,
                'warehouse_id' => $sale->warehouse_id,
                'biller_id' => $sale->biller_id,
                'account_id' => $data['account_id'] ?? null,
                'currency_id' => $sale->currency_id,
                'exchange_rate' => $sale->exchange_rate,
                'change_sale_status' => (bool) ($data['change_sale_status'] ?? false),
                'return_note' => $data['return_note'] ?? null,
                'staff_note' => $data['staff_note'] ?? null,
            ]);

            $totalQty = 0.0;
            $totalDiscount = 0.0;
            $totalTax = 0.0;
            $totalPrice = 0.0;

            foreach ($data['lines'] as $line) {
                /** @var ProductSale $productSale */
                $productSale = ProductSale::query()->where('sale_id', $sale->id)->findOrFail($line['product_sale_id']);

                $returnQty = (float) $line['qty'];
                $remaining = (float) $productSale->qty - (float) $productSale->return_qty;
                if ($returnQty <= 0 || $returnQty > $remaining) {
                    throw new \InvalidArgumentException("Return qty for product_sale #{$productSale->id} exceeds the remaining returnable qty.");
                }

                $lineUnitPrice = (float) $productSale->net_unit_price;
                $lineDiscount = (float) $productSale->qty > 0
                    ? round(((float) $productSale->discount / (float) $productSale->qty) * $returnQty, 2)
                    : 0.0;
                $lineTaxRate = (float) $productSale->tax_rate;
                $lineSubTotal = ($returnQty * $lineUnitPrice) - $lineDiscount;
                $lineTax = round($lineSubTotal * ($lineTaxRate / 100), 2);
                $lineTotal = round($lineSubTotal + $lineTax, 2);

                SaleReturnProduct::create([
                    'return_id' => $return->id,
                    'product_sale_id' => $productSale->id,
                    'product_id' => $productSale->product_id,
                    'variant_id' => $productSale->variant_id,
                    'batch_id' => $productSale->batch_id,
                    'sale_unit_id' => $productSale->sale_unit_id,
                    'qty' => $returnQty,
                    'net_unit_price' => $lineUnitPrice,
                    'discount' => $lineDiscount,
                    'tax_rate' => $lineTaxRate,
                    'tax' => $lineTax,
                    'total' => $lineTotal,
                ]);

                $this->adjustStock(
                    $productSale->product_id,
                    $productSale->variant_id,
                    $productSale->batch_id,
                    $sale->warehouse_id,
                    $returnQty,
                );

                $productSale->update(['return_qty' => (float) $productSale->return_qty + $returnQty]);

                $totalQty += $returnQty;
                $totalDiscount += $lineDiscount;
                $totalTax += $lineTax;
                $totalPrice += $lineTotal;
            }

            $return->update([
                'item' => count($data['lines']),
                'total_qty' => $totalQty,
                'total_discount' => $totalDiscount,
                'total_tax' => $totalTax,
                'total_price' => $totalPrice,
                'grand_total' => round($totalPrice, 2),
            ]);

            if (! empty($data['refund']) && (float) $sale->paid_amount > 0) {
                $refundAmount = (float) ($data['refund_amount'] ?? min((float) $sale->paid_amount, (float) $return->grand_total));
                $refundAmount = min($refundAmount, (float) $sale->paid_amount);

                if ($refundAmount > 0) {
                    Payment::create([
                        'company_id' => $this->activeCompany()->id,
                        'payment_reference' => 'SPR-'.now()->format('Ymd').'-'.now()->format('His').'-'.random_int(100, 999),
                        'return_id' => $return->id,
                        'account_id' => $data['account_id'] ?? null,
                        'amount' => $refundAmount,
                        'paying_method' => $data['paying_method'] ?? 'Cash',
                    ]);

                    $return->update(['refund_amount' => $refundAmount]);
                }
            }

            return $return->fresh(['products', 'sale', 'customer', 'warehouse', 'biller', 'refundPayment']);
        });
    }

    public function findScoped(int $id): SaleReturn
    {
        return $this->baseScopedQuery()
            ->with(['sale', 'customer', 'warehouse', 'biller', 'account', 'currency', 'products.product', 'products.variant', 'products.batch', 'refundPayment'])
            ->where('sale_returns.id', $id)
            ->firstOrFail();
    }

    /**
     * Only return_note/staff_note are mutable after creation — line items, stock, and
     * refunds are immutable once posted (matches the plan's scope: no edit flow for
     * returns beyond notes, avoiding the salespro edit-flow's stock-drift bug).
     *
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): SaleReturn
    {
        return DB::transaction(function () use ($id, $data) {
            $return = $this->findScoped($id);
            $return->update([
                'return_note' => $data['return_note'] ?? $return->return_note,
                'staff_note' => $data['staff_note'] ?? $return->staff_note,
            ]);

            return $return;
        });
    }

    /**
     * Reverses a return: re-deducts the restored stock, decrements return_qty back,
     * deletes the refund payment (if any), and deletes the return itself.
     */
    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $return = $this->findScoped($id);

            foreach ($return->products as $line) {
                $this->adjustStock(
                    $line->product_id,
                    $line->variant_id,
                    $line->batch_id,
                    $return->warehouse_id,
                    -1 * (float) $line->qty,
                );

                if ($line->product_sale_id) {
                    ProductSale::query()->where('id', $line->product_sale_id)
                        ->decrement('return_qty', (float) $line->qty);
                }

                $line->delete();
            }

            Payment::query()->where('return_id', $return->id)->delete();
            $return->delete();
        });
    }

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int
    {
        $count = 0;
        foreach ($ids as $id) {
            $this->delete($id);
            $count++;
        }

        return $count;
    }

    /**
     * @return array{imported: int, failures: array<int, array<string, mixed>>}
     */
    public function import(UploadedFile $file): array
    {
        return ['imported' => 0, 'failures' => []];
    }
}
