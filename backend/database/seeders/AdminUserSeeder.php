<?php

namespace Database\Seeders;

use App\Enums\Settings\PermissionEnum;
use App\Models\Settings\Company;
use App\Models\Settings\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'sa@app.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $c = Company::create([
                'name' => 'Intellygo',
                'short_name' => 'ig',
                'code' => 'INTELLYGO',
                'address' => '',
                'plan' => 'basic',
        ]);

        $c2 = Company::create([
                'name' => 'Intellygo 2',
                'short_name' => 'ig2',
                'code' => 'INTELLYGO2',
                'address' => '',
                'plan' => 'basic',
        ]);

        $user->companies()->attach($c->id);

        $user->companies()->attach($c2->id);

        setPermissionsTeamId($c->id);

        $role = Role::firstOrCreate(['name' => 'SUPER_ADMIN', 'company_id' => $c->id]);

        $role->getPermissionNames(PermissionEnum::cases());

        $user->assignRole($role);
    }
}
