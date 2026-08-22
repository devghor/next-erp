<?php

namespace App\Http\Controllers\Api\V1\Purchase;

use App\Enums\Settings\PermissionEnum;
use App\Exports\Purchase\SuppliersExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Purchase\BulkDeleteSupplierRequest;
use App\Http\Requests\Api\V1\Purchase\ImportSupplierRequest;
use App\Http\Requests\Api\V1\Purchase\StoreSupplierRequest;
use App\Http\Requests\Api\V1\Purchase\UpdateSupplierRequest;
use App\Http\Resources\Api\V1\Purchase\SupplierResource;
use App\Services\Purchase\SupplierServiceInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class SupplierController extends Controller implements HasMiddleware
{
    public function __construct(protected SupplierServiceInterface $supplierService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListPurchaseSuppliers->value, only: ['index', 'exportPdf', 'exportExcel']),
            new Middleware('permission:'.PermissionEnum::CreatePurchaseSuppliers->value, only: ['store', 'import']),
            new Middleware('permission:'.PermissionEnum::ReadPurchaseSuppliers->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdatePurchaseSuppliers->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeletePurchaseSuppliers->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return SupplierResource::collection(
            $this->supplierService->list($request->only(['id', 'name', 'phone', 'email', 'address', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreSupplierRequest $request): Response
    {
        return SupplierResource::make($this->supplierService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): SupplierResource
    {
        return SupplierResource::make($this->supplierService->findScoped($id));
    }

    public function update(UpdateSupplierRequest $request, int $id): SupplierResource
    {
        return SupplierResource::make($this->supplierService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->supplierService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteSupplierRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->supplierService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function exportPdf(Request $request): Response
    {
        $suppliers = $this->supplierService->forExport($request->only(['id', 'name', 'phone', 'email', 'address', 'date_from', 'date_to']));

        return Pdf::loadView('purchase.suppliers', [
            'suppliers' => $suppliers,
            'company' => tenant(),
        ])->download('suppliers-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $suppliers = $this->supplierService->forExport($request->only(['id', 'name', 'phone', 'email', 'address', 'date_from', 'date_to']));

        return Excel::download(new SuppliersExport($suppliers), 'suppliers-'.now()->format('Y-m-d').'.xlsx');
    }

    public function import(ImportSupplierRequest $request): Response
    {
        return response()->json($this->supplierService->import($request->file('file')));
    }
}
