<?php

namespace App\Providers;

use App\Services\Settings\RoleService;
use App\Services\Settings\RoleServiceInterface;
use App\Services\Settings\UserService;
use App\Services\Settings\UserServiceInterface;
use App\Services\Settings\WarehouseService;
use App\Services\Settings\WarehouseServiceInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(RoleServiceInterface::class, RoleService::class);
        $this->app->bind(UserServiceInterface::class, UserService::class);
        $this->app->bind(WarehouseServiceInterface::class, WarehouseService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
