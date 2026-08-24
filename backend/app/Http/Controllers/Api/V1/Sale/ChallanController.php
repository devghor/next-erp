<?php

namespace App\Http\Controllers\Api\V1\Sale;

use App\Enums\Settings\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Sale\FinalizeChallanRequest;
use App\Http\Requests\Api\V1\Sale\StoreChallanRequest;
use App\Http\Resources\Api\V1\Sale\ChallanResource;
use App\Services\Sale\ChallanServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class ChallanController extends Controller implements HasMiddleware
{
    public function __construct(protected ChallanServiceInterface $challanService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListSaleChallans->value, only: ['index', 'availablePackingSlips']),
            new Middleware('permission:'.PermissionEnum::CreateSaleChallans->value, only: ['store']),
            new Middleware('permission:'.PermissionEnum::ReadSaleChallans->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateSaleChallans->value, only: ['finalize']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return ChallanResource::collection(
            $this->challanService->list($request->only(['status', 'courier_id', 'per_page']))
        );
    }

    public function store(StoreChallanRequest $request): Response
    {
        return ChallanResource::make($this->challanService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): ChallanResource
    {
        return ChallanResource::make($this->challanService->findScoped($id));
    }

    public function finalize(FinalizeChallanRequest $request, int $id): ChallanResource
    {
        return ChallanResource::make($this->challanService->finalize($id, $request->validated()));
    }

    public function availablePackingSlips(): JsonResponse
    {
        $slips = $this->challanService->availablePackingSlips()->map(fn ($slip) => [
            'id' => $slip->id,
            'reference_no' => $slip->reference_no,
            'sale_reference_no' => $slip->sale?->reference_no,
            'customer_name' => $slip->sale?->customer?->name,
            'amount' => (float) $slip->amount,
        ]);

        return response()->json(['data' => $slips]);
    }
}
