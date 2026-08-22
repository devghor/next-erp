<?php

namespace App\Http\Controllers\Api\V1\Product;

use App\Enums\Settings\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Product\BulkDeleteBarcodeSettingRequest;
use App\Http\Requests\Api\V1\Product\StoreBarcodeSettingRequest;
use App\Http\Requests\Api\V1\Product\UpdateBarcodeSettingRequest;
use App\Http\Resources\Api\V1\Product\BarcodeSettingResource;
use App\Services\Product\BarcodeSettingServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class BarcodeSettingController extends Controller implements HasMiddleware
{
    public function __construct(protected BarcodeSettingServiceInterface $barcodeSettingService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListProductBarcodeSettings->value, only: ['index']),
            new Middleware('permission:'.PermissionEnum::CreateProductBarcodeSettings->value, only: ['store']),
            new Middleware('permission:'.PermissionEnum::ReadProductBarcodeSettings->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateProductBarcodeSettings->value, only: ['update', 'setDefault']),
            new Middleware('permission:'.PermissionEnum::DeleteProductBarcodeSettings->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return BarcodeSettingResource::collection(
            $this->barcodeSettingService->list($request->only(['name', 'per_page']))
        );
    }

    public function store(StoreBarcodeSettingRequest $request): Response
    {
        return BarcodeSettingResource::make($this->barcodeSettingService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): BarcodeSettingResource
    {
        return BarcodeSettingResource::make($this->barcodeSettingService->findScoped($id));
    }

    public function update(UpdateBarcodeSettingRequest $request, int $id): BarcodeSettingResource
    {
        return BarcodeSettingResource::make($this->barcodeSettingService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->barcodeSettingService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteBarcodeSettingRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->barcodeSettingService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function setDefault(int $id): BarcodeSettingResource
    {
        return BarcodeSettingResource::make($this->barcodeSettingService->setDefault($id));
    }
}
