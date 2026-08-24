<?php

namespace Tests\Feature\Api\V1\Sale;

use App\Models\People\Customer;
use App\Models\Product\Category;
use App\Models\Product\Product;
use App\Models\Product\ProductWarehouse;
use App\Models\Settings\Company;
use App\Models\Settings\Warehouse;
use App\Services\Sale\SaleReturnService;
use App\Services\Sale\SaleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * No HTTP/auth test harness (Sanctum + tenancy + Spatie permission bootstrapping)
 * exists anywhere in this repo yet, so this exercises the service layer directly
 * against the tenancy-initialized `tenant()` context, same as the controller does.
 * Instantiated directly rather than resolved via the container, since the
 * SaleReturnServiceInterface binding is applied centrally after all Sales-module
 * forks land.
 */
class SaleReturnServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUpPaidSaleWithOneItem(): array
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

        $saleService = app(SaleService::class);
        $sale = $saleService->create([
            'customer_id' => $customer->id,
            'warehouse_id' => $warehouse->id,
            'sale_status' => 'completed',
            'items' => [
                ['product_id' => $product->id, 'qty' => 5, 'net_unit_price' => 10],
            ],
            'payments' => [
                ['amount' => 50, 'paying_method' => 'Cash'],
            ],
        ]);

        return compact('company', 'warehouse', 'product', 'sale');
    }

    public function test_creating_a_return_with_refund_restores_stock_and_creates_a_refund_payment(): void
    {
        ['warehouse' => $warehouse, 'product' => $product, 'sale' => $sale] = $this->setUpPaidSaleWithOneItem();

        $stockBeforeReturn = ProductWarehouse::query()
            ->where('product_id', $product->id)
            ->where('warehouse_id', $warehouse->id)
            ->value('qty');
        $this->assertEquals(95, $stockBeforeReturn);

        $service = new SaleReturnService;
        $line = $sale->items()->first();

        $return = $service->create([
            'sale_id' => $sale->id,
            'lines' => [
                ['product_sale_id' => $line->id, 'qty' => 2],
            ],
            'refund' => true,
        ]);

        $this->assertSame('sale_returns', $return->getTable());
        $this->assertEquals(20, $return->grand_total); // 2 * 10
        $this->assertEquals(20, $return->refund_amount);
        $this->assertEquals(2, $line->fresh()->return_qty);

        $stockAfterReturn = ProductWarehouse::query()
            ->where('product_id', $product->id)
            ->where('warehouse_id', $warehouse->id)
            ->value('qty');
        $this->assertEquals(97, $stockAfterReturn); // 95 + 2 restored

        $this->assertDatabaseHas('sale_payments', [
            'return_id' => $return->id,
            'amount' => 20,
        ]);
    }

    public function test_deleting_a_return_reverses_stock_restoration_and_the_refund_payment(): void
    {
        ['warehouse' => $warehouse, 'product' => $product, 'sale' => $sale] = $this->setUpPaidSaleWithOneItem();

        $service = new SaleReturnService;
        $line = $sale->items()->first();

        $return = $service->create([
            'sale_id' => $sale->id,
            'lines' => [
                ['product_sale_id' => $line->id, 'qty' => 2],
            ],
            'refund' => true,
        ]);

        $service->delete($return->id);

        $this->assertEquals(0, $line->fresh()->return_qty);

        $stockAfterDelete = ProductWarehouse::query()
            ->where('product_id', $product->id)
            ->where('warehouse_id', $warehouse->id)
            ->value('qty');
        $this->assertEquals(95, $stockAfterDelete); // back to post-sale level

        $this->assertDatabaseMissing('sale_returns', ['id' => $return->id]);
        $this->assertDatabaseMissing('sale_payments', ['return_id' => $return->id]);
    }
}
