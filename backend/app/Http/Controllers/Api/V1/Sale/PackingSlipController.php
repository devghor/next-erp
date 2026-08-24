<?php

namespace App\Http\Controllers\Api\V1\Sale;

use App\Enums\Settings\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Sale\StorePackingSlipRequest;
use App\Http\Resources\Api\V1\Sale\PackingSlipResource;
use App\Services\Sale\PackingSlipServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class PackingSlipController extends Controller implements HasMiddleware
{
    public function __construct(protected PackingSlipServiceInterface $packingSlipService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListSalePackingSlips->value, only: ['index', 'availableLines']),
            new Middleware('permission:'.PermissionEnum::CreateSalePackingSlips->value, only: ['store']),
            new Middleware('permission:'.PermissionEnum::ReadSalePackingSlips->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::DeleteSalePackingSlips->value, only: ['destroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return PackingSlipResource::collection(
            $this->packingSlipService->list($request->only(['reference_no', 'sale_id', 'status', 'per_page']))
        );
    }

    public function store(StorePackingSlipRequest $request): Response
    {
        return PackingSlipResource::make($this->packingSlipService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): PackingSlipResource
    {
        return PackingSlipResource::make($this->packingSlipService->findScoped($id));
    }

    public function destroy(int $id): Response
    {
        $this->packingSlipService->delete($id);

        return response()->noContent();
    }

    public function availableLines(int $saleId): JsonResponse
    {
        $lines = $this->packingSlipService->availableLines($saleId)->map(fn ($line) => [
            'id' => $line->id,
            'product_id' => $line->product_id,
            'product_name' => $line->product?->name,
            'variant_id' => $line->variant_id,
            'variant_name' => $line->variant?->item_code,
            'qty' => (float) $line->qty,
            'net_unit_price' => (float) $line->net_unit_price,
            'total' => (float) $line->total,
        ]);

        return response()->json(['data' => $lines]);
    }
}
