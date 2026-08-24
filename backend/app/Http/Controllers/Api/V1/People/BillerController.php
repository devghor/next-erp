<?php

namespace App\Http\Controllers\Api\V1\People;

use App\Enums\Settings\PermissionEnum;
use App\Exports\People\BillersExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\People\BulkDeleteBillerRequest;
use App\Http\Requests\Api\V1\People\ImportBillerRequest;
use App\Http\Requests\Api\V1\People\StoreBillerRequest;
use App\Http\Requests\Api\V1\People\UpdateBillerRequest;
use App\Http\Resources\Api\V1\People\BillerResource;
use App\Services\People\BillerServiceInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class BillerController extends Controller implements HasMiddleware
{
    public function __construct(protected BillerServiceInterface $billerService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListPeopleBillers->value, only: ['index', 'exportPdf', 'exportExcel']),
            new Middleware('permission:'.PermissionEnum::CreatePeopleBillers->value, only: ['store', 'import']),
            new Middleware('permission:'.PermissionEnum::ReadPeopleBillers->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdatePeopleBillers->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeletePeopleBillers->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return BillerResource::collection(
            $this->billerService->list($request->only(['id', 'name', 'company_name', 'phone', 'email', 'address', 'city', 'state', 'postal_code', 'country', 'vat_number', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreBillerRequest $request): Response
    {
        return BillerResource::make($this->billerService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): BillerResource
    {
        return BillerResource::make($this->billerService->findScoped($id));
    }

    public function update(UpdateBillerRequest $request, int $id): BillerResource
    {
        return BillerResource::make($this->billerService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->billerService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteBillerRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->billerService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function exportPdf(Request $request): Response
    {
        $billers = $this->billerService->forExport($request->only(['id', 'name', 'company_name', 'phone', 'email', 'address', 'city', 'state', 'postal_code', 'country', 'vat_number', 'date_from', 'date_to']));

        return Pdf::loadView('people.billers', [
            'billers' => $billers,
            'company' => tenant(),
        ])->download('billers-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $billers = $this->billerService->forExport($request->only(['id', 'name', 'company_name', 'phone', 'email', 'address', 'city', 'state', 'postal_code', 'country', 'vat_number', 'date_from', 'date_to']));

        return Excel::download(new BillersExport($billers), 'billers-'.now()->format('Y-m-d').'.xlsx');
    }

    public function import(ImportBillerRequest $request): Response
    {
        return response()->json($this->billerService->import($request->file('file')));
    }
}
