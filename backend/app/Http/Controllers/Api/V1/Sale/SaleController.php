<?php

namespace App\Http\Controllers\Api\V1\Sale;

use App\Enums\Settings\PermissionEnum;
use App\Exports\Sale\SalesExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Sale\AddSalePaymentRequest;
use App\Http\Requests\Api\V1\Sale\BulkDeleteSaleRequest;
use App\Http\Requests\Api\V1\Sale\ImportSaleRequest;
use App\Http\Requests\Api\V1\Sale\StoreSaleRequest;
use App\Http\Requests\Api\V1\Sale\UpdateSaleRequest;
use App\Http\Resources\Api\V1\Sale\SaleResource;
use App\Services\Sale\SaleServiceInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class SaleController extends Controller implements HasMiddleware
{
    public function __construct(protected SaleServiceInterface $saleService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListSaleSales->value, only: ['index', 'exportPdf', 'exportExcel']),
            new Middleware('permission:'.PermissionEnum::CreateSaleSales->value, only: ['store', 'import']),
            new Middleware('permission:'.PermissionEnum::ReadSaleSales->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateSaleSales->value, only: ['update', 'addPayment']),
            new Middleware('permission:'.PermissionEnum::DeleteSaleSales->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return SaleResource::collection(
            $this->saleService->list($request->only(['id', 'reference_no', 'customer_id', 'warehouse_id', 'sale_status', 'payment_status', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreSaleRequest $request): Response
    {
        return SaleResource::make($this->saleService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): SaleResource
    {
        return SaleResource::make($this->saleService->findScoped($id));
    }

    public function update(UpdateSaleRequest $request, int $id): SaleResource
    {
        return SaleResource::make($this->saleService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->saleService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteSaleRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->saleService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function addPayment(AddSalePaymentRequest $request, int $id): SaleResource
    {
        return SaleResource::make($this->saleService->addPayment($id, $request->validated()));
    }

    public function import(ImportSaleRequest $request): Response
    {
        $sale = $this->saleService->importCsv($request->file('file'), $request->safe()->except('file'));

        return SaleResource::make($sale)->response()->setStatusCode(201);
    }

    public function exportPdf(Request $request): Response
    {
        $sales = $this->saleService->forExport($request->only(['id', 'reference_no', 'customer_id', 'warehouse_id', 'sale_status', 'payment_status', 'date_from', 'date_to']));

        return Pdf::loadView('sale.sales', [
            'sales' => $sales,
            'company' => tenant(),
        ])->download('sales-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $sales = $this->saleService->forExport($request->only(['id', 'reference_no', 'customer_id', 'warehouse_id', 'sale_status', 'payment_status', 'date_from', 'date_to']));

        return Excel::download(new SalesExport($sales), 'sales-'.now()->format('Y-m-d').'.xlsx');
    }
}
