"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TONE_CLASSES } from "@/components/common/tone";
import { liveProjects } from "@/domain/stats";
import { useWorkspaceState } from "@/store/workspace-store";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActivePath } from "./nav";
import { WorkspaceSwitcher } from "./workspace-switcher";

interface SidebarContentProps {
  collapsed: boolean;
  onNavigate?: () => void;
  onToggleCollapsed?: () => void;
}

export function SidebarContent({ collapsed, onNavigate, onToggleCollapsed }: SidebarContentProps) {
  const pathname = usePathname();
  const { projects } = useWorkspaceState();
  const activeProjects = liveProjects(projects).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex h-full flex-col gap-4 p-3">
      <div className="flex items-center">
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      <nav aria-label="Main" className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);
          const link = (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              aria-label={collapsed ? item.label : undefined}
              className={cn(
                "flex h-8 items-center gap-2.5 rounded-md px-2 text-sm text-muted-foreground transition-colors",
                "hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                active && "bg-muted font-medium text-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <item.icon className="size-4 shrink-0" aria-hidden />
              {collapsed ? null : <span className="truncate">{item.label}</span>}
            </Link>
          );

          if (!collapsed) return link;
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">
                {item.label} <Kbd className="ml-1">g {item.shortcut}</Kbd>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {collapsed ? null : (
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
          <div className="flex items-center justify-between px-2 pb-1">
            <span className="text-xs font-medium text-muted-foreground">Projects</span>
            <span className="text-xs text-muted-foreground tabular-nums">{activeProjects.length}</span>
          </div>
          <ul className="flex flex-col gap-0.5 overflow-y-auto">
            {activeProjects.map((project) => {
              const active = pathname === `/projects/${project.id}`;
              return (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.id}`}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-8 items-center gap-2.5 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                      active && "bg-muted font-medium text-foreground",
                    )}
                  >
                    <span aria-hidden className={cn("size-2 shrink-0 rounded-full", TONE_CLASSES[project.tone].dot)} />
                    <span className="truncate">{project.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {onToggleCollapsed ? (
        <div className={cn("mt-auto flex", collapsed ? "justify-center" : "justify-between")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onToggleCollapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <PanelLeftOpen aria-hidden /> : <PanelLeftClose aria-hidden />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"} <Kbd className="ml-1">[</Kbd>
            </TooltipContent>
          </Tooltip>
        </div>
      ) : null}
    </div>
  );
}
