<?php

namespace App\Http\Controllers\Api\V1\Sale;

use App\Http\Controllers\Controller;
use App\Models\Settings\SaleSetting;
use Illuminate\Http\Request;

class SaleSettingController extends Controller
{
    public function show(): SaleSetting
    {
        return SaleSetting::query()->firstOrCreate(['company_id' => tenant()->id]);
    }

    public function update(Request $request): SaleSetting
    {
        $data = $request->validate([
            'reward_points_active' => ['nullable', 'boolean'],
            'per_point_amount' => ['nullable', 'numeric', 'min:0'],
            'min_order_for_points' => ['nullable', 'numeric', 'min:0'],
            'point_expiry_days' => ['nullable', 'integer', 'min:0'],
            'default_account_id' => ['nullable', 'integer'],
        ]);

        $setting = SaleSetting::query()->firstOrCreate(['company_id' => tenant()->id]);
        $setting->update($data);

        return $setting;
    }
}
