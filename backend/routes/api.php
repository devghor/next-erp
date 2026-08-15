<?php

use App\Http\Controllers\Api\V1\Web\Auth\LoginController;
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
                        // Define settings routes here
                    });
            });
    });
