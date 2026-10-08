"use client";

import { workspaceActions, useWorkspaceState } from "@/store/workspace-store";
import { cn } from "@/lib/utils";
import { SidebarContent } from "./sidebar-content";

/** Desktop sidebar. Collapsed state is a preference, so it survives reloads. */
export function AppSidebar() {
  const { preferences } = useWorkspaceState();
  const collapsed = preferences.sidebarCollapsed;

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 border-r bg-sidebar transition-[width] duration-200 md:flex md:flex-col",
        collapsed ? "w-14" : "w-60",
      )}
    >
      <SidebarContent
        collapsed={collapsed}
        onToggleCollapsed={workspaceActions.toggleSidebar}
      />
    </aside>
  );
}
