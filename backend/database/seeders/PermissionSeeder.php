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
