<?php

namespace App\Http\Controllers\Api\V1\Product;

use App\Enums\Settings\PermissionEnum;
use App\Exports\Product\UnitsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Product\BulkDeleteUnitRequest;
use App\Http\Requests\Api\V1\Product\ImportUnitRequest;
use App\Http\Requests\Api\V1\Product\StoreUnitRequest;
use App\Http\Requests\Api\V1\Product\UpdateUnitRequest;
use App\Http\Resources\Api\V1\Product\UnitResource;
use App\Services\Product\UnitServiceInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class UnitController extends Controller implements HasMiddleware
{
    public function __construct(protected UnitServiceInterface $unitService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListProductUnits->value, only: ['index', 'exportPdf', 'exportExcel']),
            new Middleware('permission:'.PermissionEnum::CreateProductUnits->value, only: ['store', 'import']),
            new Middleware('permission:'.PermissionEnum::ReadProductUnits->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateProductUnits->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeleteProductUnits->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return UnitResource::collection(
            $this->unitService->list($request->only(['id', 'code', 'name', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreUnitRequest $request): Response
    {
        return UnitResource::make($this->unitService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): UnitResource
    {
        return UnitResource::make($this->unitService->findScoped($id));
    }

    public function update(UpdateUnitRequest $request, int $id): UnitResource
    {
        return UnitResource::make($this->unitService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->unitService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteUnitRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->unitService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function exportPdf(Request $request): Response
    {
        $units = $this->unitService->forExport($request->only(['id', 'code', 'name', 'date_from', 'date_to']));

        return Pdf::loadView('product.units', [
            'units' => $units,
            'company' => tenant(),
        ])->download('units-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $units = $this->unitService->forExport($request->only(['id', 'code', 'name', 'date_from', 'date_to']));

        return Excel::download(new UnitsExport($units), 'units-'.now()->format('Y-m-d').'.xlsx');
    }

    public function import(ImportUnitRequest $request): Response
    {
        return response()->json($this->unitService->import($request->file('file')));
    }
}
