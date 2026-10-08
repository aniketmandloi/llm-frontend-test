"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { EllipsisVertical, ExternalLink } from "lucide-react";
import { MemberAvatar } from "@/components/common/member-avatar";
import { PriorityIcon } from "@/components/common/priority-icon";
import { StatusIcon } from "@/components/common/status-icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WORKSPACE_TODAY } from "@/data/clock";
import { STATUS_META, LABEL_META } from "@/domain/meta";
import { isTaskOverdue, taskCode } from "@/domain/tasks";
import { TASK_STATUSES, type Member, type Project, type Task, type TaskStatus } from "@/domain/types";
import { formatDueLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { workspaceActions } from "@/store/workspace-store";

interface TaskCardBodyProps {
  task: Task;
  code: string;
  assignee: Member | null;
  overlay?: boolean;
}

/** Presentation only, so the drag overlay can render the same card without drag wiring. */
export function TaskCardBody({ task, code, assignee, overlay = false }: TaskCardBodyProps) {
  const overdue = isTaskOverdue(task, WORKSPACE_TODAY);

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-lg border bg-card p-3 text-left shadow-xs",
        overlay && "rotate-1 shadow-lg ring-1 ring-foreground/10",
      )}
    >
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="font-mono">{code}</span>
        <PriorityIcon priority={task.priority} />
      </div>
      <p className="line-clamp-2 text-sm leading-snug font-medium">{task.title}</p>
      {task.labels.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {task.labels.slice(0, 3).map((label) => (
            <span key={label} className="rounded bg-muted px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
              {LABEL_META[label].label}
            </span>
          ))}
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className={cn("tabular-nums", overdue && "font-medium text-destructive")}>
          {task.dueDate ? formatDueLabel(task.dueDate, WORKSPACE_TODAY) : "No due date"}
        </span>
        <MemberAvatar member={assignee} size="xs" />
      </div>
    </div>
  );
}

interface DraggableTaskCardProps {
  task: Task;
  project: Project | undefined;
  assignee: Member | null;
  onOpen: (taskId: string) => void;
}

export function DraggableTaskCard({ task, project, assignee, onOpen }: DraggableTaskCardProps) {
  const code = taskCode(task, project);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { status: task.status },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn("group relative touch-none", isDragging && "opacity-40")}
    >
      <div
        {...attributes}
        {...listeners}
        onClick={() => onOpen(task.id)}
        aria-label={`${code} ${task.title}, ${STATUS_META[task.status].label}`}
        className="cursor-grab rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/60 active:cursor-grabbing"
      >
        <TaskCardBody task={task} code={code} assignee={assignee} />
      </div>
      <CardMenu task={task} onOpen={onOpen} />
    </div>
  );
}

/** Keyboard and pointer alternative to dragging: move a task by status without a drag gesture. */
function CardMenu({ task, onOpen }: { task: Task; onOpen: (taskId: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`More actions for ${task.title}`}
          className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
        >
          <EllipsisVertical aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={() => onOpen(task.id)}>
          <ExternalLink aria-hidden />
          Open task
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {TASK_STATUSES.filter((status) => status !== task.status).map((status: TaskStatus) => (
          <DropdownMenuItem key={status} onSelect={() => workspaceActions.updateTasks([task.id], { status })}>
            <StatusIcon status={status} />
            Move to {STATUS_META[status].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
