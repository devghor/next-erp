<?php

namespace App\Http\Controllers\Api\V1\Purchase;

use App\Enums\Settings\PermissionEnum;
use App\Exports\Purchase\PurchasesExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Purchase\BulkDeletePurchaseRequest;
use App\Http\Requests\Api\V1\Purchase\ImportPurchaseRequest;
use App\Http\Requests\Api\V1\Purchase\StorePurchaseRequest;
use App\Http\Requests\Api\V1\Purchase\UpdatePurchaseRequest;
use App\Http\Resources\Api\V1\Purchase\PurchaseResource;
use App\Services\Purchase\PurchaseServiceInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class PurchaseController extends Controller implements HasMiddleware
{
    public function __construct(protected PurchaseServiceInterface $purchaseService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListPurchasePurchases->value, only: ['index', 'exportPdf', 'exportExcel']),
            new Middleware('permission:'.PermissionEnum::CreatePurchasePurchases->value, only: ['store', 'import']),
            new Middleware('permission:'.PermissionEnum::ReadPurchasePurchases->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdatePurchasePurchases->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeletePurchasePurchases->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return PurchaseResource::collection(
            $this->purchaseService->list($request->only(['id', 'reference_no', 'supplier_id', 'warehouse_id', 'status', 'payment_status', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StorePurchaseRequest $request): Response
    {
        return PurchaseResource::make($this->purchaseService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function import(ImportPurchaseRequest $request): Response
    {
        $purchase = $this->purchaseService->importCsv($request->file('file'), $request->safe()->except('file'));

        return PurchaseResource::make($purchase)->response()->setStatusCode(201);
    }

    public function show(int $id): PurchaseResource
    {
        return PurchaseResource::make($this->purchaseService->findScoped($id));
    }

    public function update(UpdatePurchaseRequest $request, int $id): PurchaseResource
    {
        return PurchaseResource::make($this->purchaseService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->purchaseService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeletePurchaseRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->purchaseService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function exportPdf(Request $request): Response
    {
        $purchases = $this->purchaseService->forExport($request->only(['id', 'reference_no', 'supplier_id', 'warehouse_id', 'status', 'payment_status', 'date_from', 'date_to']));

        return Pdf::loadView('purchase.purchases', [
            'purchases' => $purchases,
            'company' => tenant(),
        ])->download('purchases-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $purchases = $this->purchaseService->forExport($request->only(['id', 'reference_no', 'supplier_id', 'warehouse_id', 'status', 'payment_status', 'date_from', 'date_to']));

        return Excel::download(new PurchasesExport($purchases), 'purchases-'.now()->format('Y-m-d').'.xlsx');
    }
}
