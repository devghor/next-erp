<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Settings\PermissionResource;
use App\Models\Settings\Permission;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
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
