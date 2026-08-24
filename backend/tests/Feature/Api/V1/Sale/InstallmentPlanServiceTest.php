<?php

namespace Tests\Feature\Api\V1\Sale;

use App\Models\People\Customer;
use App\Models\Sale\Sale;
use App\Models\Settings\Company;
use App\Models\Settings\Warehouse;
use App\Services\Sale\InstallmentPlanServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * No HTTP/auth test harness exists yet, so this exercises the service layer
 * directly against the tenancy-initialized `tenant()` context, matching the
 * pattern used by the other Sale-domain service tests.
 */
class InstallmentPlanServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function makeSale(Company $company): Sale
    {
        $customer = Customer::create(['company_id' => $company->id, 'name' => 'Test Customer']);
        $warehouse = Warehouse::create(['company_id' => $company->id, 'name' => 'Main Warehouse']);

        return Sale::create([
            'company_id' => $company->id,
            'reference_no' => 'SR-TEST-'.uniqid(),
            'customer_id' => $customer->id,
            'warehouse_id' => $warehouse->id,
            'sale_status' => 'completed',
            'grand_total' => 1200,
            'paid_amount' => 0,
            'payment_status' => 'due',
        ]);
    }

    public function test_it_generates_an_even_monthly_schedule(): void
    {
        $company = Company::create(['name' => 'Test Co']);
        tenancy()->initialize($company);
        $sale = $this->makeSale($company);

        $service = app(InstallmentPlanServiceInterface::class);

        $plan = $service->createForSale($sale, [
            'name' => 'Laptop Plan',
            'price' => 1000,
            'additional_amount' => 200,
            'down_payment' => 200,
            'months' => 3,
        ]);

        $this->assertEquals(1200, $plan->total_amount);
        $this->assertCount(3, $plan->installments);
        foreach ($plan->installments as $installment) {
            $this->assertEquals(round((1200 - 200) / 3, 2), (float) $installment->amount);
            $this->assertSame('pending', $installment->status);
        }
    }

    public function test_paying_an_installment_marks_it_completed_and_updates_sale_paid_amount(): void
    {
        $company = Company::create(['name' => 'Test Co']);
        tenancy()->initialize($company);
        $sale = $this->makeSale($company);

        $service = app(InstallmentPlanServiceInterface::class);
        $plan = $service->createForSale($sale, [
            'name' => 'Phone Plan',
            'price' => 900,
            'months' => 3,
        ]);

        $installment = $plan->installments->first();
        $service->payInstallment($installment->id, ['paying_method' => 'Cash']);

        $installment->refresh();
        $sale->refresh();

        $this->assertSame('completed', $installment->status);
        $this->assertEquals(300, (float) $sale->paid_amount);
        $this->assertSame('partial', $sale->payment_status);
        $this->assertDatabaseHas('sale_payments', [
            'installment_id' => $installment->id,
            'sale_id' => $sale->id,
            'amount' => 300,
        ]);
    }
}
