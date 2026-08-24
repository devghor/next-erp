<?php

namespace Tests\Feature\Api\V1\Sale;

use App\Models\People\Customer;
use App\Models\Product\Category;
use App\Models\Product\Product;
use App\Models\Product\ProductWarehouse;
use App\Models\Sale\Sale;
use App\Models\Settings\Company;
use App\Models\Settings\Warehouse;
use App\Services\Sale\SaleExchangeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

/**
 * No HTTP/auth test harness exists yet in this repo (see CouponServiceTest for
 * precedent) — exercises the service layer directly against a tenancy-initialized
 * company, same as the controller does.
 */
class SaleExchangeServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function makeFixtures(): array
    {
        $company = Company::create(['name' => 'Test Co']);
        tenancy()->initialize($company);

        $customer = Customer::create(['company_id' => $company->id, 'name' => 'Jane Doe']);
        $warehouse = Warehouse::create(['company_id' => $company->id, 'name' => 'Main WH']);
        $category = Category::create(['company_id' => $company->id, 'name' => 'General']);
        $product = Product::create([
            'company_id' => $company->id,
            'category_id' => $category->id,
            'name' => 'Widget',
            'code' => 'WID-1',
            'price' => 20,
        ]);

        ProductWarehouse::create([
            'product_id' => $product->id,
            'warehouse_id' => $warehouse->id,
            'qty' => 100,
        ]);

        return compact('company', 'customer', 'warehouse', 'product');
    }

    public function test_return_only_exchange_caps_refund_at_actual_overpayment_not_the_requested_amount(): void
    {
        ['customer' => $customer, 'warehouse' => $warehouse, 'product' => $product] = $this->makeFixtures();

        // A fully-paid sale: 2 units @ 50 = grand_total 100, paid in full.
        $sale = Sale::create([
            'company_id' => tenant()->id,
            'reference_no' => 'SR-TEST-1',
            'customer_id' => $customer->id,
            'warehouse_id' => $warehouse->id,
            'sale_status' => 'completed',
            'grand_total' => 100,
            'paid_amount' => 100,
            'payment_status' => 'paid',
        ]);

        $service = app(SaleExchangeService::class);

        // Customer returns 2 units @ 20 = 40 worth of product, no new items taken.
        // adjustedGrandTotal = max(0, 100 - 40 + 0) = 60. Customer actually overpaid
        // by (100 - 60) = 40, so even though they *request* a 500 refund, only 40
        // can actually be paid back.
        $exchange = $service->create([
            'sale_id' => $sale->id,
            'customer_id' => $customer->id,
            'warehouse_id' => $warehouse->id,
            'payment_type' => 'pay',
            'amount' => 500,
            'lines' => [
                [
                    'type' => 'returned',
                    'product_id' => $product->id,
                    'qty' => 2,
                    'net_unit_price' => 20,
                ],
            ],
        ]);

        $sale->refresh();

        $this->assertSame(40.0, (float) $exchange->amount, 'persisted amount must be capped to the actual overpayment, not the requested 500');
        $this->assertSame('pay', $exchange->payment_type);
        $this->assertSame(60.0, (float) $sale->grand_total);
        $this->assertSame(60.0, (float) $sale->paid_amount, 'paid_amount should drop by the capped 40, not the requested 500');
        $this->assertSame('paid', $sale->payment_status);

        // Stock was restored for the returned line.
        $stock = ProductWarehouse::query()->where('product_id', $product->id)->where('warehouse_id', $warehouse->id)->first();
        $this->assertSame(102.0, (float) $stock->qty);
    }

    public function test_refund_cap_nulls_payment_type_when_customer_did_not_actually_overpay(): void
    {
        ['customer' => $customer, 'warehouse' => $warehouse, 'product' => $product] = $this->makeFixtures();

        // Sale with a due balance (paid less than grand_total) — no overpayment exists at all.
        $sale = Sale::create([
            'company_id' => tenant()->id,
            'reference_no' => 'SR-TEST-2',
            'customer_id' => $customer->id,
            'warehouse_id' => $warehouse->id,
            'sale_status' => 'completed',
            'grand_total' => 100,
            'paid_amount' => 50,
            'payment_status' => 'partial',
        ]);

        $service = app(SaleExchangeService::class);

        // New item added worth 20 (no returns) -> adjustedGrandTotal = 120, paid_amount stays 50.
        // overpaidAfterExchange = max(0, 50 - 120) = 0, so a requested 'pay' of 30 must cap to 0.
        $exchange = $service->create([
            'sale_id' => $sale->id,
            'customer_id' => $customer->id,
            'warehouse_id' => $warehouse->id,
            'payment_type' => 'pay',
            'amount' => 30,
            'lines' => [
                [
                    'type' => 'new',
                    'product_id' => $product->id,
                    'qty' => 1,
                    'net_unit_price' => 20,
                ],
            ],
        ]);

        $sale->refresh();

        $this->assertSame(0.0, (float) $exchange->amount);
        $this->assertNull($exchange->payment_type);
        $this->assertSame(120.0, (float) $sale->grand_total);
        $this->assertSame(50.0, (float) $sale->paid_amount, 'paid_amount must be untouched — nothing was actually refundable');
    }

    public function test_new_line_rejects_when_stock_is_insufficient(): void
    {
        ['customer' => $customer, 'warehouse' => $warehouse, 'product' => $product] = $this->makeFixtures();

        $service = app(SaleExchangeService::class);

        $this->expectException(ValidationException::class);

        $service->create([
            'customer_id' => $customer->id,
            'warehouse_id' => $warehouse->id,
            'lines' => [
                [
                    'type' => 'new',
                    'product_id' => $product->id,
                    'qty' => 999999,
                    'net_unit_price' => 20,
                ],
            ],
        ]);
    }
}
