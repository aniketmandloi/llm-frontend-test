"use client";

import { Check, ChevronsUpDown, Layers } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { workspaceActions, useWorkspaceState } from "@/store/workspace-store";
import { cn } from "@/lib/utils";

export function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  const { workspaces, preferences } = useWorkspaceState();
  const active = workspaces.find((workspace) => workspace.id === preferences.activeWorkspaceId) ?? workspaces[0];

  const selectWorkspace = (workspaceId: string, name: string) => {
    if (workspaceId === preferences.activeWorkspaceId) return;
    workspaceActions.updatePreferences({ activeWorkspaceId: workspaceId });
    toast.success(`Switched to ${name}`, {
      description: "Demo workspaces share one dataset, so the content stays the same.",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("h-10 w-full justify-start gap-2.5 px-2", collapsed && "size-10 justify-center px-0")}
          aria-label={`Workspace: ${active?.name ?? "None"}`}
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
            <Layers className="size-3.5" aria-hidden />
          </span>
          {collapsed ? null : (
            <>
              <span className="min-w-0 flex-1 truncate text-left text-sm font-medium">{active?.name}</span>
              <ChevronsUpDown className="size-3.5 text-muted-foreground" aria-hidden />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          {workspaces.map((workspace) => (
            <DropdownMenuItem key={workspace.id} onClick={() => selectWorkspace(workspace.id, workspace.name)}>
              <span className="flex-1 truncate">{workspace.name}</span>
              <span className="text-xs text-muted-foreground">{workspace.plan}</span>
              {workspace.id === preferences.activeWorkspaceId ? <Check className="size-4" aria-hidden /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">Rename workspace in settings</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
