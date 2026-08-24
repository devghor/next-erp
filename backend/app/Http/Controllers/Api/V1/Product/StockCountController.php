<?php

namespace App\Http\Controllers\Api\V1\Product;

use App\Enums\Settings\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Product\BulkDeleteStockCountRequest;
use App\Http\Requests\Api\V1\Product\StoreStockCountRequest;
use App\Http\Requests\Api\V1\Product\SubmitStockCountRequest;
use App\Http\Requests\Api\V1\Product\UpdateStockCountRequest;
use App\Http\Resources\Api\V1\Product\StockCountResource;
use App\Services\Product\StockCountServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class StockCountController extends Controller implements HasMiddleware
{
    public function __construct(protected StockCountServiceInterface $stockCountService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListProductStockCounts->value, only: ['index']),
            new Middleware('permission:'.PermissionEnum::CreateProductStockCounts->value, only: ['store']),
            new Middleware('permission:'.PermissionEnum::ReadProductStockCounts->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateProductStockCounts->value, only: ['update', 'submitCount', 'adjust']),
            new Middleware('permission:'.PermissionEnum::DeleteProductStockCounts->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return StockCountResource::collection(
            $this->stockCountService->list($request->only(['id', 'reference_no', 'warehouse_id', 'status', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreStockCountRequest $request): Response
    {
        return StockCountResource::make($this->stockCountService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): StockCountResource
    {
        return StockCountResource::make($this->stockCountService->findScoped($id));
    }

    public function update(UpdateStockCountRequest $request, int $id): StockCountResource
    {
        return StockCountResource::make($this->stockCountService->update($id, $request->validated()));
    }

    public function submitCount(SubmitStockCountRequest $request, int $id): StockCountResource
    {
        return StockCountResource::make($this->stockCountService->submitCount($id, $request->validated()['items']));
    }

    public function adjust(int $id): StockCountResource
    {
        return StockCountResource::make($this->stockCountService->adjust($id));
    }

    public function destroy(int $id): Response
    {
        $this->stockCountService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteStockCountRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->stockCountService->bulkDelete($request->validated()['ids']),
        ]);
    }
}
