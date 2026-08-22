<?php

namespace App\Http\Controllers\Api\V1\Product;

use App\Enums\Settings\PermissionEnum;
use App\Exports\Product\BrandsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Product\BulkDeleteBrandRequest;
use App\Http\Requests\Api\V1\Product\ImportBrandRequest;
use App\Http\Requests\Api\V1\Product\StoreBrandRequest;
use App\Http\Requests\Api\V1\Product\UpdateBrandRequest;
use App\Http\Resources\Api\V1\Product\BrandResource;
use App\Services\Product\BrandServiceInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class BrandController extends Controller implements HasMiddleware
{
    public function __construct(protected BrandServiceInterface $brandService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListProductBrands->value, only: ['index', 'exportPdf', 'exportExcel']),
            new Middleware('permission:'.PermissionEnum::CreateProductBrands->value, only: ['store', 'import']),
            new Middleware('permission:'.PermissionEnum::ReadProductBrands->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateProductBrands->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeleteProductBrands->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return BrandResource::collection(
            $this->brandService->list($request->only(['id', 'name', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreBrandRequest $request): Response
    {
        return BrandResource::make($this->brandService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): BrandResource
    {
        return BrandResource::make($this->brandService->findScoped($id));
    }

    public function update(UpdateBrandRequest $request, int $id): BrandResource
    {
        return BrandResource::make($this->brandService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->brandService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteBrandRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->brandService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function exportPdf(Request $request): Response
    {
        $brands = $this->brandService->forExport($request->only(['id', 'name', 'date_from', 'date_to']));

        return Pdf::loadView('product.brands', [
            'brands' => $brands,
            'company' => tenant(),
        ])->download('brands-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $brands = $this->brandService->forExport($request->only(['id', 'name', 'date_from', 'date_to']));

        return Excel::download(new BrandsExport($brands), 'brands-'.now()->format('Y-m-d').'.xlsx');
    }

    public function import(ImportBrandRequest $request): Response
    {
        return response()->json($this->brandService->import($request->file('file')));
    }
}
