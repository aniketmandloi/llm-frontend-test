import {
  Activity,
  ChartNoAxesColumn,
  FolderKanban,
  Kanban,
  LayoutDashboard,
  ListTodo,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Second key of the `g` prefix shortcut, e.g. `g` then `d` opens the dashboard. */
  shortcut: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "d" },
  { href: "/projects", label: "Projects", icon: FolderKanban, shortcut: "p" },
  { href: "/board", label: "Board", icon: Kanban, shortcut: "b" },
  { href: "/tasks", label: "Tasks", icon: ListTodo, shortcut: "t" },
  { href: "/analytics", label: "Analytics", icon: ChartNoAxesColumn, shortcut: "a" },
  { href: "/activity", label: "Activity", icon: Activity, shortcut: "v" },
  { href: "/settings", label: "Settings", icon: Settings, shortcut: "s" },
];

export const ROUTE_LABELS: Record<string, string> = Object.fromEntries(
  NAV_ITEMS.map((item) => [item.href, item.label]),
);

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
