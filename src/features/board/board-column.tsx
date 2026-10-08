"use client";

import { useDroppable } from "@dnd-kit/core";
import { StatusIcon } from "@/components/common/status-icon";
import { cn } from "@/lib/utils";
import { STATUS_META } from "@/domain/meta";
import type { Member, Project, Task, TaskStatus } from "@/domain/types";
import { DraggableTaskCard } from "./task-card";
import { QuickAddTask } from "./quick-add-task";

interface BoardColumnProps {
  status: TaskStatus;
  tasks: readonly Task[];
  projectsById: ReadonlyMap<string, Project>;
  membersById: ReadonlyMap<string, Member>;
  quickAddProjectId: string | undefined;
  onOpenTask: (taskId: string) => void;
}

export function BoardColumn({
  status,
  tasks,
  projectsById,
  membersById,
  quickAddProjectId,
  onOpenTask,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const label = STATUS_META[status].label;

  return (
    <section
      aria-label={`${label} column, ${tasks.length} tasks`}
      className="flex min-w-64 flex-1 flex-col gap-3 rounded-xl bg-muted/40 p-2"
    >
      <header className="flex items-center justify-between gap-2 px-1.5 pt-1">
        <div className="flex items-center gap-2">
          <StatusIcon status={status} />
          <h2 className="text-sm font-medium">{label}</h2>
          <span className="rounded-md bg-background px-1.5 text-xs text-muted-foreground tabular-nums">
            {tasks.length}
          </span>
        </div>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 rounded-lg p-1 transition-colors",
          isOver && "bg-background ring-2 ring-ring/40 ring-inset",
        )}
      >
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            project={projectsById.get(task.projectId)}
            assignee={task.assigneeId === null ? null : (membersById.get(task.assigneeId) ?? null)}
            onOpen={onOpenTask}
          />
        ))}
        {tasks.length === 0 && !isOver ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">Drop tasks here</p>
        ) : null}
      </div>

      <QuickAddTask status={status} projectId={quickAddProjectId} />
    </section>
  );
}
