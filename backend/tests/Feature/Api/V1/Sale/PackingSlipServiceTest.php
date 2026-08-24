<?php

namespace Tests\Feature\Api\V1\Sale;

use App\Models\People\Customer;
use App\Models\Product\Category;
use App\Models\Product\Product;
use App\Models\Product\ProductWarehouse;
use App\Models\Settings\Company;
use App\Models\Settings\Warehouse;
use App\Services\Sale\InstallmentPlanService;
use App\Services\Sale\PackingSlipService;
use App\Services\Sale\SaleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * No HTTP/auth test harness (Sanctum + tenancy + Spatie permission bootstrapping)
 * exists anywhere in this repo yet, so this exercises the service layer directly
 * against the tenancy-initialized `tenant()` context, same as the controller does.
 * Instantiated directly rather than resolved via the container, since the
 * PackingSlipServiceInterface binding is applied centrally after all Sales-module
 * forks land.
 */
class PackingSlipServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUpSaleWithOneItem(): array
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
            'price' => 10,
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
                ['product_id' => $product->id, 'qty' => 5, 'net_unit_price' => 10],
            ],
        ]);

        return compact('company', 'warehouse', 'product', 'sale');
    }

    public function test_creating_a_packing_slip_marks_lines_packed_and_deducts_stock_a_second_time(): void
    {
        ['warehouse' => $warehouse, 'product' => $product, 'sale' => $sale] = $this->setUpSaleWithOneItem();

        $stockBeforePacking = ProductWarehouse::query()
            ->where('product_id', $product->id)
            ->where('warehouse_id', $warehouse->id)
            ->value('qty');

        $this->assertEquals(95, $stockBeforePacking); // 100 - 5 (sale-time deduction)

        $service = new PackingSlipService;
        $line = $sale->items()->first();

        $packingSlip = $service->create([
            'sale_id' => $sale->id,
            'lines' => [
                ['product_sale_id' => $line->id, 'product_id' => $product->id],
            ],
        ]);

        $this->assertSame('pending', $packingSlip->status);
        $this->assertEquals(50, $packingSlip->amount); // 5 * 10
        $this->assertTrue($line->fresh()->is_packing);

        $stockAfterPacking = ProductWarehouse::query()
            ->where('product_id', $product->id)
            ->where('warehouse_id', $warehouse->id)
            ->value('qty');

        $this->assertEquals(90, $stockAfterPacking); // second, packing-time deduction
    }

    public function test_deleting_a_pending_packing_slip_restores_stock_and_unmarks_the_line(): void
    {
        ['warehouse' => $warehouse, 'product' => $product, 'sale' => $sale] = $this->setUpSaleWithOneItem();

        $service = new PackingSlipService;
        $line = $sale->items()->first();

        $packingSlip = $service->create([
            'sale_id' => $sale->id,
            'lines' => [
                ['product_sale_id' => $line->id, 'product_id' => $product->id],
            ],
        ]);

        $service->delete($packingSlip->id);

        $this->assertFalse($line->fresh()->is_packing);

        $stockAfterDelete = ProductWarehouse::query()
            ->where('product_id', $product->id)
            ->where('warehouse_id', $warehouse->id)
            ->value('qty');

        $this->assertEquals(95, $stockAfterDelete); // back to post-sale, pre-packing level

        $this->assertDatabaseMissing('packing_slips', ['id' => $packingSlip->id]);
    }
}
