<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Enums\Settings\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Settings\PermissionResource;
use App\Models\Settings\Permission;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class PermissionController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListSettingsRoles->value, only: ['index']),
        ];
    }

    public function index(): JsonResponse
    {
        $groups = Permission::query()
            ->orderBy('module')
            ->orderBy('group')
            ->orderBy('label')
            ->get()
            ->groupBy('group')
            ->map(fn ($items, $group) => [
                'group' => $group,
                'module' => $items->first()->module,
                'permissions' => PermissionResource::collection($items)->resolve(),
            ])
            ->values();

        return response()->json(['data' => $groups]);
    }
}
