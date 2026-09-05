<?php

namespace Tests\Feature\Api\V1\Quotation;

use App\Models\People\Customer;
use App\Models\Product\Category;
use App\Models\Product\Product;
use App\Models\Settings\Company;
use App\Models\Settings\Warehouse;
use App\Services\Quotation\QuotationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

/**
 * No HTTP/auth test harness (Sanctum + tenancy + Spatie permission bootstrapping)
 * exists anywhere in this repo yet, so this exercises the service layer directly
 * against the tenancy-initialized `tenant()` context, same as the controller does.
 * Instantiated directly rather than resolved via the container, since the
 * QuotationServiceInterface binding is applied centrally after all forks land.
 */
class QuotationServiceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{company: Company, customer: Customer, warehouse: Warehouse, product: Product}
     */
    protected function setUpCompanyWithCustomerAndProduct(?string $customerEmail = 'jane@example.com'): array
    {
        $company = Company::create(['name' => 'Test Co']);
        tenancy()->initialize($company);

        $customer = Customer::create(['company_id' => $company->id, 'name' => 'Jane', 'email' => $customerEmail]);
        $warehouse = Warehouse::create(['company_id' => $company->id, 'name' => 'Main']);
        $category = Category::create(['company_id' => $company->id, 'name' => 'General']);
        $product = Product::create([
            'company_id' => $company->id,
            'category_id' => $category->id,
            'name' => 'Widget',
            'code' => 'W-1',
            'price' => 10,
        ]);

        return compact('company', 'customer', 'warehouse', 'product');
    }

    public function test_it_creates_a_quotation_with_items_and_computes_totals(): void
    {
        ['customer' => $customer, 'warehouse' => $warehouse, 'product' => $product] = $this->setUpCompanyWithCustomerAndProduct();

        $service = new QuotationService;

        $quotation = $service->create([
            'customer_id' => $customer->id,
            'warehouse_id' => $warehouse->id,
            'items' => [
                ['product_id' => $product->id, 'qty' => 5, 'net_unit_price' => 10, 'discount' => 5, 'tax_rate' => 10],
            ],
        ]);

        $this->assertStringStartsWith('QT-', $quotation->reference_no);
        $this->assertSame('pending', $quotation->quotation_status);
        $this->assertSame(1, $quotation->item);
        $this->assertEquals(5, $quotation->total_qty);
        $this->assertEquals(5, $quotation->total_discount);
        $this->assertEquals(4.5, $quotation->total_tax); // (5*10 - 5) * 10%
        $this->assertEquals(49.5, $quotation->total_price); // 45 + 4.5
        $this->assertEquals(49.5, $quotation->grand_total); // + 0 order_tax + 0 shipping - 0 discount
    }

    public function test_list_is_scoped_to_the_active_company(): void
    {
        ['customer' => $customerA, 'warehouse' => $warehouseA, 'product' => $productA] = $this->setUpCompanyWithCustomerAndProduct();

        $service = new QuotationService;
        $service->create([
            'customer_id' => $customerA->id,
            'warehouse_id' => $warehouseA->id,
            'items' => [['product_id' => $productA->id, 'qty' => 1, 'net_unit_price' => 10]],
        ]);

        ['customer' => $customerB, 'warehouse' => $warehouseB, 'product' => $productB] = $this->setUpCompanyWithCustomerAndProduct();
        $service->create([
            'customer_id' => $customerB->id,
            'warehouse_id' => $warehouseB->id,
            'items' => [['product_id' => $productB->id, 'qty' => 2, 'net_unit_price' => 10]],
        ]);

        $list = $service->list([]);
        $this->assertCount(1, $list->items());
        $this->assertSame($customerB->id, $list->items()[0]->customer_id);
    }

    public function test_update_replaces_items_and_recomputes_totals(): void
    {
        ['customer' => $customer, 'warehouse' => $warehouse, 'product' => $product] = $this->setUpCompanyWithCustomerAndProduct();

        $service = new QuotationService;
        $quotation = $service->create([
            'customer_id' => $customer->id,
            'warehouse_id' => $warehouse->id,
            'items' => [['product_id' => $product->id, 'qty' => 5, 'net_unit_price' => 10]],
        ]);

        $updated = $service->update($quotation->id, [
            'customer_id' => $customer->id,
            'warehouse_id' => $warehouse->id,
            'items' => [['product_id' => $product->id, 'qty' => 2, 'net_unit_price' => 20]],
        ]);

        $this->assertCount(1, $updated->items);
        $this->assertEquals(2, $updated->total_qty);
        $this->assertEquals(40, $updated->total_price);
        $this->assertEquals(40, $updated->grand_total);
    }

    public function test_delete_soft_deletes_and_bulk_delete_removes_multiple(): void
    {
        ['customer' => $customer, 'warehouse' => $warehouse, 'product' => $product] = $this->setUpCompanyWithCustomerAndProduct();

        $service = new QuotationService;
        $quotationOne = $service->create([
            'customer_id' => $customer->id,
            'warehouse_id' => $warehouse->id,
            'items' => [['product_id' => $product->id, 'qty' => 1, 'net_unit_price' => 10]],
        ]);
        $quotationTwo = $service->create([
            'customer_id' => $customer->id,
            'warehouse_id' => $warehouse->id,
            'items' => [['product_id' => $product->id, 'qty' => 1, 'net_unit_price' => 10]],
        ]);

        $service->delete($quotationOne->id);
        $this->assertSoftDeleted('quotations', ['id' => $quotationOne->id]);

        $deletedCount = $service->bulkDelete([$quotationTwo->id]);
        $this->assertSame(1, $deletedCount);
        $this->assertSoftDeleted('quotations', ['id' => $quotationTwo->id]);
    }

    public function test_send_mail_throws_when_customer_has_no_email(): void
    {
        ['customer' => $customer, 'warehouse' => $warehouse, 'product' => $product] = $this->setUpCompanyWithCustomerAndProduct(customerEmail: null);

        $service = new QuotationService;
        $quotation = $service->create([
            'customer_id' => $customer->id,
            'warehouse_id' => $warehouse->id,
            'items' => [['product_id' => $product->id, 'qty' => 1, 'net_unit_price' => 10]],
        ]);

        $this->expectException(ValidationException::class);
        $service->sendMail($quotation->id);
    }
}
