<?php

use App\Http\Controllers\Api\V1\Web\Auth\LoginController;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByRequestData;

Route::prefix('v1/web')
    ->name('v1.web.')
    ->group(function () {
        Route::post('auth/login', [LoginController::class, 'login'])->name('auth.login');

        Route::middleware(['auth:sanctum', InitializeTenancyByRequestData::class])
            ->group(function () {
                /**
                 * Auth Module
                 */
                Route::prefix('auth')
                    ->name('auth.')
                    ->group(function () {
                        Route::get('auth-user', [LoginController::class, 'authUser'])->name('auth-user');
                    });

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
