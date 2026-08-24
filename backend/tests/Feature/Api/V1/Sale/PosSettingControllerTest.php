<?php

namespace Tests\Feature\Api\V1\Sale;

use App\Http\Controllers\Api\V1\Sale\PosSettingController;
use App\Models\Settings\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

/**
 * No HTTP/auth test harness exists yet in this repo (see SaleReturnServiceTest
 * for precedent) — exercises the controller directly against a
 * tenancy-initialized company, same as the route would after
 * auth:sanctum + InitializeTenancyByRequestData run.
 */
class PosSettingControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function makeCompany(): Company
    {
        $company = Company::create(['name' => 'Test Co']);
        tenancy()->initialize($company);

        return $company;
    }

    public function test_show_creates_a_default_settings_row_for_the_tenant(): void
    {
        $company = $this->makeCompany();

        $setting = (new PosSettingController)->show();

        $this->assertSame($company->id, $setting->company_id);
        $this->assertSame(25, $setting->product_number);
        $this->assertFalse($setting->keyboard_active);
        $this->assertTrue($setting->play_sound);
        $this->assertSame('80mm', $setting->thermal_invoice_size);
        $this->assertDatabaseHas('pos_settings', ['company_id' => $company->id]);
    }

    public function test_update_persists_valid_fields(): void
    {
        $this->makeCompany();

        $request = Request::create('/sale/pos/settings', 'PUT', [
            'product_number' => 40,
            'keyboard_active' => true,
            'play_sound' => false,
            'thermal_invoice_size' => '58mm',
            'payment_options' => ['cash', 'stripe'],
        ]);

        $setting = (new PosSettingController)->update($request);

        $this->assertSame(40, $setting->product_number);
        $this->assertTrue($setting->keyboard_active);
        $this->assertFalse($setting->play_sound);
        $this->assertSame('58mm', $setting->thermal_invoice_size);
        $this->assertSame(['cash', 'stripe'], $setting->payment_options);
    }

    public function test_update_rejects_an_invalid_thermal_invoice_size(): void
    {
        $this->makeCompany();

        $request = Request::create('/sale/pos/settings', 'PUT', [
            'thermal_invoice_size' => '110mm',
        ]);

        $this->expectException(ValidationException::class);

        (new PosSettingController)->update($request);
    }
}
