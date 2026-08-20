<?php

use App\Http\Controllers\Api\V1\Web\Auth\LoginController;
use App\Http\Controllers\Api\V1\Web\Setting\UserController;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByRequestData;

Route::prefix('v1/web')
    ->name('v1.web.')
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

        Route::middleware(['auth:sanctum', InitializeTenancyByRequestData::class])
            ->group(function () {
                /**
                 * Setting Module
                 */
                Route::prefix('setting')
                    ->name('setting.')
                    ->group(function () {
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
                    });
            });
    });
