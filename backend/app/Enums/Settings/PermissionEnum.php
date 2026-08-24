<?php

namespace App\Enums\Settings;

enum PermissionEnum: string
{
    /**
     * Dashboard
     */
    case ReadDashboardOverview = 'READ_DASHBOARD_OVERVIEW';

    /**
     * Settings
     */

    // users
    case ListSettingsUsers = 'LIST_SETTINGS_USERS';
    case CreateSettingsUsers = 'CREATE_SETTINGS_USERS';
    case ReadSettingsUsers = 'READ_SETTINGS_USERS';
    case UpdateSettingsUsers = 'UPDATE_SETTINGS_USERS';
    case DeleteSettingsUsers = 'DELETE_SETTINGS_USERS';

    // roles
    case ListSettingsRoles = 'LIST_SETTINGS_ROLES';
    case CreateSettingsRoles = 'CREATE_SETTINGS_ROLES';
    case ReadSettingsRoles = 'READ_SETTINGS_ROLES';
    case UpdateSettingsRoles = 'UPDATE_SETTINGS_ROLES';
    case DeleteSettingsRoles = 'DELETE_SETTINGS_ROLES';

    // warehouses
    case ListSettingsWarehouses = 'LIST_SETTINGS_WAREHOUSES';
    case CreateSettingsWarehouses = 'CREATE_SETTINGS_WAREHOUSES';
    case ReadSettingsWarehouses = 'READ_SETTINGS_WAREHOUSES';
    case UpdateSettingsWarehouses = 'UPDATE_SETTINGS_WAREHOUSES';
    case DeleteSettingsWarehouses = 'DELETE_SETTINGS_WAREHOUSES';

    // currencies
    case ListSettingsCurrencies = 'LIST_SETTINGS_CURRENCIES';
    case CreateSettingsCurrencies = 'CREATE_SETTINGS_CURRENCIES';
    case ReadSettingsCurrencies = 'READ_SETTINGS_CURRENCIES';
    case UpdateSettingsCurrencies = 'UPDATE_SETTINGS_CURRENCIES';
    case DeleteSettingsCurrencies = 'DELETE_SETTINGS_CURRENCIES';

    // taxes
    case ListSettingsTaxes = 'LIST_SETTINGS_TAXES';
    case CreateSettingsTaxes = 'CREATE_SETTINGS_TAXES';
    case ReadSettingsTaxes = 'READ_SETTINGS_TAXES';
    case UpdateSettingsTaxes = 'UPDATE_SETTINGS_TAXES';
    case DeleteSettingsTaxes = 'DELETE_SETTINGS_TAXES';

    // custom fields
    case ListSettingsCustomFields = 'LIST_SETTINGS_CUSTOM_FIELDS';
    case CreateSettingsCustomFields = 'CREATE_SETTINGS_CUSTOM_FIELDS';
    case ReadSettingsCustomFields = 'READ_SETTINGS_CUSTOM_FIELDS';
    case UpdateSettingsCustomFields = 'UPDATE_SETTINGS_CUSTOM_FIELDS';
    case DeleteSettingsCustomFields = 'DELETE_SETTINGS_CUSTOM_FIELDS';

    /**
     * Product
     */

    // categories
    case ListProductCategories = 'LIST_PRODUCT_CATEGORIES';
    case CreateProductCategories = 'CREATE_PRODUCT_CATEGORIES';
    case ReadProductCategories = 'READ_PRODUCT_CATEGORIES';
    case UpdateProductCategories = 'UPDATE_PRODUCT_CATEGORIES';
    case DeleteProductCategories = 'DELETE_PRODUCT_CATEGORIES';

    // brands
    case ListProductBrands = 'LIST_PRODUCT_BRANDS';
    case CreateProductBrands = 'CREATE_PRODUCT_BRANDS';
    case ReadProductBrands = 'READ_PRODUCT_BRANDS';
    case UpdateProductBrands = 'UPDATE_PRODUCT_BRANDS';
    case DeleteProductBrands = 'DELETE_PRODUCT_BRANDS';

    // units
    case ListProductUnits = 'LIST_PRODUCT_UNITS';
    case CreateProductUnits = 'CREATE_PRODUCT_UNITS';
    case ReadProductUnits = 'READ_PRODUCT_UNITS';
    case UpdateProductUnits = 'UPDATE_PRODUCT_UNITS';
    case DeleteProductUnits = 'DELETE_PRODUCT_UNITS';

