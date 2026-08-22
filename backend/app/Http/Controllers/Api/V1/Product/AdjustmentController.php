<?php

namespace App\Http\Controllers\Api\V1\Product;

use App\Enums\Settings\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Product\BulkDeleteAdjustmentRequest;
use App\Http\Requests\Api\V1\Product\StoreAdjustmentRequest;
use App\Http\Requests\Api\V1\Product\UpdateAdjustmentRequest;
use App\Http\Resources\Api\V1\Product\AdjustmentResource;
use App\Services\Product\AdjustmentServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class AdjustmentController extends Controller implements HasMiddleware
{
    public function __construct(protected AdjustmentServiceInterface $adjustmentService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListProductAdjustments->value, only: ['index']),
            new Middleware('permission:'.PermissionEnum::CreateProductAdjustments->value, only: ['store']),
            new Middleware('permission:'.PermissionEnum::ReadProductAdjustments->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateProductAdjustments->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeleteProductAdjustments->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return AdjustmentResource::collection(
            $this->adjustmentService->list($request->only(['id', 'reference_no', 'warehouse_id', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreAdjustmentRequest $request): Response
    {
        return AdjustmentResource::make($this->adjustmentService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): AdjustmentResource
    {
        return AdjustmentResource::make($this->adjustmentService->findScoped($id));
    }

    public function update(UpdateAdjustmentRequest $request, int $id): AdjustmentResource
    {
        return AdjustmentResource::make($this->adjustmentService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->adjustmentService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteAdjustmentRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->adjustmentService->bulkDelete($request->validated()['ids']),
        ]);
    }
}
