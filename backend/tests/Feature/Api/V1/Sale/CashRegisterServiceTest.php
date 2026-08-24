<?php

namespace Tests\Feature\Api\V1\Sale;

use App\Models\People\Customer;
use App\Models\Sale\Payment;
use App\Models\Sale\Sale;
use App\Models\Settings\Company;
use App\Models\Settings\Warehouse;
use App\Models\User;
use App\Services\Sale\CashRegisterService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

/**
 * No HTTP/auth test harness exists yet in this repo (see SaleReturnServiceTest
 * for precedent) — exercises the service layer directly against a
 * tenancy-initialized company, same as CashRegisterController does.
 */
class CashRegisterServiceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{company: Company, warehouse: Warehouse, user: User}
     */
    protected function makeFixtures(): array
    {
        $company = Company::create(['name' => 'Test Co']);
        tenancy()->initialize($company);

        $warehouse = Warehouse::create(['company_id' => $company->id, 'name' => 'Main']);
        $user = User::factory()->create();
        Auth::login($user);

        return compact('company', 'warehouse', 'user');
    }

    public function test_opening_and_closing_a_register_computes_expected_amount_from_cash_payments(): void
    {
        ['company' => $company, 'warehouse' => $warehouse, 'user' => $user] = $this->makeFixtures();

        $service = app(CashRegisterService::class);

        $register = $service->open([
            'warehouse_id' => $warehouse->id,
            'opening_amount' => 100,
        ]);

        $this->assertSame('open', $register->status);
        $this->assertEquals(100, $register->opening_amount);
        $this->assertSame($user->id, $register->user_id);
        $this->assertNotNull($register->opened_at);

        $available = $service->checkAvailability($warehouse->id);
        $this->assertNotNull($available);
        $this->assertSame($register->id, $available->id);

        $customer = Customer::create(['company_id' => $company->id, 'name' => 'Jane']);
        $sale = Sale::create([
            'company_id' => $company->id,
            'reference_no' => 'SR-TEST-1',
            'customer_id' => $customer->id,
            'warehouse_id' => $warehouse->id,
            'cash_register_id' => $register->id,
            'sale_status' => 'completed',
            'grand_total' => 50,
            'paid_amount' => 50,
            'payment_status' => 'paid',
        ]);

        Payment::create([
            'company_id' => $company->id,
            'payment_reference' => 'SPR-TEST-1',
            'sale_id' => $sale->id,
            'amount' => 50,
            'paying_method' => 'Cash',
        ]);

        $closed = $service->close($register->id, ['closing_amount' => 145, 'note' => 'End of shift']);

        $this->assertSame('closed', $closed->status);
        $this->assertEquals(150, $closed->expected_amount); // 100 opening + 50 cash payment
        $this->assertEquals(145, $closed->closing_amount);
        $this->assertNotNull($closed->closed_at);

        $this->assertNull($service->checkAvailability($warehouse->id));
    }

    public function test_opening_a_second_register_for_the_same_warehouse_while_one_is_open_fails(): void
    {
        ['warehouse' => $warehouse] = $this->makeFixtures();

        $service = app(CashRegisterService::class);
        $service->open(['warehouse_id' => $warehouse->id, 'opening_amount' => 50]);

        $this->expectException(ValidationException::class);

        $service->open(['warehouse_id' => $warehouse->id, 'opening_amount' => 20]);
    }
}
