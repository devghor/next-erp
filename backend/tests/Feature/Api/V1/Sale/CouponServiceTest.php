<?php

namespace Tests\Feature\Api\V1\Sale;

use App\Models\Settings\Company;
use App\Services\Sale\CouponService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * No HTTP/auth test harness (Sanctum + tenancy + Spatie permission bootstrapping)
 * exists anywhere in this repo yet, so this exercises the service layer directly
 * against the tenancy-initialized `tenant()` context, same as the controller does.
 *
 * Resolved via the concrete class rather than CouponServiceInterface: the
 * interface binding lands in app/Providers/AppServiceProvider.php, which is a
 * shared file applied centrally once all Sale-domain forks have reported
 * their bindings (see this module's PR notes) — the concrete class needs no
 * binding and exercises identical code.
 */
class CouponServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_and_lists_coupons_scoped_to_the_active_company(): void
    {
        $company = Company::create(['name' => 'Test Co']);
        tenancy()->initialize($company);

        $service = app(CouponService::class);

        $coupon = $service->create([
            'code' => 'SAVE10',
            'type' => 'fixed',
            'amount' => 10,
            'minimum_amount' => 50,
            'quantity' => 5,
            'expired_date' => now()->addMonth()->toDateString(),
        ]);

        $this->assertSame('SAVE10', $coupon->code);
        $this->assertSame($company->id, $coupon->company_id);
        $this->assertSame(0, $coupon->used);
        $this->assertTrue($coupon->is_active);

        $list = $service->list([]);
        $this->assertCount(1, $list->items());
        $this->assertSame('SAVE10', $list->items()[0]->code);
    }

    public function test_percentage_type_forces_minimum_amount_to_zero_on_update(): void
    {
        $company = Company::create(['name' => 'Test Co']);
        tenancy()->initialize($company);

        $service = app(CouponService::class);
        $coupon = $service->create([
            'code' => 'SAVE20',
            'type' => 'fixed',
            'amount' => 20,
            'minimum_amount' => 100,
            'quantity' => 1,
            'expired_date' => now()->addMonth()->toDateString(),
        ]);

        $updated = $service->update($coupon->id, [
            'code' => 'SAVE20',
            'type' => 'percentage',
            'amount' => 15,
            'minimum_amount' => 100,
            'quantity' => 1,
            'expired_date' => now()->addMonth()->toDateString(),
        ]);

        $this->assertSame('percentage', $updated->type);
        $this->assertEquals(0, $updated->minimum_amount);
    }

    public function test_validate_for_sale_rejects_below_minimum_and_applies_fixed_discount(): void
    {
        $company = Company::create(['name' => 'Test Co']);
        tenancy()->initialize($company);

        $service = app(CouponService::class);
        $coupon = $service->create([
            'code' => 'SAVE30',
            'type' => 'fixed',
            'amount' => 30,
            'minimum_amount' => 100,
            'quantity' => 1,
            'expired_date' => now()->addMonth()->toDateString(),
        ]);

        $belowMinimum = $service->validateForSale($coupon, 50);
        $this->assertFalse($belowMinimum['valid']);

        $eligible = $service->validateForSale($coupon, 150);
        $this->assertTrue($eligible['valid']);
        $this->assertEquals(30, $eligible['discount']);
    }

    public function test_delete_soft_deactivates_instead_of_removing_the_row(): void
    {
        $company = Company::create(['name' => 'Test Co']);
        tenancy()->initialize($company);

        $service = app(CouponService::class);
        $coupon = $service->create([
            'code' => 'SAVE40',
            'type' => 'fixed',
            'amount' => 40,
            'quantity' => 1,
            'expired_date' => now()->addMonth()->toDateString(),
        ]);

        $service->delete($coupon->id);

        $this->assertDatabaseHas('coupons', [
            'id' => $coupon->id,
            'is_active' => false,
        ]);
    }
}
