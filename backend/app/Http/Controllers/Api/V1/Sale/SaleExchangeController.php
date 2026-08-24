<?php

namespace App\Http\Controllers\Api\V1\Sale;

use App\Enums\Settings\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Sale\StoreSaleExchangeRequest;
use App\Http\Resources\Api\V1\Sale\SaleExchangeResource;
use App\Http\Resources\Api\V1\Sale\SaleResource;
use App\Services\Sale\SaleExchangeServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class SaleExchangeController extends Controller implements HasMiddleware
{
    public function __construct(protected SaleExchangeServiceInterface $saleExchangeService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListSaleExchanges->value, only: ['index', 'saleLines', 'searchByReference']),
            new Middleware('permission:'.PermissionEnum::CreateSaleExchanges->value, only: ['store']),
            new Middleware('permission:'.PermissionEnum::ReadSaleExchanges->value, only: ['show']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return SaleExchangeResource::collection(
            $this->saleExchangeService->list($request->only(['warehouse_id', 'customer_id', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreSaleExchangeRequest $request): Response
    {
        return SaleExchangeResource::make($this->saleExchangeService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): SaleExchangeResource
    {
        return SaleExchangeResource::make($this->saleExchangeService->findScoped($id));
    }

    public function saleLines(int $saleId): JsonResponse
    {
        $lines = $this->saleExchangeService->saleLines($saleId)->map(fn ($line) => [
            'id' => $line->id,
            'product_id' => $line->product_id,
            'product_name' => $line->product?->name,
            'variant_id' => $line->variant_id,
            'batch_id' => $line->batch_id,
            'sale_unit_id' => $line->sale_unit_id,
            'qty' => $line->qty,
            'net_unit_price' => $line->net_unit_price,
            'discount' => $line->discount,
            'tax_rate' => $line->tax_rate,
        ]);

        return response()->json(['data' => $lines]);
    }

    public function searchByReference(Request $request): SaleResource
    {
        $request->validate(['reference_no' => 'required|string']);

        return SaleResource::make($this->saleExchangeService->findSaleByReference($request->string('reference_no')->toString()));
    }
}
