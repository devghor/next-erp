<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Enums\Settings\PermissionEnum;
use App\Exports\Settings\TaxesExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Settings\BulkDeleteTaxRequest;
use App\Http\Requests\Api\V1\Settings\ImportTaxRequest;
use App\Http\Requests\Api\V1\Settings\StoreTaxRequest;
use App\Http\Requests\Api\V1\Settings\UpdateTaxRequest;
use App\Http\Resources\Api\V1\Settings\TaxResource;
use App\Services\Settings\TaxServiceInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class TaxController extends Controller implements HasMiddleware
{
    public function __construct(protected TaxServiceInterface $taxService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListSettingsTaxes->value, only: ['index', 'exportPdf', 'exportExcel']),
            new Middleware('permission:'.PermissionEnum::CreateSettingsTaxes->value, only: ['store', 'import']),
            new Middleware('permission:'.PermissionEnum::ReadSettingsTaxes->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateSettingsTaxes->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeleteSettingsTaxes->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return TaxResource::collection(
            $this->taxService->list($request->only(['id', 'name', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreTaxRequest $request): Response
    {
        return TaxResource::make($this->taxService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): TaxResource
    {
        return TaxResource::make($this->taxService->findScoped($id));
    }

    public function update(UpdateTaxRequest $request, int $id): TaxResource
    {
        return TaxResource::make($this->taxService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->taxService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteTaxRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->taxService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function exportPdf(Request $request): Response
    {
        $taxes = $this->taxService->forExport($request->only(['id', 'name', 'date_from', 'date_to']));

        return Pdf::loadView('settings.taxes', [
            'taxes' => $taxes,
            'company' => tenant(),
        ])->download('taxes-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $taxes = $this->taxService->forExport($request->only(['id', 'name', 'date_from', 'date_to']));

        return Excel::download(new TaxesExport($taxes), 'taxes-'.now()->format('Y-m-d').'.xlsx');
    }

    public function import(ImportTaxRequest $request): Response
    {
        return response()->json($this->taxService->import($request->file('file')));
    }
}
