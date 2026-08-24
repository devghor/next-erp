<?php

namespace Tests\Feature\Api\V1\Sale;

use App\Models\People\Customer;
use App\Models\Sale\Courier;
use App\Models\Sale\Sale;
use App\Models\Settings\Company;
use App\Models\Settings\Warehouse;
use App\Services\Courier\CourierManager;
use App\Services\Sale\DeliveryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * No HTTP/auth test harness (Sanctum + tenancy + Spatie permission bootstrapping)
 * exists anywhere in this repo yet, so this exercises the service layer directly
 * against the tenancy-initialized `tenant()` context, same as the controller does.
 *
 * Instantiates DeliveryService directly rather than resolving it via the
 * container: the AppServiceProvider binding for it is applied centrally by
 * the coordinator after this phase merges, and another concurrent fork was
 * observed mid-editing that shared file during this run.
 */
class DeliveryServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_manual_delivery_without_calling_any_courier_api(): void
    {
        $company = Company::create(['name' => 'Test Co']);
        tenancy()->initialize($company);

        $customer = Customer::create(['company_id' => $company->id, 'name' => 'Jane Doe', 'phone' => '0100000000']);
        $warehouse = Warehouse::create(['company_id' => $company->id, 'name' => 'Main WH']);
        $sale = Sale::create([
            'company_id' => $company->id,
            'reference_no' => 'SR-0001',
            'customer_id' => $customer->id,
            'warehouse_id' => $warehouse->id,
            'grand_total' => 100,
            'paid_amount' => 100,
        ]);

        $service = new DeliveryService;

        $delivery = $service->create([
            'sale_id' => $sale->id,
            'courier_id' => null,
            'address' => '123 Main St',
        ]);

        $this->assertSame($sale->id, $delivery->sale_id);
        $this->assertSame('packing', $delivery->status);
        $this->assertNull($delivery->tracking_code);
        $this->assertNotEmpty($delivery->reference_no);
        $this->assertDatabaseHas('deliveries', [
            'id' => $delivery->id,
            'sale_id' => $sale->id,
            'status' => 'packing',
        ]);
    }

    public function test_courier_manager_resolves_no_integration_for_manual_type(): void
    {
        $company = Company::create(['name' => 'Test Co']);
        tenancy()->initialize($company);

        $courier = Courier::create([
            'company_id' => $company->id,
            'name' => 'In-house',
            'type' => 'manual',
        ]);

        $this->assertNull(CourierManager::resolve($courier));
    }
}
