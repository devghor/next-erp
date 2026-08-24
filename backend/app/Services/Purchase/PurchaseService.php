<?php

namespace App\Services\Purchase;

use App\Models\Product\Product;
use App\Models\Product\ProductWarehouse;
use App\Models\Product\Unit;
use App\Models\Purchase\Payment;
use App\Models\Purchase\ProductPurchase;
use App\Models\Purchase\Purchase;
use App\Models\Settings\Company;
use App\Models\Settings\Tax;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PurchaseService implements PurchaseServiceInterface
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
        return Purchase::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()->with(['supplier', 'warehouse', 'items.product'])
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(purchases.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['reference_no'] ?? null, fn (Builder $query, string $ref) => $query->where('purchases.reference_no', 'like', "%{$ref}%"))
            ->when($filters['supplier_id'] ?? null, fn (Builder $query, string $id) => $query->where('purchases.supplier_id', $id))
            ->when($filters['warehouse_id'] ?? null, fn (Builder $query, string $id) => $query->where('purchases.warehouse_id', $id))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('purchases.status', $status))
            ->when($filters['payment_status'] ?? null, fn (Builder $query, string $status) => $query->where('purchases.payment_status', $status))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('purchases.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('purchases.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('purchases.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('purchases.created_at')
            ->get();
    }

    /**
     * @param  array{qty: float, net_unit_cost: float, discount?: float, tax_rate?: float}  $item
     * @return array{tax: float, total: float}
     */
    protected function computeItemTotals(array $item): array
    {
        $qty = (float) $item['qty'];
        $netUnitCost = (float) $item['net_unit_cost'];
        $discount = (float) ($item['discount'] ?? 0);
        $taxRate = (float) ($item['tax_rate'] ?? 0);

        $subTotal = ($qty * $netUnitCost) - $discount;
        $tax = round($subTotal * ($taxRate / 100), 2);

        return [
            'tax' => $tax,
            'total' => round($subTotal + $tax, 2),
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    protected function persistItems(Purchase $purchase, array $items): void
    {
        $totalQty = 0.0;
        $totalDiscount = 0.0;
        $totalTax = 0.0;
        $totalCost = 0.0;

        foreach ($items as $item) {
            $totals = $this->computeItemTotals($item);

            ProductPurchase::create([
                'purchase_id' => $purchase->id,
                'product_id' => $item['product_id'],
                'variant_id' => $item['variant_id'] ?? null,
                'batch_id' => $item['batch_id'] ?? null,
                'purchase_unit_id' => $item['purchase_unit_id'] ?? null,
                'qty' => $item['qty'],
                'received' => $item['received'] ?? $item['qty'],
                'net_unit_cost' => $item['net_unit_cost'],
                'discount' => $item['discount'] ?? 0,
                'tax_rate' => $item['tax_rate'] ?? 0,
                'tax' => $totals['tax'],
                'total' => $totals['total'],
            ]);

            $this->incrementStock(
                (int) $item['product_id'],
                $item['variant_id'] ?? null,
                $item['batch_id'] ?? null,
                $purchase->warehouse_id,
                (float) ($item['received'] ?? $item['qty']),
            );

            $totalQty += (float) ($item['received'] ?? $item['qty']);
            $totalDiscount += (float) ($item['discount'] ?? 0);
            $totalTax += $totals['tax'];
            $totalCost += $totals['total'];
        }

        $purchase->update([
            'total_qty' => $totalQty,
            'total_discount' => $totalDiscount,
            'total_tax' => $totalTax,
            'total_cost' => $totalCost,
            'grand_total' => $totalCost + $purchase->order_tax,
        ]);
    }

    protected function incrementStock(int $productId, ?int $variantId, ?int $batchId, int $warehouseId, float $qty): void
    {
        $stock = ProductWarehouse::firstOrNew([
            'product_id' => $productId,
            'variant_id' => $variantId,
            'batch_id' => $batchId,
            'warehouse_id' => $warehouseId,
        ]);
        $stock->qty = ($stock->qty ?? 0) + $qty;
        $stock->save();
    }

    protected function reverseStock(Purchase $purchase): void
    {
        foreach ($purchase->items as $item) {
            $this->incrementStock(
                $item->product_id,
                $item->variant_id,
                $item->batch_id,
                $purchase->warehouse_id,
                -1 * (float) $item->received,
            );
        }
    }

    protected function recordPayment(Purchase $purchase, float $paidAmount, string $payingMethod): void
    {
        if ($paidAmount <= 0) {
            return;
        }

        Payment::create([
            'company_id' => $this->activeCompany()->id,
            'payment_reference' => 'PPR-'.now()->format('Ymd').'-'.now()->format('His'),
            'purchase_id' => $purchase->id,
            'user_id' => $this->currentUserId(),
            'amount' => $paidAmount,
            'change' => 0,
            'paying_method' => $payingMethod,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Purchase
    {
        return DB::transaction(function () use ($data) {
            $paidAmount = (float) ($data['paid_amount'] ?? 0);

            $purchase = Purchase::create([
                'company_id' => $this->activeCompany()->id,
                'reference_no' => $data['reference_no'] ?? ('PR-'.now()->format('Ymd').'-'.now()->format('His')),
                'supplier_id' => $data['supplier_id'] ?? null,
                'warehouse_id' => $data['warehouse_id'],
                'user_id' => $this->currentUserId(),
                'status' => $data['status'] ?? 'received',
                'order_tax' => $data['order_tax'] ?? 0,
                'paid_amount' => $paidAmount,
                'note' => $data['note'] ?? null,
            ]);

            $this->persistItems($purchase, $data['items']);

            $purchase->refresh();
            $purchase->update([
                'payment_status' => $paidAmount >= (float) $purchase->grand_total ? 'paid' : ($paidAmount > 0 ? 'partial' : 'due'),
            ]);

            $this->recordPayment($purchase, $paidAmount, $data['paying_method'] ?? 'Cash');

            return $purchase->load(['items', 'supplier', 'warehouse', 'payments']);
        });
    }

    public function findScoped(int $id): Purchase
    {
        return $this->baseScopedQuery()
            ->with(['supplier', 'warehouse', 'items.product', 'items.variant', 'items.batch', 'payments'])
            ->where('purchases.id', $id)
            ->firstOrFail();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): Purchase
    {
        return DB::transaction(function () use ($id, $data) {
            $purchase = $this->findScoped($id);

            $this->reverseStock($purchase);
            $purchase->items()->delete();

            $purchase->update([
                'supplier_id' => $data['supplier_id'] ?? $purchase->supplier_id,
                'warehouse_id' => $data['warehouse_id'] ?? $purchase->warehouse_id,
                'status' => $data['status'] ?? $purchase->status,
                'order_tax' => $data['order_tax'] ?? $purchase->order_tax,
                'note' => $data['note'] ?? $purchase->note,
            ]);

            $this->persistItems($purchase, $data['items']);

            $paidAmount = (float) ($data['paid_amount'] ?? $purchase->paid_amount);
            $purchase->refresh();
            $purchase->update([
                'paid_amount' => $paidAmount,
                'payment_status' => $paidAmount >= (float) $purchase->grand_total ? 'paid' : ($paidAmount > 0 ? 'partial' : 'due'),
            ]);

            return $purchase->load(['items', 'supplier', 'warehouse', 'payments']);
        });
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $purchase = $this->findScoped($id);
            $this->reverseStock($purchase);
            $purchase->delete();
        });
    }

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int
    {
        return DB::transaction(function () use ($ids) {
            $purchases = $this->baseScopedQuery()->whereIn('purchases.id', $ids)->get();
            foreach ($purchases as $purchase) {
                $this->reverseStock($purchase);
                $purchase->delete();
            }

            return $purchases->count();
        });
    }

    /**
     * CSV columns (no header row): product_code, qty, unit_code (or 'n/a'), cost, discount_per_unit, tax_name (or 'No Tax').
     * Any row failure rolls back the whole import with a row-numbered error message.
     *
     * @param  array{warehouse_id: int, supplier_id?: int|null, status?: string, order_tax?: float, paid_amount?: float, paying_method?: string, note?: string|null}  $meta
     */
    public function importCsv(UploadedFile $file, array $meta): Purchase
    {
        return DB::transaction(function () use ($file, $meta) {
            $rows = array_map('str_getcsv', file($file->getRealPath()));
            $status = $meta['status'] ?? 'received';
            $paidAmount = (float) ($meta['paid_amount'] ?? 0);

            $purchase = Purchase::create([
                'company_id' => $this->activeCompany()->id,
                'reference_no' => 'PR-'.now()->format('Ymd').'-'.now()->format('His'),
                'supplier_id' => $meta['supplier_id'] ?? null,
                'warehouse_id' => $meta['warehouse_id'],
                'user_id' => $this->currentUserId(),
                'status' => $status,
                'order_tax' => (float) ($meta['order_tax'] ?? 0),
                'paid_amount' => $paidAmount,
                'note' => $meta['note'] ?? null,
            ]);

            $items = [];
            $rowNumber = 0;

            foreach ($rows as $row) {
                $rowNumber++;
                if (count($row) < 6 || $row[0] === '') {
                    continue;
                }

                [$code, $qty, $unitCode, $cost, $discount, $taxName] = array_map('trim', $row);

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

                $lineQty = (float) $qty;
                $lineDiscount = $lineQty * (float) $discount;

                $items[] = [
                    'product_id' => $product->id,
                    'purchase_unit_id' => $unitId,
                    'qty' => $lineQty,
                    'received' => $lineQty,
                    'net_unit_cost' => (float) $cost,
                    'discount' => $lineDiscount,
                    'tax_rate' => $taxRate,
                ];
            }

            if (empty($items)) {
                throw ValidationException::withMessages(['file' => 'The CSV file contains no valid rows.']);
            }

            $this->persistItems($purchase, $items);

            $purchase->refresh();
            $purchase->update([
                'payment_status' => $paidAmount >= (float) $purchase->grand_total ? 'paid' : ($paidAmount > 0 ? 'partial' : 'due'),
            ]);

            $this->recordPayment($purchase, $paidAmount, $meta['paying_method'] ?? 'Cash');

            return $purchase->fresh(['items', 'supplier', 'warehouse']);
        });
    }

    /**
     * @param  array<int, array{warehouse_id: int, qty: float}>  $lines
     * @return array<int, Purchase>
     */
    public function receiveInitialStock(Product $product, array $lines): array
    {
        return DB::transaction(function () use ($product, $lines) {
            $purchases = [];

            foreach ($lines as $line) {
                if ((float) $line['qty'] <= 0) {
                    continue;
                }

                $purchases[] = $this->create([
                    'warehouse_id' => $line['warehouse_id'],
                    'paid_amount' => $product->cost * $line['qty'],
                    'items' => [[
                        'product_id' => $product->id,
                        'net_unit_cost' => $product->cost,
                        'qty' => $line['qty'],
                        'received' => $line['qty'],
                    ]],
                ]);
            }

            return $purchases;
        });
    }
}
