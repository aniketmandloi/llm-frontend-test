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
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/65 sm:px-6 lg:px-10">
      <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={onOpenMobileNav} aria-label="Open navigation">
        <Menu aria-hidden />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="hidden text-muted-foreground md:inline-flex"
        onClick={workspaceActions.toggleSidebar}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-keyshortcuts="["
      >
        <PanelLeft aria-hidden />
      </Button>

      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>

      <button
        type="button"
        onClick={onOpenPalette}
        aria-keyshortcuts="Control+K Meta+K"
        className="hidden h-9 w-64 items-center gap-2 rounded-lg border bg-card px-3 text-sm text-muted-foreground shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none lg:flex"
      >
        <Search className="size-4" aria-hidden />
        <span className="flex-1 text-left">Search tasks and projects</span>
        <Kbd>⌘K</Kbd>
      </button>
      <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={onOpenPalette} aria-label="Search">
        <Search aria-hidden />
      </Button>

      <Button size="sm" onClick={() => openCreate()} aria-keyshortcuts="c" className="gap-1.5 shadow-sm">
        <Plus aria-hidden />
        <span className="hidden sm:inline">New task</span>
        <span className="sr-only sm:hidden">New task</span>
      </Button>

      <UserMenu />
    </header>
  );
}
