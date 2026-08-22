<?php

use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Media\MediaController;
use App\Http\Controllers\Api\V1\Product\BrandController;
use App\Http\Controllers\Api\V1\Product\CategoryController;
use App\Http\Controllers\Api\V1\Product\ProductController;
use App\Http\Controllers\Api\V1\Product\UnitController;
use App\Http\Controllers\Api\V1\Purchase\PurchaseController;
use App\Http\Controllers\Api\V1\Purchase\SupplierController;
use App\Http\Controllers\Api\V1\Settings\CurrencyController;
use App\Http\Controllers\Api\V1\Settings\CustomFieldController;
use App\Http\Controllers\Api\V1\Settings\PermissionController;
use App\Http\Controllers\Api\V1\Settings\RoleController;
use App\Http\Controllers\Api\V1\Settings\TaxController;
use App\Http\Controllers\Api\V1\Settings\UserController;
use App\Http\Controllers\Api\V1\Settings\WarehouseController;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByRequestData;

Route::prefix('v1')
    ->name('v1.')
    ->group(function () {
        /**
         * Auth Module
         */
        Route::prefix('auth')
            ->name('auth.')
            ->group(function () {
                Route::post('login', [LoginController::class, 'login'])
                    ->name('login');
                Route::get('auth-user', [LoginController::class, 'authUser'])
                    ->middleware('auth:sanctum')
                    ->name('auth-user');
            });

        // Signed media streaming — deliberately outside the auth:sanctum
        // group. Browsers can't attach a Bearer token to <img src>, so
        // private media is authorized by the URL signature instead.
        Route::get('media/{media}', [MediaController::class, 'show'])
            ->middleware('signed')
            ->name('media.show');

        Route::middleware(['auth:sanctum', InitializeTenancyByRequestData::class, 'set-permissions-team-id'])
            ->group(function () {
                /**
                 * Setting Module
                 */
                Route::prefix('settings')
                    ->name('settings.')
                    ->group(function () {
                        // Users
                        Route::prefix('users')
                            ->name('users.')
                            ->group(function () {
                                Route::post('bulk-delete', [UserController::class, 'bulkDestroy'])->name('bulk-delete');
                                Route::get('export/pdf', [UserController::class, 'exportPdf'])->name('export.pdf');
                                Route::get('export/excel', [UserController::class, 'exportExcel'])->name('export.excel');
                                Route::post('import', [UserController::class, 'import'])->name('import');

                                Route::get('/', [UserController::class, 'index'])->name('index');
                                Route::post('/', [UserController::class, 'store'])->name('store');
                                Route::get('{id}', [UserController::class, 'show'])->name('show');
                                Route::put('{id}', [UserController::class, 'update'])->name('update');
                                Route::delete('{id}', [UserController::class, 'destroy'])->name('destroy');
                            });

                        // Roles
                        Route::prefix('roles')
                            ->name('roles.')
                            ->group(function () {
                                Route::post('bulk-delete', [RoleController::class, 'bulkDestroy'])->name('bulk-delete');
                                Route::get('export/pdf', [RoleController::class, 'exportPdf'])->name('export.pdf');
                                Route::get('export/excel', [RoleController::class, 'exportExcel'])->name('export.excel');
                                Route::post('import', [RoleController::class, 'import'])->name('import');

                                Route::get('/', [RoleController::class, 'index'])->name('index');
                                Route::post('/', [RoleController::class, 'store'])->name('store');
                                Route::get('{id}', [RoleController::class, 'show'])->name('show');
                                Route::put('{id}', [RoleController::class, 'update'])->name('update');
                                Route::delete('{id}', [RoleController::class, 'destroy'])->name('destroy');
                            });

                        // Warehouses
                        Route::prefix('warehouses')
                            ->name('warehouses.')
                            ->group(function () {
                                Route::post('bulk-delete', [WarehouseController::class, 'bulkDestroy'])->name('bulk-delete');
                                Route::get('export/pdf', [WarehouseController::class, 'exportPdf'])->name('export.pdf');
                                Route::get('export/excel', [WarehouseController::class, 'exportExcel'])->name('export.excel');
                                Route::post('import', [WarehouseController::class, 'import'])->name('import');

                                Route::get('/', [WarehouseController::class, 'index'])->name('index');
                                Route::post('/', [WarehouseController::class, 'store'])->name('store');
                                Route::get('{id}', [WarehouseController::class, 'show'])->name('show');
                                Route::put('{id}', [WarehouseController::class, 'update'])->name('update');
                                Route::delete('{id}', [WarehouseController::class, 'destroy'])->name('destroy');
                            });

                        // Currencies
                        Route::prefix('currencies')
                            ->name('currencies.')
                            ->group(function () {
                                Route::post('bulk-delete', [CurrencyController::class, 'bulkDestroy'])->name('bulk-delete');
                                Route::get('export/pdf', [CurrencyController::class, 'exportPdf'])->name('export.pdf');
                                Route::get('export/excel', [CurrencyController::class, 'exportExcel'])->name('export.excel');
                                Route::post('import', [CurrencyController::class, 'import'])->name('import');

                                Route::get('/', [CurrencyController::class, 'index'])->name('index');
                                Route::post('/', [CurrencyController::class, 'store'])->name('store');
                                Route::get('{id}', [CurrencyController::class, 'show'])->name('show');
                                Route::put('{id}', [CurrencyController::class, 'update'])->name('update');
                                Route::delete('{id}', [CurrencyController::class, 'destroy'])->name('destroy');
                            });

                        // Taxes
                        Route::prefix('taxes')
                            ->name('taxes.')
                            ->group(function () {
                                Route::post('bulk-delete', [TaxController::class, 'bulkDestroy'])->name('bulk-delete');
                                Route::get('export/pdf', [TaxController::class, 'exportPdf'])->name('export.pdf');
                                Route::get('export/excel', [TaxController::class, 'exportExcel'])->name('export.excel');
                                Route::post('import', [TaxController::class, 'import'])->name('import');

                                Route::get('/', [TaxController::class, 'index'])->name('index');
                                Route::post('/', [TaxController::class, 'store'])->name('store');
                                Route::get('{id}', [TaxController::class, 'show'])->name('show');
                                Route::put('{id}', [TaxController::class, 'update'])->name('update');
                                Route::delete('{id}', [TaxController::class, 'destroy'])->name('destroy');
                            });

                        // Custom Fields
                        Route::prefix('custom-fields')
                            ->name('custom-fields.')
                            ->group(function () {
                                Route::get('/', [CustomFieldController::class, 'index'])->name('index');
                                Route::post('/', [CustomFieldController::class, 'store'])->name('store');
                                Route::get('{id}', [CustomFieldController::class, 'show'])->name('show');
                                Route::put('{id}', [CustomFieldController::class, 'update'])->name('update');
                                Route::delete('{id}', [CustomFieldController::class, 'destroy'])->name('destroy');
                                Route::post('bulk-delete', [CustomFieldController::class, 'bulkDestroy'])->name('bulk-delete');
                            });

                        // Permissions
                        Route::get('permissions', [PermissionController::class, 'index'])->name('permissions.index');
                    });

                /**
                 * Product Module
                 */
                Route::prefix('product')
                    ->name('product.')
                    ->group(function () {
                        // Categories
                        Route::prefix('categories')
                            ->name('categories.')
                            ->group(function () {
                                Route::post('bulk-delete', [CategoryController::class, 'bulkDestroy'])->name('bulk-delete');
                                Route::get('export/pdf', [CategoryController::class, 'exportPdf'])->name('export.pdf');
                                Route::get('export/excel', [CategoryController::class, 'exportExcel'])->name('export.excel');
                                Route::post('import', [CategoryController::class, 'import'])->name('import');

                                Route::get('/', [CategoryController::class, 'index'])->name('index');
                                Route::post('/', [CategoryController::class, 'store'])->name('store');
                                Route::get('{id}', [CategoryController::class, 'show'])->name('show');
                                Route::put('{id}', [CategoryController::class, 'update'])->name('update');
                                Route::delete('{id}', [CategoryController::class, 'destroy'])->name('destroy');
                            });

                        // Brands
                        Route::prefix('brands')
                            ->name('brands.')
                            ->group(function () {
                                Route::post('bulk-delete', [BrandController::class, 'bulkDestroy'])->name('bulk-delete');
                                Route::get('export/pdf', [BrandController::class, 'exportPdf'])->name('export.pdf');
                                Route::get('export/excel', [BrandController::class, 'exportExcel'])->name('export.excel');
                                Route::post('import', [BrandController::class, 'import'])->name('import');

                                Route::get('/', [BrandController::class, 'index'])->name('index');
                                Route::post('/', [BrandController::class, 'store'])->name('store');
                                Route::get('{id}', [BrandController::class, 'show'])->name('show');
                                Route::put('{id}', [BrandController::class, 'update'])->name('update');
                                Route::delete('{id}', [BrandController::class, 'destroy'])->name('destroy');
                            });

                        // Units
                        Route::prefix('units')
                            ->name('units.')
                            ->group(function () {
                                Route::post('bulk-delete', [UnitController::class, 'bulkDestroy'])->name('bulk-delete');
                                Route::get('export/pdf', [UnitController::class, 'exportPdf'])->name('export.pdf');
                                Route::get('export/excel', [UnitController::class, 'exportExcel'])->name('export.excel');
                                Route::post('import', [UnitController::class, 'import'])->name('import');

                                Route::get('/', [UnitController::class, 'index'])->name('index');
                                Route::post('/', [UnitController::class, 'store'])->name('store');
                                Route::get('{id}', [UnitController::class, 'show'])->name('show');
                                Route::put('{id}', [UnitController::class, 'update'])->name('update');
                                Route::delete('{id}', [UnitController::class, 'destroy'])->name('destroy');
                            });

                        // Products
                        Route::prefix('products')
                            ->name('products.')
                            ->group(function () {
                                Route::post('bulk-delete', [ProductController::class, 'bulkDestroy'])->name('bulk-delete');
                                Route::get('export/pdf', [ProductController::class, 'exportPdf'])->name('export.pdf');
                                Route::get('export/excel', [ProductController::class, 'exportExcel'])->name('export.excel');
                                Route::post('import', [ProductController::class, 'import'])->name('import');

                                Route::get('/', [ProductController::class, 'index'])->name('index');
                                Route::post('/', [ProductController::class, 'store'])->name('store');
                                Route::get('{id}', [ProductController::class, 'show'])->name('show');
                                Route::put('{id}', [ProductController::class, 'update'])->name('update');
                                Route::delete('{id}', [ProductController::class, 'destroy'])->name('destroy');
                                Route::get('{id}/history', [ProductController::class, 'history'])->name('history');
                                Route::get('{id}/print-barcode', [ProductController::class, 'printBarcode'])->name('print-barcode');
                            });
                    });

                /**
                 * Purchase Module
                 */
                Route::prefix('purchase')
                    ->name('purchase.')
                    ->group(function () {
                        // Suppliers
                        Route::prefix('suppliers')
                            ->name('suppliers.')
                            ->group(function () {
                                Route::post('bulk-delete', [SupplierController::class, 'bulkDestroy'])->name('bulk-delete');
                                Route::get('export/pdf', [SupplierController::class, 'exportPdf'])->name('export.pdf');
                                Route::get('export/excel', [SupplierController::class, 'exportExcel'])->name('export.excel');
                                Route::post('import', [SupplierController::class, 'import'])->name('import');

                                Route::get('/', [SupplierController::class, 'index'])->name('index');
                                Route::post('/', [SupplierController::class, 'store'])->name('store');
                                Route::get('{id}', [SupplierController::class, 'show'])->name('show');
                                Route::put('{id}', [SupplierController::class, 'update'])->name('update');
                                Route::delete('{id}', [SupplierController::class, 'destroy'])->name('destroy');
                            });

                        // Purchases
                        Route::prefix('purchases')
                            ->name('purchases.')
                            ->group(function () {
                                Route::post('bulk-delete', [PurchaseController::class, 'bulkDestroy'])->name('bulk-delete');
                                Route::get('export/pdf', [PurchaseController::class, 'exportPdf'])->name('export.pdf');
                                Route::get('export/excel', [PurchaseController::class, 'exportExcel'])->name('export.excel');

                                Route::get('/', [PurchaseController::class, 'index'])->name('index');
                                Route::post('/', [PurchaseController::class, 'store'])->name('store');
                                Route::get('{id}', [PurchaseController::class, 'show'])->name('show');
                                Route::put('{id}', [PurchaseController::class, 'update'])->name('update');
                                Route::delete('{id}', [PurchaseController::class, 'destroy'])->name('destroy');
                            });
                    });
            });
    });
