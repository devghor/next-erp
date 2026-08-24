<?php

namespace Tests\Feature\Api\V1\Sale;

use App\Models\Settings\Company;
use App\Services\Sale\CourierService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * No HTTP/auth test harness (Sanctum + tenancy + Spatie permission bootstrapping)
 * exists anywhere in this repo yet, so this exercises the service layer directly
 * against the tenancy-initialized `tenant()` context, same as the controller does.
 * Instantiated directly rather than resolved via the container, since the
 * container binding is applied centrally after all Sales-module forks land.
 */
class CourierServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_and_lists_couriers_scoped_to_the_active_company(): void
    {
        $company = Company::create(['name' => 'Test Co']);
        tenancy()->initialize($company);

        $service = new CourierService;

        $courier = $service->create([
            'name' => 'Steadfast',
            'type' => 'steadfast',
            'api_key' => 'key',
            'secret_key' => 'secret',
        ]);

        $this->assertSame('Steadfast', $courier->name);
        $this->assertSame($company->id, $courier->company_id);
        $this->assertTrue($courier->is_active);

        $list = $service->list([]);
        $this->assertCount(1, $list->items());
        $this->assertSame('Steadfast', $list->items()[0]->name);
    }

    public function test_delete_deactivates_rather_than_hard_deletes(): void
    {
        $company = Company::create(['name' => 'Test Co']);
        tenancy()->initialize($company);

        $service = new CourierService;
        $courier = $service->create(['name' => 'Pathao', 'type' => 'pathao']);

        $service->delete($courier->id);

        $this->assertDatabaseHas('couriers', [
            'id' => $courier->id,
            'is_active' => false,
        ]);
    }
}
