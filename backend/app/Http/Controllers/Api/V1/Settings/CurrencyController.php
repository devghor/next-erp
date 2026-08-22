<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Enums\Settings\PermissionEnum;
use App\Exports\Settings\CurrenciesExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Settings\BulkDeleteCurrencyRequest;
use App\Http\Requests\Api\V1\Settings\ImportCurrencyRequest;
use App\Http\Requests\Api\V1\Settings\StoreCurrencyRequest;
use App\Http\Requests\Api\V1\Settings\UpdateCurrencyRequest;
use App\Http\Resources\Api\V1\Settings\CurrencyResource;
use App\Services\Settings\CurrencyServiceInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class CurrencyController extends Controller implements HasMiddleware
{
    public function __construct(protected CurrencyServiceInterface $currencyService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListSettingsCurrencies->value, only: ['index', 'exportPdf', 'exportExcel']),
            new Middleware('permission:'.PermissionEnum::CreateSettingsCurrencies->value, only: ['store', 'import']),
            new Middleware('permission:'.PermissionEnum::ReadSettingsCurrencies->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateSettingsCurrencies->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeleteSettingsCurrencies->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return CurrencyResource::collection(
            $this->currencyService->list($request->only(['id', 'name', 'code', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreCurrencyRequest $request): Response
    {
        return CurrencyResource::make($this->currencyService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): CurrencyResource
    {
        return CurrencyResource::make($this->currencyService->findScoped($id));
    }

    public function update(UpdateCurrencyRequest $request, int $id): CurrencyResource
    {
        return CurrencyResource::make($this->currencyService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->currencyService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteCurrencyRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->currencyService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function exportPdf(Request $request): Response
    {
        $currencies = $this->currencyService->forExport($request->only(['id', 'name', 'code', 'date_from', 'date_to']));

        return Pdf::loadView('settings.currencies', [
            'currencies' => $currencies,
            'company' => tenant(),
        ])->download('currencies-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $currencies = $this->currencyService->forExport($request->only(['id', 'name', 'code', 'date_from', 'date_to']));

        return Excel::download(new CurrenciesExport($currencies), 'currencies-'.now()->format('Y-m-d').'.xlsx');
    }

    public function import(ImportCurrencyRequest $request): Response
    {
        return response()->json($this->currencyService->import($request->file('file')));
    }
}
