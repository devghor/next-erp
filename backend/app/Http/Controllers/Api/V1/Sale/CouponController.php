<?php

namespace App\Http\Controllers\Api\V1\Sale;

use App\Enums\Settings\PermissionEnum;
use App\Exports\Sale\CouponsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Sale\BulkDeleteCouponRequest;
use App\Http\Requests\Api\V1\Sale\ImportCouponRequest;
use App\Http\Requests\Api\V1\Sale\StoreCouponRequest;
use App\Http\Requests\Api\V1\Sale\UpdateCouponRequest;
use App\Http\Resources\Api\V1\Sale\CouponResource;
use App\Services\Sale\CouponServiceInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class CouponController extends Controller implements HasMiddleware
{
    public function __construct(protected CouponServiceInterface $couponService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListSaleCoupons->value, only: ['index', 'exportPdf', 'exportExcel']),
            new Middleware('permission:'.PermissionEnum::CreateSaleCoupons->value, only: ['store', 'import', 'generateCode']),
            new Middleware('permission:'.PermissionEnum::ReadSaleCoupons->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateSaleCoupons->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeleteSaleCoupons->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return CouponResource::collection(
            $this->couponService->list($request->only(['id', 'code', 'type', 'is_active', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreCouponRequest $request): Response
    {
        return CouponResource::make($this->couponService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): CouponResource
    {
        return CouponResource::make($this->couponService->findScoped($id));
    }

    public function update(UpdateCouponRequest $request, int $id): CouponResource
    {
        return CouponResource::make($this->couponService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->couponService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteCouponRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->couponService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function generateCode(): Response
    {
        return response()->json(['code' => $this->couponService->generateCode()]);
    }

    public function exportPdf(Request $request): Response
    {
        $coupons = $this->couponService->forExport($request->only(['id', 'code', 'type', 'is_active', 'date_from', 'date_to']));

        return Pdf::loadView('sale.coupons', [
            'coupons' => $coupons,
            'company' => tenant(),
        ])->download('coupons-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $coupons = $this->couponService->forExport($request->only(['id', 'code', 'type', 'is_active', 'date_from', 'date_to']));

        return Excel::download(new CouponsExport($coupons), 'coupons-'.now()->format('Y-m-d').'.xlsx');
    }

    public function import(ImportCouponRequest $request): Response
    {
        return response()->json($this->couponService->import($request->file('file')));
    }
}
