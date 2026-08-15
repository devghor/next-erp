<?php

namespace Database\Seeders;

use App\Models\Setting\Company\Company;
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
            ['email' => 'admin@app.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $c1 = Company::create(
            [
                'name' => 'Intellygo 1',
                'short_name' => 'IG1',
                'code' => 'INTELLYGO1',
                'address' => '',
                'plan' => 'basic',
            ]
        );

        $c2 = Company::create(
            [
                'name' => 'Intellygo 2',
                'short_name' => 'IG2',
                'code' => 'INTELLYGO2',
                'address' => '',
                'plan' => 'basic',
            ]
        );

        $user->companies()->attach($c1->id);

        $user->companies()->attach($c2->id);
    }
}
