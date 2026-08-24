<?php

namespace App\Http\Controllers\Api\V1\Sale;

use App\Enums\Settings\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Sale\StoreDeliveryRequest;
use App\Http\Requests\Api\V1\Sale\UpdateDeliveryRequest;
use App\Http\Resources\Api\V1\Sale\DeliveryResource;
use App\Services\Sale\DeliveryServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class DeliveryController extends Controller implements HasMiddleware
{
    public function __construct(protected DeliveryServiceInterface $deliveryService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListSaleDeliveries->value, only: ['index']),
            new Middleware('permission:'.PermissionEnum::CreateSaleDeliveries->value, only: ['store']),
            new Middleware('permission:'.PermissionEnum::ReadSaleDeliveries->value, only: ['show', 'track']),
            new Middleware('permission:'.PermissionEnum::UpdateSaleDeliveries->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeleteSaleDeliveries->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return DeliveryResource::collection(
            $this->deliveryService->list($request->only(['id', 'reference_no', 'sale_id', 'courier_id', 'status', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreDeliveryRequest $request): Response
    {
        return DeliveryResource::make($this->deliveryService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): DeliveryResource
    {
        return DeliveryResource::make($this->deliveryService->findScoped($id));
    }

    public function update(UpdateDeliveryRequest $request, int $id): DeliveryResource
    {
        return DeliveryResource::make($this->deliveryService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->deliveryService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(Request $request): Response
    {
        $ids = (array) $request->input('ids', []);

        return response()->json([
            'deleted' => $this->deliveryService->bulkDelete($ids),
        ]);
    }

    public function track(int $id): DeliveryResource
    {
        return DeliveryResource::make($this->deliveryService->track($id));
    }
}
