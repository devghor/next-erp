<?php

namespace App\Http\Controllers\Api\V1\Sale;

use App\Enums\Settings\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Sale\BulkDeleteGiftCardRequest;
use App\Http\Requests\Api\V1\Sale\RechargeGiftCardRequest;
use App\Http\Requests\Api\V1\Sale\StoreGiftCardRequest;
use App\Http\Requests\Api\V1\Sale\UpdateGiftCardRequest;
use App\Http\Resources\Api\V1\Sale\GiftCardResource;
use App\Services\Sale\GiftCardServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class GiftCardController extends Controller implements HasMiddleware
{
    public function __construct(protected GiftCardServiceInterface $giftCardService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListSaleGiftCards->value, only: ['index']),
            new Middleware('permission:'.PermissionEnum::CreateSaleGiftCards->value, only: ['store']),
            new Middleware('permission:'.PermissionEnum::ReadSaleGiftCards->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateSaleGiftCards->value, only: ['update', 'recharge']),
            new Middleware('permission:'.PermissionEnum::DeleteSaleGiftCards->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return GiftCardResource::collection(
            $this->giftCardService->list($request->only(['id', 'card_no', 'customer_id', 'is_active', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreGiftCardRequest $request): Response
    {
        return GiftCardResource::make($this->giftCardService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): GiftCardResource
    {
        return GiftCardResource::make($this->giftCardService->findScoped($id));
    }

    public function update(UpdateGiftCardRequest $request, int $id): GiftCardResource
    {
        return GiftCardResource::make($this->giftCardService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->giftCardService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteGiftCardRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->giftCardService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function recharge(RechargeGiftCardRequest $request, int $id): GiftCardResource
    {
        return GiftCardResource::make(
            $this->giftCardService->recharge($id, (float) $request->validated()['amount'], $request->user()?->id)
        );
    }
}
