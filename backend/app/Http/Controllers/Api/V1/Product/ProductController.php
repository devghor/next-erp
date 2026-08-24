<?php

namespace App\Http\Controllers\Api\V1\Product;

use App\Enums\Settings\PermissionEnum;
use App\Exports\Product\ProductsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Product\BulkDeleteProductRequest;
use App\Http\Requests\Api\V1\Product\ImportProductRequest;
use App\Http\Requests\Api\V1\Product\PrintBarcodesRequest;
use App\Http\Requests\Api\V1\Product\StoreProductRequest;
use App\Http\Requests\Api\V1\Product\UpdateProductRequest;
use App\Http\Resources\Api\V1\Product\ProductResource;
use App\Services\Product\BarcodeSettingServiceInterface;
use App\Services\Product\ProductServiceInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Maatwebsite\Excel\Facades\Excel;
use Picqer\Barcode\BarcodeGeneratorPNG;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class ProductController extends Controller implements HasMiddleware
{
    public function __construct(
        protected ProductServiceInterface $productService,
        protected BarcodeSettingServiceInterface $barcodeSettingService,
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListProductProducts->value, only: ['index', 'exportPdf', 'exportExcel']),
            new Middleware('permission:'.PermissionEnum::CreateProductProducts->value, only: ['store', 'import']),
            new Middleware('permission:'.PermissionEnum::ReadProductProducts->value, only: ['show', 'history', 'printBarcode', 'printBarcodes']),
            new Middleware('permission:'.PermissionEnum::UpdateProductProducts->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeleteProductProducts->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return ProductResource::collection(
            $this->productService->list($request->only(['id', 'name', 'category_id', 'brand_id', 'unit_id', 'tax_id', 'type', 'stock_filter', 'warehouse_id', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreProductRequest $request): Response
    {
        return ProductResource::make($this->productService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): ProductResource
    {
        return ProductResource::make($this->productService->findScoped($id));
    }

    public function update(UpdateProductRequest $request, int $id): ProductResource
    {
        return ProductResource::make($this->productService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->productService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteProductRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->productService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function exportPdf(Request $request): Response
    {
        $products = $this->productService->forExport($request->only(['id', 'name', 'category_id', 'brand_id', 'unit_id', 'tax_id', 'type', 'stock_filter', 'date_from', 'date_to']));

        return Pdf::loadView('product.products', [
            'products' => $products,
            'company' => tenant(),
        ])->download('products-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $products = $this->productService->forExport($request->only(['id', 'name', 'category_id', 'brand_id', 'unit_id', 'tax_id', 'type', 'stock_filter', 'date_from', 'date_to']));

        return Excel::download(new ProductsExport($products), 'products-'.now()->format('Y-m-d').'.xlsx');
    }

    public function import(ImportProductRequest $request): Response
    {
        return response()->json($this->productService->import($request->file('file')));
    }

    public function history(int $id): Response
    {
        return response()->json($this->productService->history($id));
    }

    public function printBarcode(Request $request, int $id): Response
    {
        $product = $this->productService->findScoped($id);
        $copies = max(1, (int) $request->input('qty', 1));

        $generator = new BarcodeGeneratorPNG;
        $barcode = base64_encode($generator->getBarcode($product->code, $generator::TYPE_CODE_128));

        return Pdf::loadView('product.barcode', [
            'product' => $product,
            'barcode' => $barcode,
            'copies' => $copies,
        ])->download('barcode-'.$product->code.'.pdf');
    }

    public function printBarcodes(PrintBarcodesRequest $request): Response
    {
        $data = $request->validated();

        $barcodeSetting = $this->barcodeSettingService->findScoped($data['barcode_setting_id']);
        $products = $this->productService->findManyScoped(
            collect($data['products'])->pluck('product_id')->all()
        )->keyBy('id');

        $generator = new BarcodeGeneratorPNG;
        $labels = [];

        foreach ($data['products'] as $row) {
            $product = $products->get($row['product_id']);
            if (! $product) {
                continue;
            }

            $barcode = base64_encode($generator->getBarcode($product->code, $generator::TYPE_CODE_128));

            for ($i = 0; $i < $row['qty']; $i++) {
                $labels[] = [
                    'name' => $product->name,
                    'code' => $product->code,
                    'price' => $product->price,
                    'brand_name' => $product->brand?->name,
                    'barcode' => $barcode,
                ];
            }
        }

        return Pdf::loadView('product.barcode-labels', [
            'labels' => $labels,
            'setting' => $barcodeSetting,
            'print' => $data['print'] ?? [],
            'business_name' => tenant()->name,
        ])->download('barcode-labels-'.now()->format('Y-m-d').'.pdf');
    }
}