    // products
    case ListProductProducts = 'LIST_PRODUCT_PRODUCTS';
    case CreateProductProducts = 'CREATE_PRODUCT_PRODUCTS';
    case ReadProductProducts = 'READ_PRODUCT_PRODUCTS';
    case UpdateProductProducts = 'UPDATE_PRODUCT_PRODUCTS';
    case DeleteProductProducts = 'DELETE_PRODUCT_PRODUCTS';

    // barcode settings
    case ListProductBarcodeSettings = 'LIST_PRODUCT_BARCODE_SETTINGS';
    case CreateProductBarcodeSettings = 'CREATE_PRODUCT_BARCODE_SETTINGS';
    case ReadProductBarcodeSettings = 'READ_PRODUCT_BARCODE_SETTINGS';
    case UpdateProductBarcodeSettings = 'UPDATE_PRODUCT_BARCODE_SETTINGS';
    case DeleteProductBarcodeSettings = 'DELETE_PRODUCT_BARCODE_SETTINGS';

    // adjustments
    case ListProductAdjustments = 'LIST_PRODUCT_ADJUSTMENTS';
    case CreateProductAdjustments = 'CREATE_PRODUCT_ADJUSTMENTS';
    case ReadProductAdjustments = 'READ_PRODUCT_ADJUSTMENTS';
    case UpdateProductAdjustments = 'UPDATE_PRODUCT_ADJUSTMENTS';
    case DeleteProductAdjustments = 'DELETE_PRODUCT_ADJUSTMENTS';

    // stock counts
    case ListProductStockCounts = 'LIST_PRODUCT_STOCK_COUNTS';
    case CreateProductStockCounts = 'CREATE_PRODUCT_STOCK_COUNTS';
    case ReadProductStockCounts = 'READ_PRODUCT_STOCK_COUNTS';
    case UpdateProductStockCounts = 'UPDATE_PRODUCT_STOCK_COUNTS';
    case DeleteProductStockCounts = 'DELETE_PRODUCT_STOCK_COUNTS';

    // damage stocks
    case ListProductDamageStocks = 'LIST_PRODUCT_DAMAGE_STOCKS';
    case CreateProductDamageStocks = 'CREATE_PRODUCT_DAMAGE_STOCKS';
    case ReadProductDamageStocks = 'READ_PRODUCT_DAMAGE_STOCKS';
    case UpdateProductDamageStocks = 'UPDATE_PRODUCT_DAMAGE_STOCKS';
    case DeleteProductDamageStocks = 'DELETE_PRODUCT_DAMAGE_STOCKS';

    /**
     * People
     */

    // suppliers
    case ListPeopleSuppliers = 'LIST_PEOPLE_SUPPLIERS';
    case CreatePeopleSuppliers = 'CREATE_PEOPLE_SUPPLIERS';
    case ReadPeopleSuppliers = 'READ_PEOPLE_SUPPLIERS';
    case UpdatePeopleSuppliers = 'UPDATE_PEOPLE_SUPPLIERS';
    case DeletePeopleSuppliers = 'DELETE_PEOPLE_SUPPLIERS';

    // customers
    case ListPeopleCustomers = 'LIST_PEOPLE_CUSTOMERS';
    case CreatePeopleCustomers = 'CREATE_PEOPLE_CUSTOMERS';
    case ReadPeopleCustomers = 'READ_PEOPLE_CUSTOMERS';
    case UpdatePeopleCustomers = 'UPDATE_PEOPLE_CUSTOMERS';
    case DeletePeopleCustomers = 'DELETE_PEOPLE_CUSTOMERS';

    // sale agents
    case ListPeopleSaleAgents = 'LIST_PEOPLE_SALE_AGENTS';
    case CreatePeopleSaleAgents = 'CREATE_PEOPLE_SALE_AGENTS';
    case ReadPeopleSaleAgents = 'READ_PEOPLE_SALE_AGENTS';
    case UpdatePeopleSaleAgents = 'UPDATE_PEOPLE_SALE_AGENTS';
    case DeletePeopleSaleAgents = 'DELETE_PEOPLE_SALE_AGENTS';

    // billers
    case ListPeopleBillers = 'LIST_PEOPLE_BILLERS';
    case CreatePeopleBillers = 'CREATE_PEOPLE_BILLERS';
    case ReadPeopleBillers = 'READ_PEOPLE_BILLERS';
    case UpdatePeopleBillers = 'UPDATE_PEOPLE_BILLERS';
    case DeletePeopleBillers = 'DELETE_PEOPLE_BILLERS';

    /**
     * Purchase
     */

    // purchases
    case ListPurchasePurchases = 'LIST_PURCHASE_PURCHASES';
    case CreatePurchasePurchases = 'CREATE_PURCHASE_PURCHASES';
    case ReadPurchasePurchases = 'READ_PURCHASE_PURCHASES';
    case UpdatePurchasePurchases = 'UPDATE_PURCHASE_PURCHASES';
    case DeletePurchasePurchases = 'DELETE_PURCHASE_PURCHASES';

