<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Enums\Settings\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Settings\BulkDeleteCustomFieldRequest;
use App\Http\Requests\Api\V1\Settings\StoreCustomFieldRequest;
use App\Http\Requests\Api\V1\Settings\UpdateCustomFieldRequest;
use App\Http\Resources\Api\V1\Settings\CustomFieldResource;
use App\Services\Settings\CustomFieldServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class CustomFieldController extends Controller implements HasMiddleware
{
    public function __construct(protected CustomFieldServiceInterface $customFieldService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListSettingsCustomFields->value, only: ['index']),
            new Middleware('permission:'.PermissionEnum::CreateSettingsCustomFields->value, only: ['store']),
            new Middleware('permission:'.PermissionEnum::ReadSettingsCustomFields->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateSettingsCustomFields->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeleteSettingsCustomFields->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return CustomFieldResource::collection(
            $this->customFieldService->list($request->only(['id', 'belongs_to', 'name', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreCustomFieldRequest $request): Response
    {
        return CustomFieldResource::make($this->customFieldService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): CustomFieldResource
    {
        return CustomFieldResource::make($this->customFieldService->findScoped($id));
    }

    public function update(UpdateCustomFieldRequest $request, int $id): CustomFieldResource
    {
        return CustomFieldResource::make($this->customFieldService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->customFieldService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteCustomFieldRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->customFieldService->bulkDelete($request->validated()['ids']),
        ]);
    }
}
