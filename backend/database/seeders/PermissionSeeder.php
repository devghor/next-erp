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
