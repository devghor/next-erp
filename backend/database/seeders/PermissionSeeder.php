<?php

namespace Database\Seeders;

use App\Enums\Settings\PermissionEnum;
use App\Models\Settings\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    const LABEL_READ_ALL = 'Read All';

    const LABEL_CREATE = 'Create';

    const LABEL_READ = 'Read';

    const LABEL_UPDATE = 'Update';

    const LABEL_DELETE = 'Delete';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $permissions = [
            // Dashboard
            ['module' => 'General', 'group' => 'Overview > Dashboard', 'name' => PermissionEnum::ReadDashboardOverview->value, 'label' => self::LABEL_READ],

            /**
             * Uam Module
             */

            // User
            ['module' => 'Settings', 'group' => 'Settings > Users', 'name' => PermissionEnum::ListSettingsUsers->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Settings', 'group' => 'Settings > Users', 'name' => PermissionEnum::CreateSettingsUsers->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Settings', 'group' => 'Settings > Users', 'name' => PermissionEnum::ReadSettingsUsers->value, 'label' => self::LABEL_READ],
            ['module' => 'Settings', 'group' => 'Settings > Users', 'name' => PermissionEnum::UpdateSettingsUsers->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Settings', 'group' => 'Settings > Users', 'name' => PermissionEnum::DeleteSettingsUsers->value, 'label' => self::LABEL_DELETE],

            // Role
            ['module' => 'Settings', 'group' => 'Settings > Roles', 'name' => PermissionEnum::ListSettingsRoles->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Settings', 'group' => 'Settings > Roles', 'name' => PermissionEnum::CreateSettingsRoles->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Settings', 'group' => 'Settings > Roles', 'name' => PermissionEnum::ReadSettingsRoles->value, 'label' => self::LABEL_READ],
            ['module' => 'Settings', 'group' => 'Settings > Roles', 'name' => PermissionEnum::UpdateSettingsRoles->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Settings', 'group' => 'Settings > Roles', 'name' => PermissionEnum::DeleteSettingsRoles->value, 'label' => self::LABEL_DELETE],

            // Warehouse
            ['module' => 'Settings', 'group' => 'Settings > Warehouses', 'name' => PermissionEnum::ListSettingsWarehouses->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Settings', 'group' => 'Settings > Warehouses', 'name' => PermissionEnum::CreateSettingsWarehouses->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Settings', 'group' => 'Settings > Warehouses', 'name' => PermissionEnum::ReadSettingsWarehouses->value, 'label' => self::LABEL_READ],
            ['module' => 'Settings', 'group' => 'Settings > Warehouses', 'name' => PermissionEnum::UpdateSettingsWarehouses->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Settings', 'group' => 'Settings > Warehouses', 'name' => PermissionEnum::DeleteSettingsWarehouses->value, 'label' => self::LABEL_DELETE],

            // Currency
            ['module' => 'Settings', 'group' => 'Settings > Currencies', 'name' => PermissionEnum::ListSettingsCurrencies->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Settings', 'group' => 'Settings > Currencies', 'name' => PermissionEnum::CreateSettingsCurrencies->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Settings', 'group' => 'Settings > Currencies', 'name' => PermissionEnum::ReadSettingsCurrencies->value, 'label' => self::LABEL_READ],
            ['module' => 'Settings', 'group' => 'Settings > Currencies', 'name' => PermissionEnum::UpdateSettingsCurrencies->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Settings', 'group' => 'Settings > Currencies', 'name' => PermissionEnum::DeleteSettingsCurrencies->value, 'label' => self::LABEL_DELETE],

            // Tax
            ['module' => 'Settings', 'group' => 'Settings > Taxes', 'name' => PermissionEnum::ListSettingsTaxes->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Settings', 'group' => 'Settings > Taxes', 'name' => PermissionEnum::CreateSettingsTaxes->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Settings', 'group' => 'Settings > Taxes', 'name' => PermissionEnum::ReadSettingsTaxes->value, 'label' => self::LABEL_READ],
            ['module' => 'Settings', 'group' => 'Settings > Taxes', 'name' => PermissionEnum::UpdateSettingsTaxes->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Settings', 'group' => 'Settings > Taxes', 'name' => PermissionEnum::DeleteSettingsTaxes->value, 'label' => self::LABEL_DELETE],

            // Category
            ['module' => 'Product', 'group' => 'Product > Categories', 'name' => PermissionEnum::ListProductCategories->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Product', 'group' => 'Product > Categories', 'name' => PermissionEnum::CreateProductCategories->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Product', 'group' => 'Product > Categories', 'name' => PermissionEnum::ReadProductCategories->value, 'label' => self::LABEL_READ],
            ['module' => 'Product', 'group' => 'Product > Categories', 'name' => PermissionEnum::UpdateProductCategories->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Product', 'group' => 'Product > Categories', 'name' => PermissionEnum::DeleteProductCategories->value, 'label' => self::LABEL_DELETE],

            // Brand
            ['module' => 'Product', 'group' => 'Product > Brands', 'name' => PermissionEnum::ListProductBrands->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Product', 'group' => 'Product > Brands', 'name' => PermissionEnum::CreateProductBrands->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Product', 'group' => 'Product > Brands', 'name' => PermissionEnum::ReadProductBrands->value, 'label' => self::LABEL_READ],
            ['module' => 'Product', 'group' => 'Product > Brands', 'name' => PermissionEnum::UpdateProductBrands->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Product', 'group' => 'Product > Brands', 'name' => PermissionEnum::DeleteProductBrands->value, 'label' => self::LABEL_DELETE],

            // Unit
            ['module' => 'Product', 'group' => 'Product > Units', 'name' => PermissionEnum::ListProductUnits->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Product', 'group' => 'Product > Units', 'name' => PermissionEnum::CreateProductUnits->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Product', 'group' => 'Product > Units', 'name' => PermissionEnum::ReadProductUnits->value, 'label' => self::LABEL_READ],
            ['module' => 'Product', 'group' => 'Product > Units', 'name' => PermissionEnum::UpdateProductUnits->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Product', 'group' => 'Product > Units', 'name' => PermissionEnum::DeleteProductUnits->value, 'label' => self::LABEL_DELETE],

            // Adjustment
            ['module' => 'Product', 'group' => 'Product > Adjustments', 'name' => PermissionEnum::ListProductAdjustments->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Product', 'group' => 'Product > Adjustments', 'name' => PermissionEnum::CreateProductAdjustments->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Product', 'group' => 'Product > Adjustments', 'name' => PermissionEnum::ReadProductAdjustments->value, 'label' => self::LABEL_READ],
            ['module' => 'Product', 'group' => 'Product > Adjustments', 'name' => PermissionEnum::UpdateProductAdjustments->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Product', 'group' => 'Product > Adjustments', 'name' => PermissionEnum::DeleteProductAdjustments->value, 'label' => self::LABEL_DELETE],

            // Stock Count
            ['module' => 'Product', 'group' => 'Product > Stock Counts', 'name' => PermissionEnum::ListProductStockCounts->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Product', 'group' => 'Product > Stock Counts', 'name' => PermissionEnum::CreateProductStockCounts->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Product', 'group' => 'Product > Stock Counts', 'name' => PermissionEnum::ReadProductStockCounts->value, 'label' => self::LABEL_READ],
            ['module' => 'Product', 'group' => 'Product > Stock Counts', 'name' => PermissionEnum::UpdateProductStockCounts->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Product', 'group' => 'Product > Stock Counts', 'name' => PermissionEnum::DeleteProductStockCounts->value, 'label' => self::LABEL_DELETE],

            // Damage Stock
            ['module' => 'Product', 'group' => 'Product > Damage Stocks', 'name' => PermissionEnum::ListProductDamageStocks->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Product', 'group' => 'Product > Damage Stocks', 'name' => PermissionEnum::CreateProductDamageStocks->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Product', 'group' => 'Product > Damage Stocks', 'name' => PermissionEnum::ReadProductDamageStocks->value, 'label' => self::LABEL_READ],
            ['module' => 'Product', 'group' => 'Product > Damage Stocks', 'name' => PermissionEnum::UpdateProductDamageStocks->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Product', 'group' => 'Product > Damage Stocks', 'name' => PermissionEnum::DeleteProductDamageStocks->value, 'label' => self::LABEL_DELETE],

            // Supplier
            ['module' => 'People', 'group' => 'People > Suppliers', 'name' => PermissionEnum::ListPeopleSuppliers->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'People', 'group' => 'People > Suppliers', 'name' => PermissionEnum::CreatePeopleSuppliers->value, 'label' => self::LABEL_CREATE],
            ['module' => 'People', 'group' => 'People > Suppliers', 'name' => PermissionEnum::ReadPeopleSuppliers->value, 'label' => self::LABEL_READ],
            ['module' => 'People', 'group' => 'People > Suppliers', 'name' => PermissionEnum::UpdatePeopleSuppliers->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'People', 'group' => 'People > Suppliers', 'name' => PermissionEnum::DeletePeopleSuppliers->value, 'label' => self::LABEL_DELETE],

            // Customer
            ['module' => 'People', 'group' => 'People > Customers', 'name' => PermissionEnum::ListPeopleCustomers->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'People', 'group' => 'People > Customers', 'name' => PermissionEnum::CreatePeopleCustomers->value, 'label' => self::LABEL_CREATE],
            ['module' => 'People', 'group' => 'People > Customers', 'name' => PermissionEnum::ReadPeopleCustomers->value, 'label' => self::LABEL_READ],
            ['module' => 'People', 'group' => 'People > Customers', 'name' => PermissionEnum::UpdatePeopleCustomers->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'People', 'group' => 'People > Customers', 'name' => PermissionEnum::DeletePeopleCustomers->value, 'label' => self::LABEL_DELETE],

            // Sale Agent
            ['module' => 'People', 'group' => 'People > Sale Agents', 'name' => PermissionEnum::ListPeopleSaleAgents->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'People', 'group' => 'People > Sale Agents', 'name' => PermissionEnum::CreatePeopleSaleAgents->value, 'label' => self::LABEL_CREATE],
            ['module' => 'People', 'group' => 'People > Sale Agents', 'name' => PermissionEnum::ReadPeopleSaleAgents->value, 'label' => self::LABEL_READ],
            ['module' => 'People', 'group' => 'People > Sale Agents', 'name' => PermissionEnum::UpdatePeopleSaleAgents->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'People', 'group' => 'People > Sale Agents', 'name' => PermissionEnum::DeletePeopleSaleAgents->value, 'label' => self::LABEL_DELETE],

            // Biller
            ['module' => 'People', 'group' => 'People > Billers', 'name' => PermissionEnum::ListPeopleBillers->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'People', 'group' => 'People > Billers', 'name' => PermissionEnum::CreatePeopleBillers->value, 'label' => self::LABEL_CREATE],
            ['module' => 'People', 'group' => 'People > Billers', 'name' => PermissionEnum::ReadPeopleBillers->value, 'label' => self::LABEL_READ],
            ['module' => 'People', 'group' => 'People > Billers', 'name' => PermissionEnum::UpdatePeopleBillers->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'People', 'group' => 'People > Billers', 'name' => PermissionEnum::DeletePeopleBillers->value, 'label' => self::LABEL_DELETE],

            // Purchase
            ['module' => 'Purchase', 'group' => 'Purchase > Purchases', 'name' => PermissionEnum::ListPurchasePurchases->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Purchase', 'group' => 'Purchase > Purchases', 'name' => PermissionEnum::CreatePurchasePurchases->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Purchase', 'group' => 'Purchase > Purchases', 'name' => PermissionEnum::ReadPurchasePurchases->value, 'label' => self::LABEL_READ],
            ['module' => 'Purchase', 'group' => 'Purchase > Purchases', 'name' => PermissionEnum::UpdatePurchasePurchases->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Purchase', 'group' => 'Purchase > Purchases', 'name' => PermissionEnum::DeletePurchasePurchases->value, 'label' => self::LABEL_DELETE],

            // Sale
            ['module' => 'Sale', 'group' => 'Sale > Sales', 'name' => PermissionEnum::ListSaleSales->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Sale', 'group' => 'Sale > Sales', 'name' => PermissionEnum::CreateSaleSales->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Sale', 'group' => 'Sale > Sales', 'name' => PermissionEnum::ReadSaleSales->value, 'label' => self::LABEL_READ],
            ['module' => 'Sale', 'group' => 'Sale > Sales', 'name' => PermissionEnum::UpdateSaleSales->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Sale', 'group' => 'Sale > Sales', 'name' => PermissionEnum::DeleteSaleSales->value, 'label' => self::LABEL_DELETE],

            // Gift Cards
            ['module' => 'Sale', 'group' => 'Sale > Gift Cards', 'name' => PermissionEnum::ListSaleGiftCards->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Sale', 'group' => 'Sale > Gift Cards', 'name' => PermissionEnum::CreateSaleGiftCards->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Sale', 'group' => 'Sale > Gift Cards', 'name' => PermissionEnum::ReadSaleGiftCards->value, 'label' => self::LABEL_READ],
            ['module' => 'Sale', 'group' => 'Sale > Gift Cards', 'name' => PermissionEnum::UpdateSaleGiftCards->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Sale', 'group' => 'Sale > Gift Cards', 'name' => PermissionEnum::DeleteSaleGiftCards->value, 'label' => self::LABEL_DELETE],

            // Coupons
            ['module' => 'Sale', 'group' => 'Sale > Coupons', 'name' => PermissionEnum::ListSaleCoupons->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Sale', 'group' => 'Sale > Coupons', 'name' => PermissionEnum::CreateSaleCoupons->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Sale', 'group' => 'Sale > Coupons', 'name' => PermissionEnum::ReadSaleCoupons->value, 'label' => self::LABEL_READ],
            ['module' => 'Sale', 'group' => 'Sale > Coupons', 'name' => PermissionEnum::UpdateSaleCoupons->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Sale', 'group' => 'Sale > Coupons', 'name' => PermissionEnum::DeleteSaleCoupons->value, 'label' => self::LABEL_DELETE],

            // Couriers
            ['module' => 'Sale', 'group' => 'Sale > Couriers', 'name' => PermissionEnum::ListSaleCouriers->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Sale', 'group' => 'Sale > Couriers', 'name' => PermissionEnum::CreateSaleCouriers->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Sale', 'group' => 'Sale > Couriers', 'name' => PermissionEnum::ReadSaleCouriers->value, 'label' => self::LABEL_READ],
            ['module' => 'Sale', 'group' => 'Sale > Couriers', 'name' => PermissionEnum::UpdateSaleCouriers->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Sale', 'group' => 'Sale > Couriers', 'name' => PermissionEnum::DeleteSaleCouriers->value, 'label' => self::LABEL_DELETE],

            // Installment Plans
            ['module' => 'Sale', 'group' => 'Sale > Installment Plans', 'name' => PermissionEnum::ListSaleInstallmentPlans->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Sale', 'group' => 'Sale > Installment Plans', 'name' => PermissionEnum::ReadSaleInstallmentPlans->value, 'label' => self::LABEL_READ],
            ['module' => 'Sale', 'group' => 'Sale > Installment Plans', 'name' => PermissionEnum::UpdateSaleInstallmentPlans->value, 'label' => self::LABEL_UPDATE],

            // Packing Slips
            ['module' => 'Sale', 'group' => 'Sale > Packing Slips', 'name' => PermissionEnum::ListSalePackingSlips->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Sale', 'group' => 'Sale > Packing Slips', 'name' => PermissionEnum::CreateSalePackingSlips->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Sale', 'group' => 'Sale > Packing Slips', 'name' => PermissionEnum::ReadSalePackingSlips->value, 'label' => self::LABEL_READ],
            ['module' => 'Sale', 'group' => 'Sale > Packing Slips', 'name' => PermissionEnum::DeleteSalePackingSlips->value, 'label' => self::LABEL_DELETE],

            // Deliveries
            ['module' => 'Sale', 'group' => 'Sale > Deliveries', 'name' => PermissionEnum::ListSaleDeliveries->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Sale', 'group' => 'Sale > Deliveries', 'name' => PermissionEnum::CreateSaleDeliveries->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Sale', 'group' => 'Sale > Deliveries', 'name' => PermissionEnum::ReadSaleDeliveries->value, 'label' => self::LABEL_READ],
            ['module' => 'Sale', 'group' => 'Sale > Deliveries', 'name' => PermissionEnum::UpdateSaleDeliveries->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Sale', 'group' => 'Sale > Deliveries', 'name' => PermissionEnum::DeleteSaleDeliveries->value, 'label' => self::LABEL_DELETE],

            // Sale Returns
            ['module' => 'Sale', 'group' => 'Sale > Sale Returns', 'name' => PermissionEnum::ListSaleSaleReturns->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Sale', 'group' => 'Sale > Sale Returns', 'name' => PermissionEnum::CreateSaleSaleReturns->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Sale', 'group' => 'Sale > Sale Returns', 'name' => PermissionEnum::ReadSaleSaleReturns->value, 'label' => self::LABEL_READ],
            ['module' => 'Sale', 'group' => 'Sale > Sale Returns', 'name' => PermissionEnum::DeleteSaleSaleReturns->value, 'label' => self::LABEL_DELETE],

            // Sale Exchanges
            ['module' => 'Sale', 'group' => 'Sale > Sale Exchanges', 'name' => PermissionEnum::ListSaleExchanges->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Sale', 'group' => 'Sale > Sale Exchanges', 'name' => PermissionEnum::CreateSaleExchanges->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Sale', 'group' => 'Sale > Sale Exchanges', 'name' => PermissionEnum::ReadSaleExchanges->value, 'label' => self::LABEL_READ],

            // Challans
            ['module' => 'Sale', 'group' => 'Sale > Challans', 'name' => PermissionEnum::ListSaleChallans->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Sale', 'group' => 'Sale > Challans', 'name' => PermissionEnum::CreateSaleChallans->value, 'label' => self::LABEL_CREATE],
            ['module' => 'Sale', 'group' => 'Sale > Challans', 'name' => PermissionEnum::ReadSaleChallans->value, 'label' => self::LABEL_READ],
            ['module' => 'Sale', 'group' => 'Sale > Challans', 'name' => PermissionEnum::UpdateSaleChallans->value, 'label' => self::LABEL_UPDATE],

            // POS
            ['module' => 'Sale', 'group' => 'Sale > POS', 'name' => PermissionEnum::AccessSalePos->value, 'label' => 'Access'],
            ['module' => 'Sale', 'group' => 'Sale > POS', 'name' => PermissionEnum::ReadSalePosSettings->value, 'label' => self::LABEL_READ],
            ['module' => 'Sale', 'group' => 'Sale > POS', 'name' => PermissionEnum::UpdateSalePosSettings->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Sale', 'group' => 'Sale > POS', 'name' => PermissionEnum::ManageSaleCashRegister->value, 'label' => 'Manage Cash Register'],

            // Notifications
            ['module' => 'Notification', 'group' => 'Notifications', 'name' => PermissionEnum::ListNotifications->value, 'label' => self::LABEL_READ_ALL],
            ['module' => 'Notification', 'group' => 'Notifications', 'name' => PermissionEnum::UpdateNotifications->value, 'label' => self::LABEL_UPDATE],
            ['module' => 'Notification', 'group' => 'Notifications', 'name' => PermissionEnum::DeleteNotifications->value, 'label' => self::LABEL_DELETE],

        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['name' => $permission['name']],
                [
                    'guard_name' => 'sanctum',
                    'module' => $permission['module'],
                    'group' => $permission['group'],
                    'label' => $permission['label'],
                ]
            );
        }

        // Delete permissions not in code
        Permission::whereNotIn('name', array_column($permissions, 'name'))->delete();
    }
}
