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

    /**
     * Purchase
     */

    // suppliers
    case ListPurchaseSuppliers = 'LIST_PURCHASE_SUPPLIERS';
    case CreatePurchaseSuppliers = 'CREATE_PURCHASE_SUPPLIERS';
    case ReadPurchaseSuppliers = 'READ_PURCHASE_SUPPLIERS';
    case UpdatePurchaseSuppliers = 'UPDATE_PURCHASE_SUPPLIERS';
    case DeletePurchaseSuppliers = 'DELETE_PURCHASE_SUPPLIERS';

    // purchases
    case ListPurchasePurchases = 'LIST_PURCHASE_PURCHASES';
    case CreatePurchasePurchases = 'CREATE_PURCHASE_PURCHASES';
    case ReadPurchasePurchases = 'READ_PURCHASE_PURCHASES';
    case UpdatePurchasePurchases = 'UPDATE_PURCHASE_PURCHASES';
    case DeletePurchasePurchases = 'DELETE_PURCHASE_PURCHASES';
}
