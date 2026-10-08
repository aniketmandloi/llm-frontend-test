"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { OrbitRing } from "@/components/common/orbit-ring";
import { TONE_CLASSES } from "@/components/common/tone";
import { liveProjects, projectMetrics } from "@/domain/stats";
import { WORKSPACE_TODAY } from "@/data/clock";
import { useWorkspaceState } from "@/store/workspace-store";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActivePath } from "./nav";
import { WorkspaceSwitcher } from "./workspace-switcher";

interface SidebarContentProps {
  collapsed: boolean;
  onNavigate?: () => void;
  onToggleCollapsed?: () => void;
}

const ITEM_BASE =
  "group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-[background-color,color,box-shadow] duration-200 ease-out-expo hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none";
const ITEM_ACTIVE = "bg-card font-medium text-foreground shadow-sm ring-1 ring-border hover:bg-card";

export function SidebarContent({ collapsed, onNavigate, onToggleCollapsed }: SidebarContentProps) {
  const pathname = usePathname();
  const { projects, tasks } = useWorkspaceState();
  const activeProjects = liveProjects(projects).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex h-full flex-col gap-5 p-3">
      <WorkspaceSwitcher collapsed={collapsed} />

      <nav aria-label="Main" className="flex flex-col gap-0.5">
        {collapsed ? null : <SectionLabel>Workspace</SectionLabel>}
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);
          const link = (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              aria-label={collapsed ? item.label : undefined}
              className={cn(ITEM_BASE, active && ITEM_ACTIVE, collapsed && "justify-center px-0")}
            >
              <item.icon
                className={cn("size-4 shrink-0 transition-colors duration-200", active ? "text-brand" : "text-muted-foreground group-hover:text-foreground")}
                aria-hidden
              />
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
        <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
          <div className="flex items-center justify-between pr-2">
            <SectionLabel>Projects</SectionLabel>
            <span className="pb-1 text-[11px] text-muted-foreground tabular-nums">{activeProjects.length}</span>
          </div>
          <ul className="flex flex-col gap-0.5 overflow-y-auto pb-2">
            {activeProjects.map((project) => {
              const active = pathname === `/projects/${project.id}`;
              const metrics = projectMetrics(
                tasks.filter((task) => task.projectId === project.id),
                WORKSPACE_TODAY,
              );
              return (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.id}`}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(ITEM_BASE, active && ITEM_ACTIVE)}
                  >
                    <span className="flex size-4 shrink-0 items-center justify-center">
                      <span aria-hidden className={cn("size-2 rounded-full", TONE_CLASSES[project.tone].dot)} />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{project.name}</span>
                    <OrbitRing value={metrics.percent} size={16} strokeWidth={2.5} className="opacity-80" />
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

function SectionLabel({ children }: { children: string }) {
  return <span className="px-2.5 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground/80 uppercase">{children}</span>;
}
