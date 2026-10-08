"use client";

import { Menu, PanelLeft, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { useTaskSheet } from "@/features/tasks/task-sheet-context";
import { workspaceActions, useWorkspaceState } from "@/store/workspace-store";
import { Breadcrumbs } from "./breadcrumbs";
import { UserMenu } from "./user-menu";

export function Topbar({
  onOpenPalette,
  onOpenMobileNav,
}: {
  onOpenPalette: () => void;
  onOpenMobileNav: () => void;
}) {
  const { openCreate } = useTaskSheet();
  const { preferences } = useWorkspaceState();
  const collapsed = preferences.sidebarCollapsed;

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-4">
      <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={onOpenMobileNav} aria-label="Open navigation">
        <Menu aria-hidden />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="hidden md:inline-flex"
        onClick={workspaceActions.toggleSidebar}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-keyshortcuts="["
      >
        <PanelLeft aria-hidden />
      </Button>

      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onOpenPalette}
        className="hidden text-muted-foreground sm:inline-flex"
        aria-keyshortcuts="Control+K Meta+K"
      >
        <Search aria-hidden />
        <span className="w-24 text-left">Search</span>
        <Kbd>⌘K</Kbd>
      </Button>
      <Button variant="ghost" size="icon-sm" className="sm:hidden" onClick={onOpenPalette} aria-label="Search">
        <Search aria-hidden />
      </Button>

      <Button size="sm" onClick={() => openCreate()} aria-keyshortcuts="c">
        <Plus aria-hidden />
        <span className="hidden sm:inline">New task</span>
        <span className="sr-only sm:hidden">New task</span>
      </Button>

      <UserMenu />
    </header>
  );
}
