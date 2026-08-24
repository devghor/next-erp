<?php

namespace App\Services\Sale;

use App\Models\Product\ProductWarehouse;
use App\Models\Sale\ProductExchange;
use App\Models\Sale\ProductSale;
use App\Models\Sale\Sale;
use App\Models\Sale\SaleExchange;
use App\Models\Settings\Company;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaleExchangeService implements SaleExchangeServiceInterface
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
        return SaleExchange::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->baseScopedQuery()
            ->with(['sale', 'customer', 'warehouse', 'biller'])
            ->when($filters['warehouse_id'] ?? null, fn (Builder $q, $id) => $q->where('warehouse_id', $id))
            ->when($filters['customer_id'] ?? null, fn (Builder $q, $id) => $q->where('customer_id', $id))
            ->when($filters['date_from'] ?? null, fn (Builder $q, $d) => $q->whereDate('sale_exchanges.created_at', '>=', $d))
            ->when($filters['date_to'] ?? null, fn (Builder $q, $d) => $q->whereDate('sale_exchanges.created_at', '<=', $d))
            ->orderByDesc('sale_exchanges.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    public function findScoped(int $id): SaleExchange
    {
        return $this->baseScopedQuery()
            ->with(['sale', 'customer', 'warehouse', 'biller', 'user', 'newProducts.product', 'returnedProducts.product'])
            ->where('sale_exchanges.id', $id)
            ->firstOrFail();
    }

    /**
     * @return Collection<int, ProductSale>
     */
    public function saleLines(int $saleId): Collection
    {
        return ProductSale::query()
            ->where('sale_id', $saleId)
            ->with(['product', 'variant', 'batch', 'saleUnit'])
            ->get();
    }

    public function findSaleByReference(string $referenceNo): Sale
    {
        return Sale::query()
            ->where('company_id', $this->activeCompany()->id)
            ->where('reference_no', $referenceNo)
            ->with(['customer', 'warehouse', 'biller', 'items.product', 'items.variant', 'items.batch'])
            ->firstOrFail();
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
     * @param  array{qty: float, net_unit_price: float, discount?: float, tax_rate?: float}  $line
     * @return array{tax: float, total: float}
     */
    protected function computeLineTotals(array $line): array
    {
        $qty = (float) $line['qty'];
        $netUnitPrice = (float) $line['net_unit_price'];
        $discount = (float) ($line['discount'] ?? 0);
        $taxRate = (float) ($line['tax_rate'] ?? 0);

        $subTotal = ($qty * $netUnitPrice) - $discount;
        $tax = round($subTotal * ($taxRate / 100), 2);

        return [
            'tax' => $tax,
            'total' => round($subTotal + $tax, 2),
        ];
    }

    protected function resolvePaymentStatus(float $grandTotal, float $paidAmount): string
    {
        if ($paidAmount <= 0) {
            return 'due';
        }

        return $paidAmount >= $grandTotal ? 'paid' : 'partial';
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): SaleExchange
    {
        return DB::transaction(function () use ($data) {
            $warehouseId = (int) $data['warehouse_id'];

            $exchange = SaleExchange::create([
                'company_id' => $this->activeCompany()->id,
                'sale_id' => $data['sale_id'] ?? null,
                'reference_no' => 'EXC-'.now()->format('Ymd').'-'.now()->format('His').'-'.random_int(1000, 9999),
                'customer_id' => $data['customer_id'],
                'user_id' => $this->currentUserId(),
                'warehouse_id' => $warehouseId,
                'biller_id' => $data['biller_id'] ?? null,
                'document' => $data['document'] ?? null,
                'exchange_note' => $data['exchange_note'] ?? null,
                'staff_note' => $data['staff_note'] ?? null,
                'payment_type' => $data['payment_type'] ?? null,
            ]);

            $totalQty = 0.0;
            $totalDiscount = 0.0;
            $totalTax = 0.0;
            $newTotal = 0.0;
            $returnedTotal = 0.0;

            foreach ($data['lines'] as $line) {
                $totals = $this->computeLineTotals($line);
                $type = $line['type'];

                $variantId = $line['variant_id'] ?? null;
                $batchId = $line['batch_id'] ?? null;

                if ($type === 'returned' && ! empty($line['product_sale_id'])) {
                    $original = ProductSale::query()->find($line['product_sale_id']);
                    if ($original) {
                        $variantId = $variantId ?? $original->variant_id;
                        $batchId = $batchId ?? $original->batch_id;
                    }
                }

                if ($type === 'new') {
                    $stock = ProductWarehouse::query()
                        ->where('product_id', $line['product_id'])
                        ->where('warehouse_id', $warehouseId)
                        ->where('variant_id', $variantId)
                        ->where('batch_id', $batchId)
                        ->first();

                    if ((float) ($stock->qty ?? 0) < (float) $line['qty']) {
                        throw ValidationException::withMessages([
                            'lines' => "Quantity exceeds stock quantity for product #{$line['product_id']}.",
                        ]);
                    }

                    $this->adjustStock((int) $line['product_id'], $variantId, $batchId, $warehouseId, -1 * (float) $line['qty']);
                    $newTotal += $totals['total'];
                } else {
                    $this->adjustStock((int) $line['product_id'], $variantId, $batchId, $warehouseId, (float) $line['qty']);
                    $returnedTotal += $totals['total'];
                }

                ProductExchange::create([
                    'exchange_id' => $exchange->id,
                    'product_id' => $line['product_id'],
                    'variant_id' => $variantId,
                    'batch_id' => $batchId,
                    'sale_unit_id' => $line['sale_unit_id'] ?? null,
                    'qty' => $line['qty'],
                    'net_unit_price' => $line['net_unit_price'],
                    'discount' => $line['discount'] ?? 0,
                    'tax_rate' => $line['tax_rate'] ?? 0,
                    'tax' => $totals['tax'],
                    'total' => $totals['total'],
                    'type' => $type,
                ]);

                $totalQty += (float) $line['qty'];
                $totalDiscount += (float) ($line['discount'] ?? 0);
                $totalTax += $totals['tax'];
            }

            $requestedSettlement = (float) ($data['amount'] ?? 0);
            $paymentType = $data['payment_type'] ?? null;
            $persistedAmount = $requestedSettlement;

            $exchange->update([
                'item' => count($data['lines']),
                'total_qty' => $totalQty,
                'total_discount' => $totalDiscount,
                'total_tax' => $totalTax,
                'grand_total' => round($newTotal, 2),
            ]);

            if (! empty($data['sale_id'])) {
                /** @var Sale $sale */
                $sale = Sale::query()->where('company_id', $this->activeCompany()->id)->findOrFail($data['sale_id']);

                $adjustedGrandTotal = max(0, round((float) $sale->grand_total - $returnedTotal + $newTotal, 2));

                if ($paymentType === 'receive' && $requestedSettlement > 0) {
                    $sale->paid_amount = (float) $sale->paid_amount + $requestedSettlement;
                } elseif ($paymentType === 'pay' && $requestedSettlement > 0) {
                    $overpaidAfterExchange = max(0, (float) $sale->paid_amount - $adjustedGrandTotal);
                    $actualRefund = min($requestedSettlement, $overpaidAfterExchange);

                    $persistedAmount = $actualRefund;
                    if ($actualRefund < $requestedSettlement) {
                        $paymentType = $actualRefund > 0 ? 'pay' : null;
                    }

                    $sale->paid_amount = (float) $sale->paid_amount - $actualRefund;
                }

                $sale->grand_total = $adjustedGrandTotal;
                $sale->payment_status = $this->resolvePaymentStatus($adjustedGrandTotal, (float) $sale->paid_amount);
                $sale->save();
            }

            $exchange->update([
                'amount' => round($persistedAmount, 2),
                'payment_type' => $paymentType,
            ]);

            return $exchange->fresh(['sale', 'customer', 'warehouse', 'biller', 'newProducts.product', 'returnedProducts.product']);
        });
    }
}
