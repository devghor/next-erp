<?php

use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Media\MediaController;
use App\Http\Controllers\Api\V1\Notification\NotificationController;
use App\Http\Controllers\Api\V1\People\BillerController;
use App\Http\Controllers\Api\V1\People\CustomerController;
use App\Http\Controllers\Api\V1\People\SaleAgentController;
use App\Http\Controllers\Api\V1\People\SupplierController;
use App\Http\Controllers\Api\V1\Product\AdjustmentController;
use App\Http\Controllers\Api\V1\Product\BarcodeSettingController;
use App\Http\Controllers\Api\V1\Product\BrandController;
use App\Http\Controllers\Api\V1\Product\CategoryController;
use App\Http\Controllers\Api\V1\Product\DamageStockController;
use App\Http\Controllers\Api\V1\Product\ProductController;
use App\Http\Controllers\Api\V1\Product\StockCountController;
use App\Http\Controllers\Api\V1\Product\UnitController;
use App\Http\Controllers\Api\V1\Purchase\PurchaseController;
use App\Http\Controllers\Api\V1\Sale\CashRegisterController;
use App\Http\Controllers\Api\V1\Sale\ChallanController;
use App\Http\Controllers\Api\V1\Sale\CouponController;
use App\Http\Controllers\Api\V1\Sale\CourierController;
use App\Http\Controllers\Api\V1\Sale\DeliveryController;
use App\Http\Controllers\Api\V1\Sale\GiftCardController;
use App\Http\Controllers\Api\V1\Sale\InstallmentPlanController;
use App\Http\Controllers\Api\V1\Sale\PackingSlipController;
use App\Http\Controllers\Api\V1\Sale\PaymentGatewayController;
use App\Http\Controllers\Api\V1\Sale\PosSettingController;
use App\Http\Controllers\Api\V1\Sale\SaleController;
use App\Http\Controllers\Api\V1\Sale\SaleExchangeController;
use App\Http\Controllers\Api\V1\Sale\SaleReturnController;
use App\Http\Controllers\Api\V1\Sale\SaleSettingController;
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

        // POS payment-gateway callbacks — deliberately outside the auth:sanctum
        // group, same reason as media/{media} above: an external gateway can't
        // attach a Bearer token. Tenant is resolved from the reference inside
        // the controller instead (see PaymentGatewayController::callback()).
        Route::post('sale/pos/gateways/{gateway}/callback', [PaymentGatewayController::class, 'callback'])
            ->name('sale.pos.gateways.callback');

        Route::middleware(['auth:sanctum', InitializeTenancyByRequestData::class, 'set-permissions-team-id'])
            ->group(function () {
                /**
                 * Notification Module
                 */
                Route::prefix('notification')
                    ->name('notification.')
                    ->group(function () {
                        Route::prefix('notifications')
                            ->name('notifications.')
                            ->group(function () {
                                Route::get('unread-count', [NotificationController::class, 'unreadCount'])->name('unread-count');
                                Route::post('mark-all-read', [NotificationController::class, 'markAllRead'])->name('mark-all-read');

                                Route::get('/', [NotificationController::class, 'index'])->name('index');
                                Route::put('{id}/read', [NotificationController::class, 'markRead'])->name('read');
                                Route::post('{id}/actions/{actionId}', [NotificationController::class, 'runAction'])->name('actions.run');
                                Route::delete('{id}', [NotificationController::class, 'destroy'])->name('destroy');
                            });
                    });

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
                 * People Module
                 */
                Route::prefix('people')
                    ->name('people.')
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

                        // Customers
                        Route::prefix('customers')
                            ->name('customers.')
                            ->group(function () {
                                Route::post('bulk-delete', [CustomerController::class, 'bulkDestroy'])->name('bulk-delete');
                                Route::get('export/pdf', [CustomerController::class, 'exportPdf'])->name('export.pdf');
                                Route::get('export/excel', [CustomerController::class, 'exportExcel'])->name('export.excel');
                                Route::post('import', [CustomerController::class, 'import'])->name('import');

                                Route::get('/', [CustomerController::class, 'index'])->name('index');
                                Route::post('/', [CustomerController::class, 'store'])->name('store');
                                Route::get('{id}', [CustomerController::class, 'show'])->name('show');
                                Route::put('{id}', [CustomerController::class, 'update'])->name('update');
                                Route::delete('{id}', [CustomerController::class, 'destroy'])->name('destroy');
                            });

                        // Sale Agents
                        Route::prefix('sale-agents')
                            ->name('sale-agents.')
                            ->group(function () {
                                Route::post('bulk-delete', [SaleAgentController::class, 'bulkDestroy'])->name('bulk-delete');
                                Route::get('export/pdf', [SaleAgentController::class, 'exportPdf'])->name('export.pdf');
                                Route::get('export/excel', [SaleAgentController::class, 'exportExcel'])->name('export.excel');
                                Route::post('import', [SaleAgentController::class, 'import'])->name('import');

                                Route::get('/', [SaleAgentController::class, 'index'])->name('index');
                                Route::post('/', [SaleAgentController::class, 'store'])->name('store');
                                Route::get('{id}', [SaleAgentController::class, 'show'])->name('show');
                                Route::put('{id}', [SaleAgentController::class, 'update'])->name('update');
                                Route::delete('{id}', [SaleAgentController::class, 'destroy'])->name('destroy');
                            });

                        // Billers
                        Route::prefix('billers')
                            ->name('billers.')
                            ->group(function () {
                                Route::post('bulk-delete', [BillerController::class, 'bulkDestroy'])->name('bulk-delete');
                                Route::get('export/pdf', [BillerController::class, 'exportPdf'])->name('export.pdf');
                                Route::get('export/excel', [BillerController::class, 'exportExcel'])->name('export.excel');
                                Route::post('import', [BillerController::class, 'import'])->name('import');

                                Route::get('/', [BillerController::class, 'index'])->name('index');
                                Route::post('/', [BillerController::class, 'store'])->name('store');
                                Route::get('{id}', [BillerController::class, 'show'])->name('show');
                                Route::put('{id}', [BillerController::class, 'update'])->name('update');
                                Route::delete('{id}', [BillerController::class, 'destroy'])->name('destroy');
                            });
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
                                Route::post('print-barcodes', [ProductController::class, 'printBarcodes'])->name('print-barcodes');
                            });

                        // Barcode Settings
                        Route::prefix('barcode-settings')
                            ->name('barcode-settings.')
                            ->group(function () {
                                Route::post('bulk-delete', [BarcodeSettingController::class, 'bulkDestroy'])->name('bulk-delete');

                                Route::get('/', [BarcodeSettingController::class, 'index'])->name('index');
                                Route::post('/', [BarcodeSettingController::class, 'store'])->name('store');
                                Route::get('{id}', [BarcodeSettingController::class, 'show'])->name('show');
                                Route::put('{id}', [BarcodeSettingController::class, 'update'])->name('update');
                                Route::delete('{id}', [BarcodeSettingController::class, 'destroy'])->name('destroy');
                                Route::put('{id}/set-default', [BarcodeSettingController::class, 'setDefault'])->name('set-default');
                            });

                        // Adjustments
                        Route::prefix('adjustments')
                            ->name('adjustments.')
                            ->group(function () {
                                Route::post('bulk-delete', [AdjustmentController::class, 'bulkDestroy'])->name('bulk-delete');

                                Route::get('/', [AdjustmentController::class, 'index'])->name('index');
                                Route::post('/', [AdjustmentController::class, 'store'])->name('store');
                                Route::get('{id}', [AdjustmentController::class, 'show'])->name('show');
                                Route::put('{id}', [AdjustmentController::class, 'update'])->name('update');
                                Route::delete('{id}', [AdjustmentController::class, 'destroy'])->name('destroy');
                            });

                        // Stock Counts
                        Route::prefix('stock-counts')
                            ->name('stock-counts.')
                            ->group(function () {
                                Route::post('bulk-delete', [StockCountController::class, 'bulkDestroy'])->name('bulk-delete');

                                Route::get('/', [StockCountController::class, 'index'])->name('index');
                                Route::post('/', [StockCountController::class, 'store'])->name('store');
                                Route::get('{id}', [StockCountController::class, 'show'])->name('show');
                                Route::put('{id}', [StockCountController::class, 'update'])->name('update');
                                Route::delete('{id}', [StockCountController::class, 'destroy'])->name('destroy');
                                Route::post('{id}/submit-count', [StockCountController::class, 'submitCount'])->name('submit-count');
                                Route::post('{id}/adjust', [StockCountController::class, 'adjust'])->name('adjust');
                            });

                        // Damage Stocks
                        Route::prefix('damage-stocks')
                            ->name('damage-stocks.')
                            ->group(function () {
                                Route::post('bulk-delete', [DamageStockController::class, 'bulkDestroy'])->name('bulk-delete');

                                Route::get('/', [DamageStockController::class, 'index'])->name('index');
                                Route::post('/', [DamageStockController::class, 'store'])->name('store');
                                Route::get('{id}', [DamageStockController::class, 'show'])->name('show');
                                Route::put('{id}', [DamageStockController::class, 'update'])->name('update');
                                Route::delete('{id}', [DamageStockController::class, 'destroy'])->name('destroy');
                            });
                    });

                /**
                 * Purchase Module
                 */
                Route::prefix('purchase')
                    ->name('purchase.')
                    ->group(function () {
                        // Purchases
                        Route::prefix('purchases')
                            ->name('purchases.')
                            ->group(function () {
                                Route::post('bulk-delete', [PurchaseController::class, 'bulkDestroy'])->name('bulk-delete');
                                Route::get('export/pdf', [PurchaseController::class, 'exportPdf'])->name('export.pdf');
                                Route::get('export/excel', [PurchaseController::class, 'exportExcel'])->name('export.excel');
                                Route::post('import', [PurchaseController::class, 'import'])->name('import');

                                Route::get('/', [PurchaseController::class, 'index'])->name('index');
                                Route::post('/', [PurchaseController::class, 'store'])->name('store');
                                Route::get('{id}', [PurchaseController::class, 'show'])->name('show');
                                Route::put('{id}', [PurchaseController::class, 'update'])->name('update');
                                Route::delete('{id}', [PurchaseController::class, 'destroy'])->name('destroy');
                            });
                    });

                /**
                 * Sale Module
                 */
                Route::prefix('sale')
                    ->name('sale.')
                    ->group(function () {
                        // Sales
                        Route::prefix('sales')
                            ->name('sales.')
                            ->group(function () {
                                Route::post('bulk-delete', [SaleController::class, 'bulkDestroy'])->name('bulk-delete');
                                Route::get('export/pdf', [SaleController::class, 'exportPdf'])->name('export.pdf');
                                Route::get('export/excel', [SaleController::class, 'exportExcel'])->name('export.excel');
                                Route::post('import', [SaleController::class, 'import'])->name('import');

                                Route::get('/', [SaleController::class, 'index'])->name('index');
                                Route::post('/', [SaleController::class, 'store'])->name('store');
                                Route::get('{id}', [SaleController::class, 'show'])->name('show');
                                Route::put('{id}', [SaleController::class, 'update'])->name('update');
                                Route::delete('{id}', [SaleController::class, 'destroy'])->name('destroy');
                                Route::post('{id}/add-payment', [SaleController::class, 'addPayment'])->name('add-payment');
                            });

                        // Sale settings
                        Route::prefix('settings')
                            ->name('settings.')
                            ->group(function () {
                                Route::get('/', [SaleSettingController::class, 'show'])->name('show');
                                Route::put('/', [SaleSettingController::class, 'update'])->name('update');
                            });

                        // Gift Cards
                        Route::prefix('gift-cards')
                            ->name('gift-cards.')
                            ->group(function () {
                                Route::post('bulk-delete', [GiftCardController::class, 'bulkDestroy'])->name('bulk-delete');

                                Route::get('/', [GiftCardController::class, 'index'])->name('index');
                                Route::post('/', [GiftCardController::class, 'store'])->name('store');
                                Route::get('{id}', [GiftCardController::class, 'show'])->name('show');
                                Route::put('{id}', [GiftCardController::class, 'update'])->name('update');
                                Route::delete('{id}', [GiftCardController::class, 'destroy'])->name('destroy');
                                Route::post('{id}/recharge', [GiftCardController::class, 'recharge'])->name('recharge');
                            });

                        // Coupons
                        Route::prefix('coupons')
                            ->name('coupons.')
                            ->group(function () {
                                Route::post('bulk-delete', [CouponController::class, 'bulkDestroy'])->name('bulk-delete');
                                Route::get('export/pdf', [CouponController::class, 'exportPdf'])->name('export.pdf');
                                Route::get('export/excel', [CouponController::class, 'exportExcel'])->name('export.excel');
                                Route::post('import', [CouponController::class, 'import'])->name('import');
                                Route::get('generate-code', [CouponController::class, 'generateCode'])->name('generate-code');

                                Route::get('/', [CouponController::class, 'index'])->name('index');
                                Route::post('/', [CouponController::class, 'store'])->name('store');
                                Route::get('{id}', [CouponController::class, 'show'])->name('show');
                                Route::put('{id}', [CouponController::class, 'update'])->name('update');
                                Route::delete('{id}', [CouponController::class, 'destroy'])->name('destroy');
                            });

                        // Couriers
                        Route::prefix('couriers')
                            ->name('couriers.')
                            ->group(function () {
                                Route::post('bulk-delete', [CourierController::class, 'bulkDestroy'])->name('bulk-delete');
                                Route::get('export/pdf', [CourierController::class, 'exportPdf'])->name('export.pdf');
                                Route::get('export/excel', [CourierController::class, 'exportExcel'])->name('export.excel');
                                Route::post('import', [CourierController::class, 'import'])->name('import');

                                Route::get('/', [CourierController::class, 'index'])->name('index');
                                Route::post('/', [CourierController::class, 'store'])->name('store');
                                Route::get('{id}', [CourierController::class, 'show'])->name('show');
                                Route::put('{id}', [CourierController::class, 'update'])->name('update');
                                Route::delete('{id}', [CourierController::class, 'destroy'])->name('destroy');
                            });

                        // Installment Plans
                        Route::prefix('installment-plans')
                            ->name('installment-plans.')
                            ->group(function () {
                                Route::get('/', [InstallmentPlanController::class, 'index'])->name('index');
                                Route::get('{id}', [InstallmentPlanController::class, 'show'])->name('show');
                                Route::post('installments/{installmentId}/pay', [InstallmentPlanController::class, 'pay'])->name('pay');
                            });

                        // Packing Slips
                        Route::prefix('packing-slips')
                            ->name('packing-slips.')
                            ->group(function () {
                                Route::get('available-lines/{saleId}', [PackingSlipController::class, 'availableLines'])->name('available-lines');

                                Route::get('/', [PackingSlipController::class, 'index'])->name('index');
                                Route::post('/', [PackingSlipController::class, 'store'])->name('store');
                                Route::get('{id}', [PackingSlipController::class, 'show'])->name('show');
                                Route::delete('{id}', [PackingSlipController::class, 'destroy'])->name('destroy');
                            });

                        // Deliveries
                        Route::prefix('deliveries')
                            ->name('deliveries.')
                            ->group(function () {
                                Route::post('bulk-delete', [DeliveryController::class, 'bulkDestroy'])->name('bulk-delete');

                                Route::get('/', [DeliveryController::class, 'index'])->name('index');
                                Route::post('/', [DeliveryController::class, 'store'])->name('store');
                                Route::get('{id}', [DeliveryController::class, 'show'])->name('show');
                                Route::put('{id}', [DeliveryController::class, 'update'])->name('update');
                                Route::delete('{id}', [DeliveryController::class, 'destroy'])->name('destroy');
                                Route::get('{id}/track', [DeliveryController::class, 'track'])->name('track');
                            });

                        // Sale Returns
                        Route::prefix('sale-returns')
                            ->name('sale-returns.')
                            ->group(function () {
                                Route::get('available-lines/{saleId}', [SaleReturnController::class, 'availableLines'])->name('available-lines');

                                Route::get('/', [SaleReturnController::class, 'index'])->name('index');
                                Route::post('/', [SaleReturnController::class, 'store'])->name('store');
                                Route::get('{id}', [SaleReturnController::class, 'show'])->name('show');
                                Route::delete('{id}', [SaleReturnController::class, 'destroy'])->name('destroy');
                            });

                        // Sale Exchanges
                        Route::prefix('sale-exchanges')
                            ->name('sale-exchanges.')
                            ->group(function () {
                                Route::get('sale-lines/{saleId}', [SaleExchangeController::class, 'saleLines'])->name('sale-lines');
                                Route::get('search-by-reference', [SaleExchangeController::class, 'searchByReference'])->name('search-by-reference');

                                Route::get('/', [SaleExchangeController::class, 'index'])->name('index');
                                Route::post('/', [SaleExchangeController::class, 'store'])->name('store');
                                Route::get('{id}', [SaleExchangeController::class, 'show'])->name('show');
                            });

                        // Challans
                        Route::prefix('challans')
                            ->name('challans.')
                            ->group(function () {
                                Route::get('available-packing-slips', [ChallanController::class, 'availablePackingSlips'])->name('available-packing-slips');

                                Route::get('/', [ChallanController::class, 'index'])->name('index');
                                Route::post('/', [ChallanController::class, 'store'])->name('store');
                                Route::get('{id}', [ChallanController::class, 'show'])->name('show');
                                Route::post('{id}/finalize', [ChallanController::class, 'finalize'])->name('finalize');
                            });

                        // POS
                        Route::prefix('pos')
                            ->name('pos.')
                            ->group(function () {
                                Route::get('settings', [PosSettingController::class, 'show'])->name('settings.show');
                                Route::put('settings', [PosSettingController::class, 'update'])->name('settings.update');

                                Route::prefix('cash-register')
                                    ->name('cash-register.')
                                    ->group(function () {
                                        Route::get('availability/{warehouse}', [CashRegisterController::class, 'availability'])->name('availability');
                                        Route::post('/', [CashRegisterController::class, 'open'])->name('open');
                                        Route::put('{id}/close', [CashRegisterController::class, 'close'])->name('close');
                                        Route::get('{id}', [CashRegisterController::class, 'show'])->name('show');
                                    });

                                Route::prefix('gateways')
                                    ->name('gateways.')
                                    ->group(function () {
                                        Route::post('{gateway}/initiate', [PaymentGatewayController::class, 'initiate'])->name('initiate');
                                        Route::get('{gateway}/status/{reference}', [PaymentGatewayController::class, 'status'])->name('status');
                                    });
                            });
                    });
            });
    });
