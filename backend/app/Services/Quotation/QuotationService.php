<?php

namespace App\Services\Quotation;

use App\Enums\Media\MediaCollectionEnum;
use App\Mail\QuotationDetails;
use App\Models\Quotation\ProductQuotation;
use App\Models\Quotation\Quotation;
use App\Models\Settings\Company;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class QuotationService implements QuotationServiceInterface
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
        return Quotation::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()->with(['customer', 'warehouse', 'biller', 'items.product'])
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(quotations.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['reference_no'] ?? null, fn (Builder $query, string $ref) => $query->where('quotations.reference_no', 'like', "%{$ref}%"))
            ->when($filters['customer_id'] ?? null, fn (Builder $query, string $id) => $query->where('quotations.customer_id', $id))
            ->when($filters['warehouse_id'] ?? null, fn (Builder $query, string $id) => $query->where('quotations.warehouse_id', $id))
            ->when($filters['biller_id'] ?? null, fn (Builder $query, string $id) => $query->where('quotations.biller_id', $id))
            ->when($filters['quotation_status'] ?? null, fn (Builder $query, string $status) => $query->where('quotations.quotation_status', $status))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('quotations.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('quotations.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('quotations.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('quotations.created_at')
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

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    protected function persistItems(Quotation $quotation, array $items): void
    {
        $totalQty = 0.0;
        $totalDiscount = 0.0;
        $totalTax = 0.0;
        $totalPrice = 0.0;

        foreach ($items as $item) {
            $totals = $this->computeItemTotals($item);

            ProductQuotation::create([
                'quotation_id' => $quotation->id,
                'product_id' => $item['product_id'],
                'variant_id' => $item['variant_id'] ?? null,
                'batch_id' => $item['batch_id'] ?? null,
                'quotation_unit_id' => $item['quotation_unit_id'] ?? null,
                'qty' => $item['qty'],
                'net_unit_price' => $item['net_unit_price'],
                'discount' => $item['discount'] ?? 0,
                'tax_rate' => $item['tax_rate'] ?? 0,
                'tax' => $totals['tax'],
                'total' => $totals['total'],
            ]);

            $totalQty += (float) $item['qty'];
            $totalDiscount += (float) ($item['discount'] ?? 0);
            $totalTax += $totals['tax'];
            $totalPrice += $totals['total'];
        }

        $quotation->update([
            'item' => count($items),
            'total_qty' => $totalQty,
            'total_discount' => $totalDiscount,
            'total_tax' => $totalTax,
            'total_price' => $totalPrice,
            'grand_total' => $totalPrice + (float) $quotation->order_tax + (float) $quotation->shipping_cost - (float) $quotation->order_discount,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function syncDocument(Quotation $quotation, array $data): void
    {
        if (empty($data['document'])) {
            return;
        }

        $quotation->addMedia($data['document'])
            ->toMediaCollection(MediaCollectionEnum::QuotationQuotationsDocument->value);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Quotation
    {
        $quotation = DB::transaction(function () use ($data) {
            $quotation = Quotation::create([
                'company_id' => $this->activeCompany()->id,
                'reference_no' => $data['reference_no'] ?? ('QT-'.now()->format('Ymd').'-'.now()->format('His')),
                'customer_id' => $data['customer_id'],
                'warehouse_id' => $data['warehouse_id'],
                'biller_id' => $data['biller_id'] ?? null,
                'supplier_id' => $data['supplier_id'] ?? null,
                'user_id' => $this->currentUserId(),
                'order_tax_rate' => $data['order_tax_rate'] ?? null,
                'order_tax' => $data['order_tax'] ?? 0,
                'order_discount' => $data['order_discount'] ?? 0,
                'shipping_cost' => $data['shipping_cost'] ?? 0,
                'quotation_status' => $data['quotation_status'] ?? 'pending',
                'note' => $data['note'] ?? null,
            ]);

            $this->persistItems($quotation, $data['items']);
            $this->syncDocument($quotation, $data);

            return $quotation;
        });

        if ($quotation->quotation_status === 'sent') {
            try {
                $this->sendMail($quotation->id);
            } catch (\Throwable $e) {
                Log::error('Failed to send quotation mail on create: '.$e->getMessage());
            }
        }

        return $quotation->load(['items', 'customer', 'warehouse', 'biller', 'supplier']);
    }

    public function findScoped(int $id): Quotation
    {
        return $this->baseScopedQuery()
            ->with(['customer', 'warehouse', 'biller', 'supplier', 'items.product', 'items.variant', 'items.batch'])
            ->where('quotations.id', $id)
            ->firstOrFail();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): Quotation
    {
        return DB::transaction(function () use ($id, $data) {
            $quotation = $this->findScoped($id);

            $quotation->items()->delete();

            $quotation->update([
                'customer_id' => $data['customer_id'] ?? $quotation->customer_id,
                'warehouse_id' => $data['warehouse_id'] ?? $quotation->warehouse_id,
                'biller_id' => $data['biller_id'] ?? $quotation->biller_id,
                'supplier_id' => $data['supplier_id'] ?? $quotation->supplier_id,
                'order_tax_rate' => $data['order_tax_rate'] ?? $quotation->order_tax_rate,
                'order_tax' => $data['order_tax'] ?? $quotation->order_tax,
                'order_discount' => $data['order_discount'] ?? $quotation->order_discount,
                'shipping_cost' => $data['shipping_cost'] ?? $quotation->shipping_cost,
                'quotation_status' => $data['quotation_status'] ?? $quotation->quotation_status,
                'note' => $data['note'] ?? $quotation->note,
            ]);

            $this->persistItems($quotation, $data['items']);
            $this->syncDocument($quotation, $data);

            return $quotation->fresh(['items', 'customer', 'warehouse', 'biller', 'supplier']);
        });
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $this->findScoped($id)->delete();
        });
    }

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int
    {
        return DB::transaction(function () use ($ids) {
            $quotations = $this->baseScopedQuery()->whereIn('quotations.id', $ids)->get();
            foreach ($quotations as $quotation) {
                $quotation->delete();
            }

            return $quotations->count();
        });
    }

    public function sendMail(int $id): void
    {
        $quotation = $this->baseScopedQuery()
            ->with(['customer', 'items.product'])
            ->where('quotations.id', $id)
            ->firstOrFail();

        if (empty($quotation->customer?->email)) {
            throw ValidationException::withMessages(['customer_id' => 'This customer has no email address to send the quotation to.']);
        }

        Mail::to($quotation->customer->email)->send(new QuotationDetails($quotation));
    }
}
