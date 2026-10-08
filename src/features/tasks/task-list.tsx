"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { memo, type KeyboardEvent, type MouseEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WORKSPACE_TODAY } from "@/data/clock";
import { toCalendarDate } from "@/domain/calendar";
import { LABEL_META } from "@/domain/meta";
import { isTaskOverdue, taskCode, TASK_SORT_LABELS, type TaskSort, type TaskSortField } from "@/domain/tasks";
import type { Density, Member, Project, Task, TaskPriority, TaskStatus } from "@/domain/types";
import { formatCalendarDate, formatDueLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { workspaceActions } from "@/store/workspace-store";
import { AssigneeSelect, PrioritySelect, StatusSelect } from "./task-fields";

interface TaskListProps {
  tasks: readonly Task[];
  projectsById: ReadonlyMap<string, Project>;
  members: readonly Member[];
  selectedIds: ReadonlySet<string>;
  onToggleSelected: (taskId: string) => void;
  onToggleAll: (checked: boolean) => void;
  onOpenTask: (taskId: string) => void;
  sort: TaskSort;
  onSortChange: (sort: TaskSort) => void;
  density: Density;
}

export function TaskList({
  tasks,
  projectsById,
  members,
  selectedIds,
  onToggleSelected,
  onToggleAll,
  onOpenTask,
  sort,
  onSortChange,
  density,
}: TaskListProps) {
  const selectedCount = tasks.filter((task) => selectedIds.has(task.id)).length;
  const allSelected = tasks.length > 0 && selectedCount === tasks.length;
  const headerChecked = allSelected ? true : selectedCount > 0 ? "indeterminate" : false;

  const toggleSort = (field: TaskSortField) => {
    onSortChange(
      sort.field === field
        ? { field, direction: sort.direction === "asc" ? "desc" : "asc" }
        : { field, direction: field === "updatedAt" ? "desc" : "asc" },
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10 pl-3">
              <Checkbox
                checked={headerChecked}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                aria-label="Select all visible tasks"
              />
            </TableHead>
            <TableHead className="w-24">Task</TableHead>
            <SortableHead field="title" sort={sort} onSort={toggleSort}>
              Title
            </SortableHead>
            <SortableHead field="status" sort={sort} onSort={toggleSort} className="w-40">
              Status
            </SortableHead>
            <SortableHead field="priority" sort={sort} onSort={toggleSort} className="hidden w-36 sm:table-cell">
              Priority
            </SortableHead>
            <TableHead className="hidden w-44 md:table-cell">Assignee</TableHead>
            <SortableHead field="dueDate" sort={sort} onSort={toggleSort} className="hidden w-32 lg:table-cell">
              Due
            </SortableHead>
            <SortableHead field="updatedAt" sort={sort} onSort={toggleSort} className="hidden w-32 xl:table-cell">
              Updated
            </SortableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              code={taskCode(task, projectsById.get(task.projectId))}
              members={members}
              selected={selectedIds.has(task.id)}
              density={density}
              onToggleSelected={onToggleSelected}
              onOpenTask={onOpenTask}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SortableHead({
  field,
  sort,
  onSort,
  className,
  children,
}: {
  field: TaskSortField;
  sort: TaskSort;
  onSort: (field: TaskSortField) => void;
  className?: string;
  children: string;
}) {
  const active = sort.field === field;
  const Icon = !active ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;
  const ariaSort = active ? (sort.direction === "asc" ? "ascending" : "descending") : "none";

  return (
    <TableHead className={className} aria-sort={ariaSort}>
      <Button
        variant="ghost"
        size="xs"
        className="-ml-1.5 h-6 px-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        onClick={() => onSort(field)}
        aria-label={`Sort by ${TASK_SORT_LABELS[field]}`}
      >
        {children}
        <Icon className={cn("size-3", !active && "opacity-40")} aria-hidden />
      </Button>
    </TableHead>
  );
}

interface TaskRowProps {
  task: Task;
  code: string;
  members: readonly Member[];
  selected: boolean;
  density: Density;
  onToggleSelected: (taskId: string) => void;
  onOpenTask: (taskId: string) => void;
}

/** Memoized so toggling one row's selection does not re-render the whole table. */
const TaskRow = memo(function TaskRow({
  task,
  code,
  members,
  selected,
  density,
  onToggleSelected,
  onOpenTask,
}: TaskRowProps) {
  const overdue = isTaskOverdue(task, WORKSPACE_TODAY);
  const stopRowClick = (event: MouseEvent) => event.stopPropagation();

  // Radix portals bubble React events through the row, so controls must stop clicks themselves.
  const onRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const sibling = event.key === "ArrowDown" ? event.currentTarget.nextElementSibling : event.currentTarget.previousElementSibling;
      if (sibling instanceof HTMLElement) sibling.focus();
    } else if (event.key === "Enter") {
      onOpenTask(task.id);
    } else if (event.key === " ") {
      event.preventDefault();
      onToggleSelected(task.id);
    }
  };

  const updateStatus = (status: TaskStatus) => workspaceActions.updateTasks([task.id], { status });
  const updatePriority = (priority: TaskPriority) => workspaceActions.updateTasks([task.id], { priority });
  const updateAssignee = (assigneeId: string | null) => workspaceActions.updateTasks([task.id], { assigneeId });

  return (
    <TableRow
      tabIndex={0}
      data-task-id={task.id}
      data-state={selected ? "selected" : undefined}
      aria-selected={selected}
      onKeyDown={onRowKeyDown}
      onClick={() => onOpenTask(task.id)}
      className={cn(
        "cursor-pointer transition-colors duration-200 outline-none focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50 data-[state=selected]:bg-brand-soft hover:bg-foreground/[0.03]",
        density === "compact" ? "h-9" : "h-12",
      )}
    >
      <TableCell className="pl-3" onClick={stopRowClick}>
        <Checkbox checked={selected} onCheckedChange={() => onToggleSelected(task.id)} aria-label={`Select ${task.title}`} />
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">{code}</TableCell>
      <TableCell className="max-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium">{task.title}</span>
          <span className="hidden shrink-0 items-center gap-1 sm:flex">
            {task.labels.slice(0, 2).map((label) => (
              <Badge key={label} variant="secondary" className="h-5 px-1.5 text-[0.65rem] font-normal">
                {LABEL_META[label].label}
              </Badge>
            ))}
            {task.labels.length > 2 ? (
              <span className="text-xs text-muted-foreground">+{task.labels.length - 2}</span>
            ) : null}
          </span>
        </div>
      </TableCell>
      <TableCell onClick={stopRowClick}>
        <StatusSelect id={`status-${task.id}`} value={task.status} onChange={updateStatus} variant="inline" />
      </TableCell>
      <TableCell className="hidden sm:table-cell" onClick={stopRowClick}>
        <PrioritySelect id={`priority-${task.id}`} value={task.priority} onChange={updatePriority} variant="inline" />
      </TableCell>
      <TableCell className="hidden md:table-cell" onClick={stopRowClick}>
        <AssigneeSelect
          id={`assignee-${task.id}`}
          value={task.assigneeId}
          members={members}
          onChange={updateAssignee}
          variant="inline"
        />
      </TableCell>
      <TableCell className={cn("hidden whitespace-nowrap lg:table-cell", overdue && "font-medium text-destructive")}>
        {task.dueDate ? formatDueLabel(task.dueDate, WORKSPACE_TODAY) : <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell className="hidden whitespace-nowrap text-muted-foreground xl:table-cell">
        {formatCalendarDate(toCalendarDate(task.updatedAt))}
      </TableCell>
    </TableRow>
  );
});
