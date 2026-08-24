<?php

namespace App\Http\Controllers\Api\V1\Product;

use App\Enums\Settings\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Product\BulkDeleteDamageStockRequest;
use App\Http\Requests\Api\V1\Product\StoreDamageStockRequest;
use App\Http\Requests\Api\V1\Product\UpdateDamageStockRequest;
use App\Http\Resources\Api\V1\Product\DamageStockResource;
use App\Services\Product\DamageStockServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class DamageStockController extends Controller implements HasMiddleware
{
    public function __construct(protected DamageStockServiceInterface $damageStockService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListProductDamageStocks->value, only: ['index']),
            new Middleware('permission:'.PermissionEnum::CreateProductDamageStocks->value, only: ['store']),
            new Middleware('permission:'.PermissionEnum::ReadProductDamageStocks->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateProductDamageStocks->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeleteProductDamageStocks->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return DamageStockResource::collection(
            $this->damageStockService->list($request->only(['id', 'reference_no', 'warehouse_id', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreDamageStockRequest $request): Response
    {
        return DamageStockResource::make($this->damageStockService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): DamageStockResource
    {
        return DamageStockResource::make($this->damageStockService->findScoped($id));
    }

    public function update(UpdateDamageStockRequest $request, int $id): DamageStockResource
    {
        return DamageStockResource::make($this->damageStockService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->damageStockService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteDamageStockRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->damageStockService->bulkDelete($request->validated()['ids']),
        ]);
    }
}
