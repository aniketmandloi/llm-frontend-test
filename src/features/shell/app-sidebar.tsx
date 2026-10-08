"use client";

import { workspaceActions, useWorkspaceState } from "@/store/workspace-store";
import { cn } from "@/lib/utils";
import { SidebarContent } from "./sidebar-content";

/** Desktop sidebar. It shares the canvas rather than sitting in a bordered column. Collapsed state persists. */
export function AppSidebar() {
  const { preferences } = useWorkspaceState();
  const collapsed = preferences.sidebarCollapsed;

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 bg-sidebar transition-[width] duration-300 ease-out-expo md:flex md:flex-col",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <SidebarContent collapsed={collapsed} onToggleCollapsed={workspaceActions.toggleSidebar} />
    </aside>
  );
}
