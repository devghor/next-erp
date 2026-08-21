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
}
