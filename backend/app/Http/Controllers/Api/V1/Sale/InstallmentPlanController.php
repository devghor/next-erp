<?php

namespace App\Http\Controllers\Api\V1\Sale;

use App\Enums\Settings\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Sale\PayInstallmentRequest;
use App\Http\Resources\Api\V1\Sale\InstallmentPlanResource;
use App\Http\Resources\Api\V1\Sale\InstallmentResource;
use App\Services\Sale\InstallmentPlanServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class InstallmentPlanController extends Controller implements HasMiddleware
{
    public function __construct(protected InstallmentPlanServiceInterface $installmentPlanService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListSaleInstallmentPlans->value, only: ['index']),
            new Middleware('permission:'.PermissionEnum::ReadSaleInstallmentPlans->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateSaleInstallmentPlans->value, only: ['pay']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return InstallmentPlanResource::collection(
            $this->installmentPlanService->list($request->only(['per_page']))
        );
    }

    public function show(int $id): InstallmentPlanResource
    {
        return InstallmentPlanResource::make($this->installmentPlanService->findScoped($id));
    }

    public function pay(PayInstallmentRequest $request, int $installmentId): InstallmentResource
    {
        $this->installmentPlanService->payInstallment($installmentId, $request->validated());

        return InstallmentResource::make($this->installmentPlanService->findInstallmentScoped($installmentId));
    }
}
