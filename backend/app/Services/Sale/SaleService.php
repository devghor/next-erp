<?php

namespace App\Services\Sale;

use App\Models\People\Customer;
use App\Models\Product\Product;
use App\Models\Product\ProductWarehouse;
use App\Models\Product\Unit;
use App\Models\Sale\Payment;
use App\Models\Sale\ProductSale;
use App\Models\Sale\Sale;
use App\Models\Settings\Company;
use App\Models\Settings\SaleSetting;
use App\Models\Settings\Tax;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaleService implements SaleServiceInterface
{
    public function __construct(protected InstallmentPlanServiceInterface $installmentPlanService) {}

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
        return Sale::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()->with(['customer', 'warehouse', 'biller', 'items.product'])
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(sales.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['reference_no'] ?? null, fn (Builder $query, string $ref) => $query->where('sales.reference_no', 'like', "%{$ref}%"))
            ->when($filters['customer_id'] ?? null, fn (Builder $query, string $id) => $query->where('sales.customer_id', $id))
            ->when($filters['warehouse_id'] ?? null, fn (Builder $query, string $id) => $query->where('sales.warehouse_id', $id))
            ->when($filters['sale_status'] ?? null, fn (Builder $query, string $status) => $query->where('sales.sale_status', $status))
            ->when($filters['payment_status'] ?? null, fn (Builder $query, string $status) => $query->where('sales.payment_status', $status))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('sales.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('sales.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('sales.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('sales.created_at')
            ->get();
    }

    /**
     * @param  array{qty: float, net_unit_price: float, discount?: float, tax_rate?: float}  $item
     * @return array{tax: float, total: float}
     */
    protected function computeItemTotals(array $item): array
    {
        $qty = (float) $item['qty'];
        $netUnitPrice = (float) $item['net_unit_price'];
        $discount = (float) ($item['discount'] ?? 0);
        $taxRate = (float) ($item['tax_rate'] ?? 0);

        $subTotal = ($qty * $netUnitPrice) - $discount;
        $tax = round($subTotal * ($taxRate / 100), 2);

        return [
            'tax' => $tax,
            'total' => round($subTotal + $tax, 2),
        ];
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
     * @param  array<int, array<string, mixed>>  $items
     */
    protected function persistItems(Sale $sale, array $items): void
    {
        $totalQty = 0.0;
        $totalDiscount = 0.0;
        $totalTax = 0.0;
        $totalPrice = 0.0;

        foreach ($items as $item) {
            $totals = $this->computeItemTotals($item);

            ProductSale::create([
                'sale_id' => $sale->id,
                'product_id' => $item['product_id'],
                'variant_id' => $item['variant_id'] ?? null,
                'batch_id' => $item['batch_id'] ?? null,
                'sale_unit_id' => $item['sale_unit_id'] ?? null,
                'qty' => $item['qty'],
                'net_unit_price' => $item['net_unit_price'],
                'discount' => $item['discount'] ?? 0,
                'tax_rate' => $item['tax_rate'] ?? 0,
                'tax' => $totals['tax'],
                'total' => $totals['total'],
            ]);

            if ($sale->sale_status !== 'draft') {
                $this->adjustStock(
                    (int) $item['product_id'],
                    $item['variant_id'] ?? null,
                    $item['batch_id'] ?? null,
                    $sale->warehouse_id,
                    -1 * (float) $item['qty'],
                );
            }

            $totalQty += (float) $item['qty'];
            $totalDiscount += (float) ($item['discount'] ?? 0);
            $totalTax += $totals['tax'];
            $totalPrice += $totals['total'];
        }

        $orderDiscount = $sale->order_discount_type === 'percentage'
            ? round($totalPrice * ((float) $sale->order_discount_value / 100), 2)
            : (float) $sale->order_discount_value;

        $orderTax = $sale->order_tax_rate !== null
            ? round(($totalPrice - $orderDiscount) * ((float) $sale->order_tax_rate / 100), 2)
            : 0.0;

        $grandTotal = $totalPrice - $orderDiscount - (float) $sale->coupon_discount + $orderTax + (float) $sale->shipping_cost;

        $sale->update([
            'item' => count($items),
            'total_qty' => $totalQty,
            'total_discount' => $totalDiscount,
            'total_tax' => $totalTax,
            'total_price' => $totalPrice,
            'order_discount' => $orderDiscount,
            'order_tax' => $orderTax,
            'grand_total' => max(0, round($grandTotal, 2)),
        ]);
    }

    protected function reverseStockForSale(Sale $sale): void
    {
        if ($sale->sale_status === 'draft') {
            return;
        }

        foreach ($sale->items as $item) {
            $this->adjustStock(
                $item->product_id,
                $item->variant_id,
                $item->batch_id,
                $sale->warehouse_id,
                (float) $item->qty,
            );
        }
    }

    /**
     * due = (sum of the customer's other unpaid sale balances) + opening_balance - deposit.
     * Rejects if due + this sale's balance exceeds credit_limit, unless credit_limit is unset/0
     * (no credit check) or the sale is fully paid / a draft.
     */
    protected function assertWithinCreditLimit(int $customerId, float $grandTotal, float $paidAmount, bool $isDraft, ?int $excludeSaleId = null): void
    {
        if ($isDraft || $paidAmount >= $grandTotal) {
            return;
        }

        $customer = Customer::query()->find($customerId);
        if (! $customer || (float) $customer->credit_limit <= 0) {
            return;
        }

        $existingDue = (float) $this->baseScopedQuery()
            ->where('customer_id', $customerId)
            ->when($excludeSaleId, fn (Builder $q) => $q->where('id', '!=', $excludeSaleId))
            ->selectRaw('COALESCE(SUM(grand_total - paid_amount), 0) as due')
            ->value('due');

        $due = $existingDue + (float) $customer->opening_balance - (float) $customer->deposit;
        $thisDue = $grandTotal - $paidAmount;

        if ($due + $thisDue > (float) $customer->credit_limit) {
            throw ValidationException::withMessages([
                'customer_id' => 'This sale exceeds the customer\'s credit limit.',
            ]);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $payments
     */
    protected function recordPayments(Sale $sale, array $payments): void
    {
        $totalPaid = 0.0;

        foreach ($payments as $payment) {
            $amount = (float) ($payment['amount'] ?? 0);
            if ($amount <= 0) {
                continue;
            }

            Payment::create([
                'company_id' => $this->activeCompany()->id,
                'payment_reference' => 'SPR-'.now()->format('Ymd').'-'.now()->format('His').'-'.random_int(100, 999),
                'sale_id' => $sale->id,
                'gift_card_id' => $payment['gift_card_id'] ?? null,
                'user_id' => $this->currentUserId(),
                'account_id' => $payment['account_id'] ?? null,
                'amount' => $amount,
                'paying_method' => $payment['paying_method'] ?? 'Cash',
                'cheque_no' => $payment['cheque_no'] ?? null,
                'payment_note' => $payment['payment_note'] ?? null,
                'gateway_reference' => $payment['gateway_reference'] ?? null,
                'gateway_status' => $payment['gateway_status'] ?? null,
            ]);

            if (($payment['paying_method'] ?? null) === 'Gift Card' && ! empty($payment['gift_card_id'])) {
                DB::table('gift_cards')->where('id', $payment['gift_card_id'])->increment('expense', $amount);
            }

            $totalPaid += $amount;
        }

        $sale->update(['paid_amount' => (float) $sale->paid_amount + $totalPaid]);
        $sale->refresh();
        $sale->update(['payment_status' => $this->resolvePaymentStatus((float) $sale->grand_total, (float) $sale->paid_amount)]);
    }

    protected function resolvePaymentStatus(float $grandTotal, float $paidAmount): string
    {
        if ($paidAmount <= 0) {
            return 'due';
        }

        return $paidAmount >= $grandTotal ? 'paid' : 'partial';
    }

    /**
     * Awards floor(grand_total / per_point_amount) reward points to the customer
     * when sale_settings.reward_points_active and grand_total meets the minimum.
     */
    protected function awardRewardPoints(Sale $sale): void
    {
        if ($sale->sale_status !== 'completed') {
            return;
        }

        $settings = SaleSetting::query()->where('company_id', $this->activeCompany()->id)->first();
        if (! $settings || ! $settings->reward_points_active || (float) $settings->per_point_amount <= 0) {
            return;
        }

        if ((float) $sale->grand_total < (float) $settings->min_order_for_points) {
            return;
        }

        $points = (int) floor((float) $sale->grand_total / (float) $settings->per_point_amount);
        if ($points > 0) {
            Customer::query()->where('id', $sale->customer_id)->increment('points', $points);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Sale
    {
        return DB::transaction(function () use ($data) {
            $saleStatus = $data['sale_status'] ?? 'draft';
            $payments = $data['payments'] ?? [];
            $paidAmountUpfront = (float) collect($payments)->sum('amount');

            // Rough pre-check against the submitted items' raw totals; the authoritative
            // check re-runs after persistItems() computes the real grand_total below.
            $this->assertWithinCreditLimit(
                (int) $data['customer_id'],
                (float) collect($data['items'])->sum(fn ($i) => ((float) $i['qty'] * (float) $i['net_unit_price']) - (float) ($i['discount'] ?? 0)),
                $paidAmountUpfront,
                $saleStatus === 'draft',
            );

            $sale = Sale::create([
                'company_id' => $this->activeCompany()->id,
                'reference_no' => $data['reference_no'] ?? ($saleStatus === 'draft' ? 'DR-' : 'SR-').now()->format('Ymd').'-'.now()->format('His'),
                'customer_id' => $data['customer_id'],
                'warehouse_id' => $data['warehouse_id'],
                'biller_id' => $data['biller_id'] ?? null,
                'user_id' => $this->currentUserId(),
                'currency_id' => $data['currency_id'] ?? null,
                'exchange_rate' => $data['exchange_rate'] ?? 1,
                'order_tax_rate' => $data['order_tax_rate'] ?? null,
                'order_discount_type' => $data['order_discount_type'] ?? 'fixed',
                'order_discount_value' => $data['order_discount_value'] ?? 0,
                'coupon_id' => $data['coupon_id'] ?? null,
                'coupon_discount' => $data['coupon_discount'] ?? 0,
                'shipping_cost' => $data['shipping_cost'] ?? 0,
                'sale_status' => $saleStatus,
                'pay_term_no' => $data['pay_term_no'] ?? null,
                'pay_term_period' => $data['pay_term_period'] ?? null,
                'due_date' => $data['due_date'] ?? null,
                'sale_note' => $data['sale_note'] ?? null,
                'staff_note' => $data['staff_note'] ?? null,
                'is_pos' => $data['is_pos'] ?? false,
                'cash_register_id' => $data['cash_register_id'] ?? null,
                'client_reference' => $data['client_reference'] ?? null,
            ]);

            $this->persistItems($sale, $data['items']);

            if (! empty($data['coupon_id'])) {
                // Coupons is a parallel-fork table this phase; increment via raw query,
                // no Eloquent model dependency across fork boundaries.
                DB::table('coupons')->where('id', $data['coupon_id'])->increment('used');
            }

            $this->recordPayments($sale, $payments);

            if (! empty($data['installment'])) {
                $this->installmentPlanService->createForSale($sale, $data['installment']);
            }

            $this->awardRewardPoints($sale);

            return $sale->fresh(['items', 'customer', 'warehouse', 'biller', 'payments']);
        });
    }

    public function findScoped(int $id): Sale
    {
        return $this->baseScopedQuery()
            ->with(['customer', 'warehouse', 'biller', 'currency', 'items.product', 'items.variant', 'items.batch', 'payments'])
            ->where('sales.id', $id)
            ->firstOrFail();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): Sale
    {
        return DB::transaction(function () use ($id, $data) {
            $sale = $this->findScoped($id);

            $this->reverseStockForSale($sale);
            $sale->items()->delete();

            $sale->update([
                'customer_id' => $data['customer_id'] ?? $sale->customer_id,
                'warehouse_id' => $data['warehouse_id'] ?? $sale->warehouse_id,
                'biller_id' => $data['biller_id'] ?? $sale->biller_id,
                'currency_id' => $data['currency_id'] ?? $sale->currency_id,
                'exchange_rate' => $data['exchange_rate'] ?? $sale->exchange_rate,
                'order_tax_rate' => $data['order_tax_rate'] ?? $sale->order_tax_rate,
                'order_discount_type' => $data['order_discount_type'] ?? $sale->order_discount_type,
                'order_discount_value' => $data['order_discount_value'] ?? $sale->order_discount_value,
                'shipping_cost' => $data['shipping_cost'] ?? $sale->shipping_cost,
                'sale_status' => $data['sale_status'] ?? $sale->sale_status,
                'sale_note' => $data['sale_note'] ?? $sale->sale_note,
                'staff_note' => $data['staff_note'] ?? $sale->staff_note,
                'is_pos' => $data['is_pos'] ?? $sale->is_pos,
                'cash_register_id' => $data['cash_register_id'] ?? $sale->cash_register_id,
                'client_reference' => $data['client_reference'] ?? $sale->client_reference,
            ]);

            $this->persistItems($sale, $data['items']);

            $sale->refresh();
            $this->assertWithinCreditLimit(
                (int) $sale->customer_id,
                (float) $sale->grand_total,
                (float) $sale->paid_amount,
                $sale->sale_status === 'draft',
                $sale->id,
            );

            if (! empty($data['payments'])) {
                $this->recordPayments($sale, $data['payments']);
            }

            return $sale->fresh(['items', 'customer', 'warehouse', 'biller', 'payments']);
        });
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $sale = $this->findScoped($id);
            $this->reverseStockForSale($sale);
            $sale->update(['deleted_by' => $this->currentUserId()]);
            $sale->delete();
        });
    }

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int
    {
        return DB::transaction(function () use ($ids) {
            $sales = $this->baseScopedQuery()->whereIn('sales.id', $ids)->get();
            foreach ($sales as $sale) {
                $this->reverseStockForSale($sale);
                $sale->update(['deleted_by' => $this->currentUserId()]);
                $sale->delete();
            }

            return $sales->count();
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function addPayment(int $id, array $data): Sale
    {
        return DB::transaction(function () use ($id, $data) {
            $sale = $this->findScoped($id);
            $this->recordPayments($sale, [$data]);

            return $sale->fresh(['payments']);
        });
    }

    /**
     * CSV columns (no header row): product_code, qty, unit_code|'n/a', price, discount, tax_name|'No Tax'.
     * Any row failure rolls back the whole import with a row-numbered error message.
     *
     * @param  array{customer_id: int, warehouse_id: int, biller_id?: int|null, currency_id?: int|null, sale_status?: string}  $meta
     */
    public function importCsv(UploadedFile $file, array $meta): Sale
    {
        return DB::transaction(function () use ($file, $meta) {
            $rows = array_map('str_getcsv', file($file->getRealPath()));
            $saleStatus = $meta['sale_status'] ?? 'completed';

            $sale = Sale::create([
                'company_id' => $this->activeCompany()->id,
                'reference_no' => 'SR-'.now()->format('Ymd').'-'.now()->format('His'),
                'customer_id' => $meta['customer_id'],
                'warehouse_id' => $meta['warehouse_id'],
                'biller_id' => $meta['biller_id'] ?? null,
                'currency_id' => $meta['currency_id'] ?? null,
                'user_id' => $this->currentUserId(),
                'sale_status' => $saleStatus,
            ]);

            $items = [];
            $rowNumber = 0;

            foreach ($rows as $row) {
                $rowNumber++;
                if (count($row) < 6 || $row[0] === '') {
                    continue;
                }

                [$code, $qty, $unitCode, $price, $discount, $taxName] = array_map('trim', $row);

                $product = Product::query()->where('company_id', $this->activeCompany()->id)->where('code', $code)->first();
                if (! $product) {
                    throw ValidationException::withMessages(['file' => "Error in row {$rowNumber}: product code \"{$code}\" not found."]);
                }

                $unitId = null;
                if (strtolower($unitCode) !== 'n/a' && $unitCode !== '') {
                    $unit = Unit::query()->where('company_id', $this->activeCompany()->id)->where('code', $unitCode)->first();
                    if (! $unit) {
                        throw ValidationException::withMessages(['file' => "Error in row {$rowNumber}: unit code \"{$unitCode}\" not found."]);
                    }
                    $unitId = $unit->id;
                }

                $taxRate = 0;
                if (strtolower($taxName) !== 'no tax' && $taxName !== '') {
                    $tax = Tax::query()->where('company_id', $this->activeCompany()->id)->whereRaw('LOWER(name) = ?', [strtolower($taxName)])->first();
                    if (! $tax) {
                        throw ValidationException::withMessages(['file' => "Error in row {$rowNumber}: tax \"{$taxName}\" not found."]);
                    }
                    $taxRate = (float) $tax->rate;
                }

                $items[] = [
                    'product_id' => $product->id,
                    'sale_unit_id' => $unitId,
                    'qty' => (float) $qty,
                    'net_unit_price' => (float) $price,
                    'discount' => (float) $discount,
                    'tax_rate' => $taxRate,
                ];
            }

            if (empty($items)) {
                throw ValidationException::withMessages(['file' => 'The CSV file contains no valid rows.']);
            }

            $this->persistItems($sale, $items);

            return $sale->fresh(['items.product', 'customer', 'warehouse']);
        });
    }
}
