"use client";

import { MemberAvatar } from "@/components/common/member-avatar";
import { StatusIcon } from "@/components/common/status-icon";
import { WORKSPACE_TODAY } from "@/data/clock";
import { isTaskOverdue, taskCode } from "@/domain/tasks";
import type { Member, Project, Task } from "@/domain/types";
import { formatDueLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Compact task row used by dashboard panels. Clicking opens the shared task sheet. */
export function TaskMiniRow({
  task,
  project,
  assignee,
  onOpen,
  showAssignee = false,
}: {
  task: Task;
  project: Project | undefined;
  assignee?: Member | null;
  onOpen: (taskId: string) => void;
  showAssignee?: boolean;
}) {
  const overdue = isTaskOverdue(task, WORKSPACE_TODAY);

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(task.id)}
        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
      >
        <StatusIcon status={task.status} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{task.title}</span>
          <span className="block font-mono text-xs text-muted-foreground">{taskCode(task, project)}</span>
        </span>
        {showAssignee ? <MemberAvatar member={assignee ?? null} size="xs" /> : null}
        <span
          className={cn(
            "shrink-0 text-xs whitespace-nowrap text-muted-foreground tabular-nums",
            overdue && "font-medium text-destructive",
          )}
        >
          {task.dueDate ? formatDueLabel(task.dueDate, WORKSPACE_TODAY) : "No date"}
        </span>
      </button>
    </li>
  );
}
