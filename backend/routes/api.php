<?php

use App\Http\Controllers\Api\V1\Web\Auth\LoginController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/web')
    ->name('v1.web.')
    ->group(function () {
        /**
         * Auth Module
         */
        Route::prefix('auth')
            ->name('auth.')
            ->group(function () {
                Route::post('/login', [LoginController::class, 'login'])->name('login');
            });

        Route::middleware('auth:sanctum')
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
