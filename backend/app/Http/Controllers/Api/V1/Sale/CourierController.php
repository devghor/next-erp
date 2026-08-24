<?php

namespace App\Http\Controllers\Api\V1\Sale;

use App\Enums\Settings\PermissionEnum;
use App\Exports\Sale\CouriersExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Sale\BulkDeleteCourierRequest;
use App\Http\Requests\Api\V1\Sale\ImportCourierRequest;
use App\Http\Requests\Api\V1\Sale\StoreCourierRequest;
use App\Http\Requests\Api\V1\Sale\UpdateCourierRequest;
use App\Http\Resources\Api\V1\Sale\CourierResource;
use App\Services\Sale\CourierServiceInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class CourierController extends Controller implements HasMiddleware
{
    public function __construct(protected CourierServiceInterface $courierService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListSaleCouriers->value, only: ['index', 'exportPdf', 'exportExcel']),
            new Middleware('permission:'.PermissionEnum::CreateSaleCouriers->value, only: ['store', 'import']),
            new Middleware('permission:'.PermissionEnum::ReadSaleCouriers->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateSaleCouriers->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeleteSaleCouriers->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return CourierResource::collection(
            $this->courierService->list($request->only(['id', 'name', 'type', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreCourierRequest $request): Response
    {
        return CourierResource::make($this->courierService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): CourierResource
    {
        return CourierResource::make($this->courierService->findScoped($id));
    }

    public function update(UpdateCourierRequest $request, int $id): CourierResource
    {
        return CourierResource::make($this->courierService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->courierService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteCourierRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->courierService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function exportPdf(Request $request): Response
    {
        $couriers = $this->courierService->forExport($request->only(['id', 'name', 'type', 'date_from', 'date_to']));

        return Pdf::loadView('sale.couriers', [
            'couriers' => $couriers,
            'company' => tenant(),
        ])->download('couriers-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $couriers = $this->courierService->forExport($request->only(['id', 'name', 'type', 'date_from', 'date_to']));

        return Excel::download(new CouriersExport($couriers), 'couriers-'.now()->format('Y-m-d').'.xlsx');
    }

    public function import(ImportCourierRequest $request): Response
    {
        return response()->json($this->courierService->import($request->file('file')));
    }
}
