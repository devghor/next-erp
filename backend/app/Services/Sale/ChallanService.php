<?php

namespace App\Services\Sale;

use App\Models\Sale\Challan;
use App\Models\Sale\ChallanPackingSlip;
use App\Models\Sale\PackingSlip;
use App\Models\Sale\Payment;
use App\Models\Settings\Company;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ChallanService implements ChallanServiceInterface
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
        return Challan::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->with(['courier', 'createdBy', 'closedBy', 'packingSlips.packingSlip.sale.customer'])
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('challans.status', $status))
            ->when($filters['courier_id'] ?? null, fn (Builder $query, string $courierId) => $query->where('challans.courier_id', $courierId));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('challans.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    public function findScoped(int $id): Challan
    {
        return $this->baseScopedQuery()
            ->with(['courier', 'createdBy', 'closedBy', 'packingSlips.packingSlip.sale.customer'])
            ->where('challans.id', $id)
            ->firstOrFail();
    }

    protected function nextReferenceNo(): string
    {
        $count = $this->baseScopedQuery()->count();

        return 'DC-'.(1001 + $count);
    }

    protected function resolvePaymentStatus(float $grandTotal, float $paidAmount): string
    {
        if ($paidAmount <= 0) {
            return 'due';
        }

        return $paidAmount >= $grandTotal ? 'paid' : 'partial';
    }

    /**
     * Packing slips still waiting to be handed to a courier.
     */
    public function availablePackingSlips(): Collection
    {
        return PackingSlip::query()
            ->where('company_id', $this->activeCompany()->id)
            ->where('status', 'pending')
            ->with(['sale.customer'])
            ->get();
    }

    /**
     * @param  array{courier_id?: int|null, packing_slip_ids: array<int, int>}  $data
     */
    public function create(array $data): Challan
    {
        return DB::transaction(function () use ($data) {
            $packingSlips = PackingSlip::query()
                ->where('company_id', $this->activeCompany()->id)
                ->whereIn('id', $data['packing_slip_ids'])
                ->get();

            if ($packingSlips->count() !== count($data['packing_slip_ids'])) {
                throw ValidationException::withMessages([
                    'packing_slip_ids' => 'One or more selected packing slips could not be found.',
                ]);
            }

            foreach ($packingSlips as $packingSlip) {
                if ($packingSlip->status !== 'pending') {
                    throw ValidationException::withMessages([
                        'packing_slip_ids' => "Packing slip {$packingSlip->reference_no} is not pending — close its previous challan first.",
                    ]);
                }
            }

            $challan = Challan::create([
                'company_id' => $this->activeCompany()->id,
                'reference_no' => $this->nextReferenceNo(),
                'courier_id' => $data['courier_id'] ?? null,
                'status' => 'active',
                'created_by_id' => $this->currentUserId(),
            ]);

            foreach ($packingSlips as $packingSlip) {
                ChallanPackingSlip::create([
                    'challan_id' => $challan->id,
                    'packing_slip_id' => $packingSlip->id,
                    'amount' => $packingSlip->amount,
                    'status' => 'pending',
                ]);

                $packingSlip->update(['status' => 'in_transit']);
            }

            return $challan->fresh(['courier', 'packingSlips.packingSlip.sale.customer']);
        });
    }

    /**
     * COD reconciliation: collect payments per packing slip's sale (capped at
     * the sale's outstanding due), mark each row delivered/cancelled, and
     * auto-close the challan once every row has been resolved.
     *
     * @param  array{payments: array<int, array{challan_packing_slip_id: int, status: string, paid_amount?: float, delivery_charge?: float}>}  $data
     */
    public function finalize(int $id, array $data): Challan
    {
        return DB::transaction(function () use ($id, $data) {
            $challan = $this->baseScopedQuery()->where('challans.id', $id)->lockForUpdate()->firstOrFail();

            if ($challan->status !== 'active') {
                throw ValidationException::withMessages([
                    'status' => 'This challan is already closed.',
                ]);
            }

            foreach ($data['payments'] as $row) {
                /** @var ChallanPackingSlip $challanPackingSlip */
                $challanPackingSlip = ChallanPackingSlip::query()
                    ->where('challan_id', $challan->id)
                    ->where('id', $row['challan_packing_slip_id'])
                    ->firstOrFail();

                $sale = $challanPackingSlip->packingSlip->sale;
                $outstandingDue = max(0.0, (float) $sale->grand_total - (float) $sale->paid_amount);
                $requestedAmount = (float) ($row['paid_amount'] ?? 0);
                $cappedAmount = min($requestedAmount, $outstandingDue);

                if ($cappedAmount > 0) {
                    Payment::create([
                        'company_id' => $this->activeCompany()->id,
                        'payment_reference' => 'SPR-'.now()->format('Ymd').'-'.now()->format('His').'-'.random_int(100, 999),
                        'sale_id' => $sale->id,
                        'user_id' => $this->currentUserId(),
                        'amount' => $cappedAmount,
                        'paying_method' => 'Cash',
                        'payment_note' => "COD collection via challan {$challan->reference_no}",
                    ]);

                    $sale->update(['paid_amount' => (float) $sale->paid_amount + $cappedAmount]);
                    $sale->refresh();
                    $sale->update(['payment_status' => $this->resolvePaymentStatus((float) $sale->grand_total, (float) $sale->paid_amount)]);
                }

                $status = in_array($row['status'], ['delivered', 'cancelled'], true) ? $row['status'] : 'pending';

                $challanPackingSlip->update([
                    'status' => $status,
                    'paid_amount' => (float) $challanPackingSlip->paid_amount + $cappedAmount,
                    'delivery_charge' => (float) ($row['delivery_charge'] ?? $challanPackingSlip->delivery_charge),
                ]);

                $challanPackingSlip->packingSlip->update([
                    'status' => $status === 'delivered' ? 'delivered' : ($status === 'cancelled' ? 'pending' : 'in_transit'),
                ]);
            }

            $challan->refresh();
            $stillPending = $challan->packingSlips()->where('status', 'pending')->exists();

            if (! $stillPending) {
                $challan->update([
                    'status' => 'close',
                    'closing_date' => now(),
                    'closed_by_id' => $this->currentUserId(),
                ]);
            }

            return $challan->fresh(['courier', 'createdBy', 'closedBy', 'packingSlips.packingSlip.sale.customer']);
        });
    }
}
