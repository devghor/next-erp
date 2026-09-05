<?php

namespace App\Providers;

use App\Services\Notification\NotificationService;
use App\Services\Notification\NotificationServiceInterface;
use App\Services\People\BillerService;
use App\Services\People\BillerServiceInterface;
use App\Services\People\CustomerService;
use App\Services\People\CustomerServiceInterface;
use App\Services\People\SaleAgentService;
use App\Services\People\SaleAgentServiceInterface;
use App\Services\People\SupplierService;
use App\Services\People\SupplierServiceInterface;
use App\Services\Product\AdjustmentService;
use App\Services\Product\AdjustmentServiceInterface;
use App\Services\Product\BarcodeSettingService;
use App\Services\Product\BarcodeSettingServiceInterface;
use App\Services\Product\BrandService;
use App\Services\Product\BrandServiceInterface;
use App\Services\Product\CategoryService;
use App\Services\Product\CategoryServiceInterface;
use App\Services\Product\DamageStockService;
use App\Services\Product\DamageStockServiceInterface;
use App\Services\Product\ProductService;
use App\Services\Product\ProductServiceInterface;
use App\Services\Product\StockCountService;
use App\Services\Product\StockCountServiceInterface;
use App\Services\Product\UnitService;
use App\Services\Product\UnitServiceInterface;
use App\Services\Purchase\PurchaseService;
use App\Services\Purchase\PurchaseServiceInterface;
use App\Services\Sale\CashRegisterService;
use App\Services\Sale\CashRegisterServiceInterface;
use App\Services\Sale\ChallanService;
use App\Services\Sale\ChallanServiceInterface;
use App\Services\Sale\CouponService;
use App\Services\Sale\CouponServiceInterface;
use App\Services\Sale\CourierService;
use App\Services\Sale\CourierServiceInterface;
use App\Services\Sale\DeliveryService;
use App\Services\Sale\DeliveryServiceInterface;
use App\Services\Sale\GiftCardService;
use App\Services\Sale\GiftCardServiceInterface;
use App\Services\Sale\InstallmentPlanService;
use App\Services\Sale\InstallmentPlanServiceInterface;
use App\Services\Sale\PackingSlipService;
use App\Services\Sale\PackingSlipServiceInterface;
use App\Services\Sale\SaleExchangeService;
use App\Services\Sale\SaleExchangeServiceInterface;
use App\Services\Sale\SaleReturnService;
use App\Services\Sale\SaleReturnServiceInterface;
use App\Services\Sale\SaleService;
use App\Services\Sale\SaleServiceInterface;
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
        $this->app->bind(NotificationServiceInterface::class, NotificationService::class);
        $this->app->bind(RoleServiceInterface::class, RoleService::class);
        $this->app->bind(UserServiceInterface::class, UserService::class);
        $this->app->bind(WarehouseServiceInterface::class, WarehouseService::class);
        $this->app->bind(CurrencyServiceInterface::class, CurrencyService::class);
        $this->app->bind(TaxServiceInterface::class, TaxService::class);
        $this->app->bind(CategoryServiceInterface::class, CategoryService::class);
        $this->app->bind(BrandServiceInterface::class, BrandService::class);
        $this->app->bind(UnitServiceInterface::class, UnitService::class);
        $this->app->bind(SupplierServiceInterface::class, SupplierService::class);
        $this->app->bind(CustomerServiceInterface::class, CustomerService::class);
        $this->app->bind(SaleAgentServiceInterface::class, SaleAgentService::class);
        $this->app->bind(BillerServiceInterface::class, BillerService::class);
        $this->app->bind(CustomFieldServiceInterface::class, CustomFieldService::class);
        $this->app->bind(PurchaseServiceInterface::class, PurchaseService::class);
        $this->app->bind(ProductServiceInterface::class, ProductService::class);
        $this->app->bind(BarcodeSettingServiceInterface::class, BarcodeSettingService::class);
        $this->app->bind(AdjustmentServiceInterface::class, AdjustmentService::class);
        $this->app->bind(StockCountServiceInterface::class, StockCountService::class);
        $this->app->bind(DamageStockServiceInterface::class, DamageStockService::class);
        $this->app->bind(SaleServiceInterface::class, SaleService::class);
        $this->app->bind(GiftCardServiceInterface::class, GiftCardService::class);
        $this->app->bind(CouponServiceInterface::class, CouponService::class);
        $this->app->bind(CourierServiceInterface::class, CourierService::class);
        $this->app->bind(InstallmentPlanServiceInterface::class, InstallmentPlanService::class);
        $this->app->bind(PackingSlipServiceInterface::class, PackingSlipService::class);
        $this->app->bind(DeliveryServiceInterface::class, DeliveryService::class);
        $this->app->bind(SaleReturnServiceInterface::class, SaleReturnService::class);
        $this->app->bind(SaleExchangeServiceInterface::class, SaleExchangeService::class);
        $this->app->bind(ChallanServiceInterface::class, ChallanService::class);
        $this->app->bind(CashRegisterServiceInterface::class, CashRegisterService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
