<?php

namespace App\Services\Sale;

use App\Models\Sale\Installment;
use App\Models\Sale\InstallmentPlan;
use App\Models\Sale\Payment;
use App\Models\Sale\Sale;
use App\Models\Settings\Company;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InstallmentPlanService implements InstallmentPlanServiceInterface
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
        return InstallmentPlan::query()
            ->whereHas('sale', fn (Builder $query) => $query->where('company_id', $this->activeCompany()->id));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->baseScopedQuery()
            ->with(['sale.customer', 'installments'])
            ->orderByDesc('sale_installment_plans.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    public function findScoped(int $id): InstallmentPlan
    {
        return $this->baseScopedQuery()
            ->with(['sale.customer', 'installments'])
            ->where('sale_installment_plans.id', $id)
            ->firstOrFail();
    }

    public function findInstallmentScoped(int $installmentId): Installment
    {
        return Installment::query()
            ->whereHas('plan.sale', fn (Builder $query) => $query->where('company_id', $this->activeCompany()->id))
            ->with('plan.sale')
            ->where('sale_installments.id', $installmentId)
            ->firstOrFail();
    }

    /**
     * @param  array{name: string, price: float, additional_amount?: float, down_payment?: float, months: int}  $data
     */
    public function createForSale(Sale $sale, array $data): InstallmentPlan
    {
        $price = (float) $data['price'];
        $additionalAmount = (float) ($data['additional_amount'] ?? 0);
        $downPayment = (float) ($data['down_payment'] ?? 0);
        $months = (int) $data['months'];
        $totalAmount = $price + $additionalAmount;

        $plan = InstallmentPlan::create([
            'sale_id' => $sale->id,
            'name' => $data['name'],
            'price' => $price,
            'additional_amount' => $additionalAmount,
            'total_amount' => $totalAmount,
            'down_payment' => $downPayment,
            'months' => $months,
        ]);

        $perInstallment = $months > 0 ? round(($totalAmount - $downPayment) / $months, 2) : 0;
        $baseDate = $sale->created_at ?? now();

        for ($i = 1; $i <= $months; $i++) {
            Installment::create([
                'installment_plan_id' => $plan->id,
                'status' => 'pending',
                'payment_date' => $baseDate->copy()->addMonths($i),
                'amount' => $perInstallment,
            ]);
        }

        return $plan->fresh('installments');
    }

    protected function resolvePaymentStatus(float $grandTotal, float $paidAmount): string
    {
        if ($paidAmount <= 0) {
            return 'due';
        }

        return $paidAmount >= $grandTotal ? 'paid' : 'partial';
    }

    /**
     * @param  array{amount?: float, paying_method?: string, account_id?: int|null, cheque_no?: string|null, payment_note?: string|null}  $paymentData
     */
    public function payInstallment(int $installmentId, array $paymentData): Payment
    {
        return DB::transaction(function () use ($installmentId, $paymentData) {
            $installment = $this->findInstallmentScoped($installmentId);
            $plan = $installment->plan;
            $sale = $plan->sale;

            $amount = (float) ($paymentData['amount'] ?? $installment->amount);

            $payment = Payment::create([
                'company_id' => $this->activeCompany()->id,
                'payment_reference' => 'SPR-'.now()->format('Ymd').'-'.now()->format('His').'-'.random_int(100, 999),
                'sale_id' => $sale->id,
                'installment_id' => $installment->id,
                'user_id' => $this->currentUserId(),
                'account_id' => $paymentData['account_id'] ?? null,
                'amount' => $amount,
                'paying_method' => $paymentData['paying_method'] ?? 'Cash',
                'cheque_no' => $paymentData['cheque_no'] ?? null,
                'payment_note' => $paymentData['payment_note'] ?? null,
            ]);

            $installment->update([
                'status' => 'completed',
                'payment_date' => now()->toDateString(),
            ]);

            $sale->update(['paid_amount' => (float) $sale->paid_amount + $amount]);
            $sale->refresh();
            $sale->update(['payment_status' => $this->resolvePaymentStatus((float) $sale->grand_total, (float) $sale->paid_amount)]);

            return $payment;
        });
    }
}
