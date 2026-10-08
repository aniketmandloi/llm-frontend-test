"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { taskCode } from "@/domain/tasks";
import type { TaskStatus } from "@/domain/types";
import { useWorkspaceState } from "@/store/workspace-store";
import { TaskForm } from "./task-form";

export type SheetTarget =
  | { kind: "create"; projectId?: string; status?: TaskStatus }
  | { kind: "edit"; taskId: string };

interface TaskSheetProps {
  open: boolean;
  target: SheetTarget | null;
  session: number;
  onOpenChange: (open: boolean) => void;
}

export function TaskSheet({ open, target, session, onOpenChange }: TaskSheetProps) {
  const { tasks, projects } = useWorkspaceState();
  const task = target?.kind === "edit" ? tasks.find((item) => item.id === target.taskId) : undefined;
  const project = task ? projects.find((item) => item.id === task.projectId) : undefined;
  const close = () => onOpenChange(false);

  const title = target?.kind === "edit" ? (task ? taskCode(task, project) : "Task") : "New task";
  const description =
    target?.kind === "edit"
      ? "Changes are saved when you press Save."
      : "Add a task to a project.";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b px-6 py-4 pr-12">
          <SheetTitle className="font-mono text-sm font-medium text-muted-foreground">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        {target?.kind === "create" ? (
          <TaskForm
            key={session}
            mode="create"
            defaults={{ projectId: target.projectId, status: target.status }}
            onDone={close}
          />
        ) : null}
        {target?.kind === "edit" && task ? <TaskForm key={session} mode="edit" task={task} onDone={close} /> : null}
        {target?.kind === "edit" && !task ? (
          <p className="px-6 py-10 text-sm text-muted-foreground">This task no longer exists.</p>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
