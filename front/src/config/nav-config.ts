import { NavGroup } from "@/types";

/**
 * Navigation configuration.
 *
 * This configuration is used for both the sidebar navigation and Cmd+K bar.
 * Items are organized into groups, each rendered with a SidebarGroupLabel.
 *
 * Each item can optionally carry an `access` property (see `PermissionCheck`
 * in `@/types`) for role-based visibility once a real role/permission model
 * exists — unused for now since every item below is visible to any signed-in user.
 */
export const navGroups: NavGroup[] = [
  {
    label: "",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard/overview",
        icon: "dashboard",
        isActive: false,
        shortcut: ["d", "d"],
        items: [],
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "Users",
        url: "/dashboard/settings/users",
        icon: "teams",
        isActive: true,
        items: [],
      },
      {
        title: "Profile",
        url: "/dashboard/settings/profile",
        icon: "profile",
        shortcut: ["m", "m"],
      },
    ],
  },
  {
    label: "Others",
    items: [
      {
        title: "Notifications",
        url: "/dashboard/notifications",
        icon: "notification",
        shortcut: ["n", "n"],
      },
    ],
  },
];
