<?php

namespace App\Http\Controllers\Api\V1\Sale;

use App\Enums\Settings\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Sale\StoreSaleReturnRequest;
use App\Http\Resources\Api\V1\Sale\SaleReturnResource;
use App\Services\Sale\SaleReturnServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class SaleReturnController extends Controller implements HasMiddleware
{
    public function __construct(protected SaleReturnServiceInterface $saleReturnService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListSaleSaleReturns->value, only: ['index', 'availableLines']),
            new Middleware('permission:'.PermissionEnum::CreateSaleSaleReturns->value, only: ['store']),
            new Middleware('permission:'.PermissionEnum::ReadSaleSaleReturns->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::DeleteSaleSaleReturns->value, only: ['destroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return SaleReturnResource::collection(
            $this->saleReturnService->list($request->only(['id', 'reference_no', 'sale_id', 'customer_id', 'warehouse_id', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreSaleReturnRequest $request): Response
    {
        return SaleReturnResource::make($this->saleReturnService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): SaleReturnResource
    {
        return SaleReturnResource::make($this->saleReturnService->findScoped($id));
    }

    public function destroy(int $id): Response
    {
        $this->saleReturnService->delete($id);

        return response()->noContent();
    }

    public function availableLines(int $saleId): JsonResponse
    {
        $lines = $this->saleReturnService->availableLines($saleId)->map(fn ($line) => [
            'id' => $line->id,
            'product_id' => $line->product_id,
            'product_name' => $line->product?->name,
            'variant_id' => $line->variant_id,
            'variant_name' => $line->variant?->item_code,
            'batch_id' => $line->batch_id,
            'sale_unit_id' => $line->sale_unit_id,
            'qty' => (float) $line->qty,
            'return_qty' => (float) $line->return_qty,
            'returnable_qty' => (float) $line->qty - (float) $line->return_qty,
            'net_unit_price' => (float) $line->net_unit_price,
            'discount' => (float) $line->discount,
            'tax_rate' => (float) $line->tax_rate,
        ]);

        return response()->json(['data' => $lines]);
    }
}
