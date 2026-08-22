<?php

use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Media\MediaController;
use App\Http\Controllers\Api\V1\Product\CategoryController;
use App\Http\Controllers\Api\V1\Settings\CurrencyController;
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
                    });
            });
    });
