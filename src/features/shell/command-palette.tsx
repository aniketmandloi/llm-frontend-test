"use client";

import { Moon, PanelLeft, Plus, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useMemo, useState, type ReactNode } from "react";
import { StatusIcon } from "@/components/common/status-icon";
import { TONE_CLASSES } from "@/components/common/tone";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { liveProjects } from "@/domain/stats";
import { taskCode } from "@/domain/tasks";
import { useTaskSheet } from "@/features/tasks/task-sheet-context";
import { workspaceActions, useWorkspaceState } from "@/store/workspace-store";
import { NAV_ITEMS } from "./nav";

const MAX_PROJECT_RESULTS = 6;
const MAX_TASK_RESULTS = 8;

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { projects, tasks } = useWorkspaceState();
  const { openCreate, openTask } = useTaskSheet();
  const [query, setQuery] = useState("");

  const needle = query.trim().toLowerCase();
  const matches = (...fields: string[]) =>
    needle.length === 0 || fields.some((field) => field.toLowerCase().includes(needle));

  const projectsById = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);

  const navResults = NAV_ITEMS.filter((item) => matches(item.label));
  const actionResults = [
    { id: "create-task", label: "Create task", icon: Plus, shortcut: "c", keywords: "new add task", run: () => openCreate() },
    {
      id: "toggle-sidebar",
      label: "Toggle sidebar",
      icon: PanelLeft,
      shortcut: "[",
      keywords: "collapse expand sidebar navigation",
      run: () => workspaceActions.toggleSidebar(),
    },
    {
      id: "toggle-theme",
      label: resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme",
      icon: resolvedTheme === "dark" ? Sun : Moon,
      shortcut: undefined,
      keywords: "theme dark light appearance",
      run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
    },
  ].filter((action) => matches(action.label, action.keywords));
  const projectResults = liveProjects(projects)
    .filter((project) => matches(project.name, project.key))
    .slice(0, MAX_PROJECT_RESULTS);
  const taskResults =
    needle.length === 0
      ? []
      : tasks
          .filter((task) => matches(task.title, taskCode(task, projectsById.get(task.projectId))))
          .slice(0, MAX_TASK_RESULTS);

  const hasResults =
    navResults.length + actionResults.length + projectResults.length + taskResults.length > 0;

  const close = () => {
    setQuery("");
    onOpenChange(false);
  };

  const runAndClose = (action: () => void) => {
    close();
    action();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="top-[18%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl" showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>Command palette</DialogTitle>
          <DialogDescription>Search pages, actions, projects and tasks.</DialogDescription>
        </DialogHeader>
        <Command shouldFilter={false} className="rounded-none bg-popover">
          <CommandInput placeholder="Search pages, projects and tasks" value={query} onValueChange={setQuery} />
          <CommandList className="max-h-[min(420px,60svh)] p-1">
            {navResults.length > 0 ? (
              <CommandGroup heading="Go to">
                {navResults.map((item) => (
                  <PaletteItem
                    key={item.href}
                    value={`nav-${item.href}`}
                    onSelect={() => runAndClose(() => router.push(item.href))}
                    shortcut={`g ${item.shortcut}`}
                  >
                    <item.icon className="size-4 text-muted-foreground" aria-hidden />
                    {item.label}
                  </PaletteItem>
                ))}
              </CommandGroup>
            ) : null}

            {actionResults.length > 0 ? (
              <CommandGroup heading="Actions">
                {actionResults.map((action) => (
                  <PaletteItem
                    key={action.id}
                    value={`action-${action.id}`}
                    onSelect={() => runAndClose(action.run)}
                    shortcut={action.shortcut}
                  >
                    <action.icon className="size-4 text-muted-foreground" aria-hidden />
                    {action.label}
                  </PaletteItem>
                ))}
              </CommandGroup>
            ) : null}

            {projectResults.length > 0 ? (
              <CommandGroup heading="Projects">
                {projectResults.map((project) => (
                  <PaletteItem
                    key={project.id}
                    value={`project-${project.id}`}
                    onSelect={() => runAndClose(() => router.push(`/projects/${project.id}`))}
                    shortcut={project.key}
                  >
                    <span aria-hidden className={`size-2 rounded-full ${TONE_CLASSES[project.tone].dot}`} />
                    {project.name}
                  </PaletteItem>
                ))}
              </CommandGroup>
            ) : null}

            {taskResults.length > 0 ? (
              <CommandGroup heading="Tasks">
                {taskResults.map((task) => (
                  <PaletteItem
                    key={task.id}
                    value={`task-${task.id}`}
                    onSelect={() => runAndClose(() => openTask(task.id))}
                    shortcut={taskCode(task, projectsById.get(task.projectId))}
                  >
                    <StatusIcon status={task.status} />
                    <span className="truncate">{task.title}</span>
                  </PaletteItem>
                ))}
              </CommandGroup>
            ) : null}

            {hasResults ? null : (
              <p className="py-10 text-center text-sm text-muted-foreground">No matches for “{query.trim()}”.</p>
            )}
          </CommandList>
          <div className="flex items-center gap-3 border-t px-3 py-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd> select
            </span>
            <span className="flex items-center gap-1">
              <Kbd>esc</Kbd> close
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function PaletteItem({
  value,
  onSelect,
  shortcut,
  children,
}: {
  value: string;
  onSelect: () => void;
  shortcut?: string;
  children: ReactNode;
}) {
  return (
    <CommandItem value={value} onSelect={onSelect} className="gap-2.5">
      {children}
      {shortcut ? <CommandShortcut>{shortcut}</CommandShortcut> : null}
    </CommandItem>
  );
}
