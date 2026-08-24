<?php

namespace Tests\Feature\Api\V1\Sale;

use App\Models\People\Customer;
use App\Models\Product\Category;
use App\Models\Product\Product;
use App\Models\Product\ProductWarehouse;
use App\Models\Sale\Courier;
use App\Models\Settings\Company;
use App\Models\Settings\Warehouse;
use App\Services\Sale\ChallanService;
use App\Services\Sale\InstallmentPlanService;
use App\Services\Sale\PackingSlipService;
use App\Services\Sale\SaleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * No HTTP/auth test harness exists yet — exercises the service layer directly
 * against the tenancy-initialized `tenant()` context, matching the sibling
 * Sales-module tests (see PackingSlipServiceTest for the same fixture shape).
 */
class ChallanServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUpPackedSale(float $price = 10, float $qty = 5): array
    {
        $company = Company::create(['name' => 'Test Co']);
        tenancy()->initialize($company);

        $customer = Customer::create(['company_id' => $company->id, 'name' => 'Jane']);
        $warehouse = Warehouse::create(['company_id' => $company->id, 'name' => 'Main']);
        $category = Category::create(['company_id' => $company->id, 'name' => 'General']);
        $product = Product::create([
            'company_id' => $company->id,
            'category_id' => $category->id,
            'name' => 'Widget',
            'code' => 'W-1',
            'price' => $price,
        ]);

        ProductWarehouse::create([
            'product_id' => $product->id,
            'warehouse_id' => $warehouse->id,
            'qty' => 100,
        ]);

        $saleService = new SaleService(new InstallmentPlanService);
        $sale = $saleService->create([
            'customer_id' => $customer->id,
            'warehouse_id' => $warehouse->id,
            'sale_status' => 'completed',
            'items' => [
                ['product_id' => $product->id, 'qty' => $qty, 'net_unit_price' => $price],
            ],
        ]);

        $packingSlipService = new PackingSlipService;
        $line = $sale->items()->first();
        $packingSlip = $packingSlipService->create([
            'sale_id' => $sale->id,
            'lines' => [
                ['product_sale_id' => $line->id, 'product_id' => $product->id],
            ],
        ]);

        $courier = Courier::create(['company_id' => $company->id, 'name' => 'Local Rider', 'type' => 'manual']);

        return compact('company', 'sale', 'packingSlip', 'courier');
    }

    public function test_creating_a_challan_marks_the_packing_slip_in_transit(): void
    {
        ['packingSlip' => $packingSlip, 'courier' => $courier] = $this->setUpPackedSale();

        $service = new ChallanService;
        $challan = $service->create([
            'courier_id' => $courier->id,
            'packing_slip_ids' => [$packingSlip->id],
        ]);

        $this->assertSame('active', $challan->status);
        $this->assertSame('in_transit', $packingSlip->fresh()->status);
        $this->assertCount(1, $challan->packingSlips);
        $this->assertEquals(50, $challan->packingSlips->first()->amount); // 5 * 10
    }

    public function test_finalize_caps_cod_collection_at_the_sales_outstanding_due_and_closes_the_challan(): void
    {
        ['sale' => $sale, 'packingSlip' => $packingSlip, 'courier' => $courier] = $this->setUpPackedSale(price: 10, qty: 5);
        // Sale grand_total is 50, nothing paid yet — outstanding due is 50.

        $service = new ChallanService;
        $challan = $service->create([
            'courier_id' => $courier->id,
            'packing_slip_ids' => [$packingSlip->id],
        ]);

        $challanPackingSlipId = $challan->packingSlips->first()->id;

        // Courier tries to hand over 999 (a data-entry mistake) — must cap at the
        // sale's actual outstanding due (50), never collect more than is owed.
        $finalized = $service->finalize($challan->id, [
            'payments' => [
                ['challan_packing_slip_id' => $challanPackingSlipId, 'status' => 'delivered', 'paid_amount' => 999],
            ],
        ]);

        $sale->refresh();
        $this->assertEquals(50, $sale->paid_amount);
        $this->assertSame('paid', $sale->payment_status);

        $this->assertSame('close', $finalized->status);
        $this->assertNotNull($finalized->closing_date);
        $this->assertSame('delivered', $packingSlip->fresh()->status);
        $this->assertEquals(50, $finalized->packingSlips->first()->paid_amount);
    }
}
