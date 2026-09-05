<?php

namespace App\Http\Controllers\Api\V1\Quotation;

use App\Enums\Settings\PermissionEnum;
use App\Exports\Quotation\QuotationsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Quotation\BulkDeleteQuotationRequest;
use App\Http\Requests\Api\V1\Quotation\StoreQuotationRequest;
use App\Http\Requests\Api\V1\Quotation\UpdateQuotationRequest;
use App\Http\Resources\Api\V1\Quotation\QuotationResource;
use App\Services\Quotation\QuotationServiceInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class QuotationController extends Controller implements HasMiddleware
{
    public function __construct(protected QuotationServiceInterface $quotationService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListQuotationQuotations->value, only: ['index', 'exportPdf', 'exportExcel']),
            new Middleware('permission:'.PermissionEnum::CreateQuotationQuotations->value, only: ['store']),
            new Middleware('permission:'.PermissionEnum::ReadQuotationQuotations->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateQuotationQuotations->value, only: ['update', 'sendMail']),
            new Middleware('permission:'.PermissionEnum::DeleteQuotationQuotations->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return QuotationResource::collection(
            $this->quotationService->list($request->only(['id', 'reference_no', 'customer_id', 'warehouse_id', 'biller_id', 'quotation_status', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreQuotationRequest $request): Response
    {
        return QuotationResource::make($this->quotationService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): QuotationResource
    {
        return QuotationResource::make($this->quotationService->findScoped($id));
    }

    public function update(UpdateQuotationRequest $request, int $id): QuotationResource
    {
        return QuotationResource::make($this->quotationService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->quotationService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteQuotationRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->quotationService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function sendMail(int $id): Response
    {
        $this->quotationService->sendMail($id);

        return response()->noContent();
    }

    public function exportPdf(Request $request): Response
    {
        $quotations = $this->quotationService->forExport($request->only(['id', 'reference_no', 'customer_id', 'warehouse_id', 'biller_id', 'quotation_status', 'date_from', 'date_to']));

        return Pdf::loadView('quotation.quotations', [
            'quotations' => $quotations,
            'company' => tenant(),
        ])->download('quotations-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $quotations = $this->quotationService->forExport($request->only(['id', 'reference_no', 'customer_id', 'warehouse_id', 'biller_id', 'quotation_status', 'date_from', 'date_to']));

        return Excel::download(new QuotationsExport($quotations), 'quotations-'.now()->format('Y-m-d').'.xlsx');
    }
}
