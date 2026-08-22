<?php

namespace App\Providers;

use App\Services\Product\BrandService;
use App\Services\Product\BrandServiceInterface;
use App\Services\Product\CategoryService;
use App\Services\Product\CategoryServiceInterface;
use App\Services\Product\ProductService;
use App\Services\Product\ProductServiceInterface;
use App\Services\Product\UnitService;
use App\Services\Product\UnitServiceInterface;
use App\Services\Purchase\PurchaseService;
use App\Services\Purchase\PurchaseServiceInterface;
use App\Services\Purchase\SupplierService;
use App\Services\Purchase\SupplierServiceInterface;
use App\Services\Settings\CurrencyService;
use App\Services\Settings\CurrencyServiceInterface;
use App\Services\Settings\CustomFieldService;
use App\Services\Settings\CustomFieldServiceInterface;
use App\Services\Settings\RoleService;
use App\Services\Settings\RoleServiceInterface;
use App\Services\Settings\TaxService;
use App\Services\Settings\TaxServiceInterface;
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
        $this->app->bind(CurrencyServiceInterface::class, CurrencyService::class);
        $this->app->bind(TaxServiceInterface::class, TaxService::class);
        $this->app->bind(CategoryServiceInterface::class, CategoryService::class);
        $this->app->bind(BrandServiceInterface::class, BrandService::class);
        $this->app->bind(UnitServiceInterface::class, UnitService::class);
        $this->app->bind(SupplierServiceInterface::class, SupplierService::class);
        $this->app->bind(CustomFieldServiceInterface::class, CustomFieldService::class);
        $this->app->bind(PurchaseServiceInterface::class, PurchaseService::class);
        $this->app->bind(ProductServiceInterface::class, ProductService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
