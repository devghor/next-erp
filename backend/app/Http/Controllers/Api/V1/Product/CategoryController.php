<?php

namespace App\Http\Controllers\Api\V1\Product;

use App\Enums\Settings\PermissionEnum;
use App\Exports\Product\CategoriesExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Product\BulkDeleteCategoryRequest;
use App\Http\Requests\Api\V1\Product\ImportCategoryRequest;
use App\Http\Requests\Api\V1\Product\StoreCategoryRequest;
use App\Http\Requests\Api\V1\Product\UpdateCategoryRequest;
use App\Http\Resources\Api\V1\Product\CategoryResource;
use App\Services\Product\CategoryServiceInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class CategoryController extends Controller implements HasMiddleware
{
    public function __construct(protected CategoryServiceInterface $categoryService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListProductCategories->value, only: ['index', 'exportPdf', 'exportExcel']),
            new Middleware('permission:'.PermissionEnum::CreateProductCategories->value, only: ['store', 'import']),
            new Middleware('permission:'.PermissionEnum::ReadProductCategories->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateProductCategories->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeleteProductCategories->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return CategoryResource::collection(
            $this->categoryService->list($request->only(['id', 'name', 'parent_id', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreCategoryRequest $request): Response
    {
        return CategoryResource::make($this->categoryService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): CategoryResource
    {
        return CategoryResource::make($this->categoryService->findScoped($id));
    }

    public function update(UpdateCategoryRequest $request, int $id): CategoryResource
    {
        return CategoryResource::make($this->categoryService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->categoryService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteCategoryRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->categoryService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function exportPdf(Request $request): Response
    {
        $categories = $this->categoryService->forExport($request->only(['id', 'name', 'parent_id', 'date_from', 'date_to']));

        return Pdf::loadView('product.categories', [
            'categories' => $categories,
            'company' => tenant(),
        ])->download('categories-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $categories = $this->categoryService->forExport($request->only(['id', 'name', 'parent_id', 'date_from', 'date_to']));

        return Excel::download(new CategoriesExport($categories), 'categories-'.now()->format('Y-m-d').'.xlsx');
    }

    public function import(ImportCategoryRequest $request): Response
    {
        return response()->json($this->categoryService->import($request->file('file')));
    }
}
