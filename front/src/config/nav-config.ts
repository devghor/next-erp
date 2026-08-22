import { NavGroup } from '@/types';

/**
 * Navigation configuration.
 *
 * This configuration is used for both the sidebar navigation and Cmd+K bar.
 * Items are organized into groups, each rendered with a SidebarGroupLabel.
 *
 * Each item can optionally carry a `permissions` array (see `NavItem` in
 * `@/types`) for visibility — shown if the session holds any listed key,
 * checked by `useFilteredNavItems`/`useFilteredNavGroups`.
 */
export const navGroups: NavGroup[] = [
  {
    label: '',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd']
        // for save landing it is commenting
        // permissions:['READ_DASHBOARD_OVERVIEW']
      }
    ]
  },
  {
    label: 'Settings',
    items: [
      {
        title: 'Users',
        url: '/dashboard/settings/users',
        icon: 'teams',
        isActive: true,
        items: [],
        permissions: ['LIST_SETTINGS_USERS']
      },
      {
        title: 'Roles',
        url: '/dashboard/settings/roles',
        icon: 'lock',
        items: [],
        permissions: ['LIST_SETTINGS_ROLES']
      },
      {
        title: 'Warehouses',
        url: '/dashboard/settings/warehouses',
        icon: 'warehouse',
        items: [],
        permissions: ['LIST_SETTINGS_WAREHOUSES']
      },
      {
        title: 'Currencies',
        url: '/dashboard/settings/currencies',
        icon: 'currency',
        items: [],
        permissions: ['LIST_SETTINGS_CURRENCIES']
      },
      {
        title: 'Taxes',
        url: '/dashboard/settings/taxes',
        icon: 'tax',
        items: [],
        permissions: ['LIST_SETTINGS_TAXES']
      },
      {
        title: 'Custom Fields',
        url: '/dashboard/settings/custom-fields',
        icon: 'customField',
        items: [],
        permissions: ['LIST_SETTINGS_CUSTOM_FIELDS']
      },
      {
        title: 'Profile',
        url: '/dashboard/settings/profile',
        icon: 'profile',
        shortcut: ['m', 'm'],
        permissions: ['LIST_PROFILE']
      }
    ]
  },
  {
    label: 'Product',
    items: [
      {
        title: 'Products',
        url: '/dashboard/product/products',
        icon: 'product',
        items: [],
        permissions: ['LIST_PRODUCT_PRODUCTS']
      },
      {
        title: 'Categories',
        url: '/dashboard/product/categories',
        icon: 'category',
        items: [],
        permissions: ['LIST_PRODUCT_CATEGORIES']
      },
      {
        title: 'Brands',
        url: '/dashboard/product/brands',
        icon: 'brand',
        items: [],
        permissions: ['LIST_PRODUCT_BRANDS']
      },
      {
        title: 'Units',
        url: '/dashboard/product/units',
        icon: 'unit',
        items: [],
        permissions: ['LIST_PRODUCT_UNITS']
      },
      {
        title: 'Print Barcodes',
        url: '/dashboard/product/print-barcodes',
        icon: 'printer',
        items: [],
        permissions: ['READ_PRODUCT_PRODUCTS']
      },
      {
        title: 'Barcode Settings',
        url: '/dashboard/product/barcode-settings',
        icon: 'barcode',
        items: [],
        permissions: ['LIST_PRODUCT_BARCODE_SETTINGS']
      },
      {
        title: 'Adjustments',
        url: '/dashboard/product/adjustments',
        icon: 'adjustments',
        items: [],
        permissions: ['LIST_PRODUCT_ADJUSTMENTS']
      }
    ]
  },
  {
    label: 'Purchase',
    items: [
      {
        title: 'Purchases',
        url: '/dashboard/purchase/purchases',
        icon: 'purchase',
        items: [],
        permissions: ['LIST_PURCHASE_PURCHASES']
      },
      {
        title: 'Suppliers',
        url: '/dashboard/purchase/suppliers',
        icon: 'supplier',
        items: [],
        permissions: ['LIST_PURCHASE_SUPPLIERS']
      }
    ]
  },
  {
    label: 'Others',
    items: [
      {
        title: 'Notifications',
        url: '/dashboard/notifications',
        icon: 'notification',
        shortcut: ['n', 'n'],
        permissions: ['LIST_NOTIFICATIONS']
      }
    ]
  }
];

/**
 * url -> required permission keys, flattened from `navGroups` (incl. nested
 * `items`). Consumed by `middleware.ts` for route-level protection — a route
 * present here is allowed only if the session holds at least one listed key.
 */
export const routePermissions: Record<string, string[]> = navGroups
  .flatMap((group) => group.items.flatMap((item) => [item, ...(item.items ?? [])]))
  .reduce<Record<string, string[]>>((map, item) => {
    if (item.permissions) {
      map[item.url] = item.permissions;
    }
    return map;
  }, {});
