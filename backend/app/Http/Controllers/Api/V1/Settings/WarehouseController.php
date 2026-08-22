<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Enums\Settings\PermissionEnum;
use App\Exports\Settings\WarehousesExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Settings\BulkDeleteWarehouseRequest;
use App\Http\Requests\Api\V1\Settings\ImportWarehouseRequest;
use App\Http\Requests\Api\V1\Settings\StoreWarehouseRequest;
use App\Http\Requests\Api\V1\Settings\UpdateWarehouseRequest;
use App\Http\Resources\Api\V1\Settings\WarehouseResource;
use App\Services\Settings\WarehouseServiceInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class WarehouseController extends Controller implements HasMiddleware
{
    public function __construct(protected WarehouseServiceInterface $warehouseService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListSettingsWarehouses->value, only: ['index', 'exportPdf', 'exportExcel']),
            new Middleware('permission:'.PermissionEnum::CreateSettingsWarehouses->value, only: ['store', 'import']),
            new Middleware('permission:'.PermissionEnum::ReadSettingsWarehouses->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateSettingsWarehouses->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeleteSettingsWarehouses->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return WarehouseResource::collection(
            $this->warehouseService->list($request->only(['id', 'name', 'phone', 'email', 'address', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreWarehouseRequest $request): Response
    {
        return WarehouseResource::make($this->warehouseService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): WarehouseResource
    {
        return WarehouseResource::make($this->warehouseService->findScoped($id));
    }

    public function update(UpdateWarehouseRequest $request, int $id): WarehouseResource
    {
        return WarehouseResource::make($this->warehouseService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->warehouseService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteWarehouseRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->warehouseService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function exportPdf(Request $request): Response
    {
        $warehouses = $this->warehouseService->forExport($request->only(['id', 'name', 'phone', 'email', 'address', 'date_from', 'date_to']));

        return Pdf::loadView('settings.warehouses', [
            'warehouses' => $warehouses,
            'company' => tenant(),
        ])->download('warehouses-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $warehouses = $this->warehouseService->forExport($request->only(['id', 'name', 'phone', 'email', 'address', 'date_from', 'date_to']));

        return Excel::download(new WarehousesExport($warehouses), 'warehouses-'.now()->format('Y-m-d').'.xlsx');
    }

    public function import(ImportWarehouseRequest $request): Response
    {
        return response()->json($this->warehouseService->import($request->file('file')));
    }
}