    /**
     * Sale
     */

    // sales
    case ListSaleSales = 'LIST_SALE_SALES';
    case CreateSaleSales = 'CREATE_SALE_SALES';
    case ReadSaleSales = 'READ_SALE_SALES';
    case UpdateSaleSales = 'UPDATE_SALE_SALES';
    case DeleteSaleSales = 'DELETE_SALE_SALES';

    // gift cards
    case ListSaleGiftCards = 'LIST_SALE_GIFT_CARDS';
    case CreateSaleGiftCards = 'CREATE_SALE_GIFT_CARDS';
    case ReadSaleGiftCards = 'READ_SALE_GIFT_CARDS';
    case UpdateSaleGiftCards = 'UPDATE_SALE_GIFT_CARDS';
    case DeleteSaleGiftCards = 'DELETE_SALE_GIFT_CARDS';

    // coupons
    case ListSaleCoupons = 'LIST_SALE_COUPONS';
    case CreateSaleCoupons = 'CREATE_SALE_COUPONS';
    case ReadSaleCoupons = 'READ_SALE_COUPONS';
    case UpdateSaleCoupons = 'UPDATE_SALE_COUPONS';
    case DeleteSaleCoupons = 'DELETE_SALE_COUPONS';

    // couriers
    case ListSaleCouriers = 'LIST_SALE_COURIERS';
    case CreateSaleCouriers = 'CREATE_SALE_COURIERS';
    case ReadSaleCouriers = 'READ_SALE_COURIERS';
    case UpdateSaleCouriers = 'UPDATE_SALE_COURIERS';
    case DeleteSaleCouriers = 'DELETE_SALE_COURIERS';

    // installment plans (created programmatically from a sale — no create/delete permission)
    case ListSaleInstallmentPlans = 'LIST_SALE_INSTALLMENT_PLANS';
    case ReadSaleInstallmentPlans = 'READ_SALE_INSTALLMENT_PLANS';
    case UpdateSaleInstallmentPlans = 'UPDATE_SALE_INSTALLMENT_PLANS';

    // packing slips (no update — create/delete only)
    case ListSalePackingSlips = 'LIST_SALE_PACKING_SLIPS';
    case CreateSalePackingSlips = 'CREATE_SALE_PACKING_SLIPS';
    case ReadSalePackingSlips = 'READ_SALE_PACKING_SLIPS';
    case DeleteSalePackingSlips = 'DELETE_SALE_PACKING_SLIPS';

    // deliveries
    case ListSaleDeliveries = 'LIST_SALE_DELIVERIES';
    case CreateSaleDeliveries = 'CREATE_SALE_DELIVERIES';
    case ReadSaleDeliveries = 'READ_SALE_DELIVERIES';
    case UpdateSaleDeliveries = 'UPDATE_SALE_DELIVERIES';
    case DeleteSaleDeliveries = 'DELETE_SALE_DELIVERIES';

    // sale returns (no update — create/delete only)
    case ListSaleSaleReturns = 'LIST_SALE_SALE_RETURNS';
    case CreateSaleSaleReturns = 'CREATE_SALE_SALE_RETURNS';
    case ReadSaleSaleReturns = 'READ_SALE_SALE_RETURNS';
    case DeleteSaleSaleReturns = 'DELETE_SALE_SALE_RETURNS';

    // sale exchanges (no update/delete — immutable ledger entries)
    case ListSaleExchanges = 'LIST_SALE_EXCHANGES';
    case CreateSaleExchanges = 'CREATE_SALE_EXCHANGES';
    case ReadSaleExchanges = 'READ_SALE_EXCHANGES';

    // challans (no delete — closed challans are an audit trail)
    case ListSaleChallans = 'LIST_SALE_CHALLANS';
    case CreateSaleChallans = 'CREATE_SALE_CHALLANS';
    case ReadSaleChallans = 'READ_SALE_CHALLANS';
    case UpdateSaleChallans = 'UPDATE_SALE_CHALLANS';

    // POS (page access + settings + cash register — POS sale creation itself
    // reuses CreateSaleSales, no separate permission)
    case AccessSalePos = 'ACCESS_SALE_POS';
    case ReadSalePosSettings = 'READ_SALE_POS_SETTINGS';
    case UpdateSalePosSettings = 'UPDATE_SALE_POS_SETTINGS';
    case ManageSaleCashRegister = 'MANAGE_SALE_CASH_REGISTER';
}
