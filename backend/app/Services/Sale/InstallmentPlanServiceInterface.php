<?php

namespace App\Services\Sale;

use App\Models\Sale\Installment;
use App\Models\Sale\InstallmentPlan;
use App\Models\Sale\Payment;
use App\Models\Sale\Sale;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface InstallmentPlanServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator;

    public function findScoped(int $id): InstallmentPlan;

    /**
     * @param  array{name: string, price: float, additional_amount?: float, down_payment?: float, months: int}  $data
     */
    public function createForSale(Sale $sale, array $data): InstallmentPlan;

    /**
     * @param  array{amount?: float, paying_method?: string, account_id?: int|null, cheque_no?: string|null, payment_note?: string|null}  $paymentData
     */
    public function payInstallment(int $installmentId, array $paymentData): Payment;

    public function findInstallmentScoped(int $installmentId): Installment;
}
