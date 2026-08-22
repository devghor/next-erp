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
}
