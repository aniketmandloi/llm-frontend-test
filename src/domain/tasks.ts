import { PRIORITY_META } from "./meta";
import {
  TASK_STATUSES,
  type CalendarDate,
  type Project,
  type Task,
  type TaskLabel,
  type TaskPriority,
  type TaskStatus,
} from "./types";

export const UNASSIGNED = "unassigned";

export interface TaskFilters {
  search: string;
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  /** Member ids, or `UNASSIGNED`. */
  assigneeIds: string[];
  labels: TaskLabel[];
  projectIds: string[];
  overdueOnly: boolean;
}

export const EMPTY_TASK_FILTERS: TaskFilters = {
  search: "",
  statuses: [],
  priorities: [],
  assigneeIds: [],
  labels: [],
  projectIds: [],
  overdueOnly: false,
};

export type TaskSortField = "title" | "priority" | "status" | "dueDate" | "updatedAt";

export interface TaskSort {
  field: TaskSortField;
  direction: "asc" | "desc";
}

export const TASK_SORT_LABELS: Record<TaskSortField, string> = {
  title: "Title",
  priority: "Priority",
  status: "Status",
  dueDate: "Due date",
  updatedAt: "Last updated",
};

export function taskCode(task: Task, project: Project | undefined): string {
  return `${project?.key ?? "TASK"}-${task.number}`;
}

export function isTaskOverdue(task: Task, today: CalendarDate): boolean {
  return task.status !== "done" && task.dueDate !== null && task.dueDate < today;
}

export function isTaskOpen(task: Task): boolean {
  return task.status !== "done";
}

export function filterTasks(
  tasks: readonly Task[],
  filters: TaskFilters,
  projectsById: ReadonlyMap<string, Project>,
  today: CalendarDate,
): Task[] {
  const query = filters.search.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filters.projectIds.length > 0 && !filters.projectIds.includes(task.projectId)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) return false;
    if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) return false;
    if (filters.labels.length > 0 && !filters.labels.some((label) => task.labels.includes(label))) return false;
    if (filters.overdueOnly && !isTaskOverdue(task, today)) return false;

    if (filters.assigneeIds.length > 0) {
      const matchesUnassigned = filters.assigneeIds.includes(UNASSIGNED) && task.assigneeId === null;
      const matchesAssignee = task.assigneeId !== null && filters.assigneeIds.includes(task.assigneeId);
      if (!matchesUnassigned && !matchesAssignee) return false;
    }

    if (query.length > 0) {
      const code = taskCode(task, projectsById.get(task.projectId)).toLowerCase();
      const haystack = `${task.title} ${code}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}

export function countActiveFilters(filters: TaskFilters): number {
  return (
    filters.statuses.length +
    filters.priorities.length +
    filters.assigneeIds.length +
    filters.labels.length +
    filters.projectIds.length +
    (filters.overdueOnly ? 1 : 0)
  );
}

const compareStrings = (a: string, b: string) => a.localeCompare(b);

function compareByField(a: Task, b: Task, field: TaskSortField): number {
  switch (field) {
    case "title":
      return compareStrings(a.title, b.title);
    case "priority":
      return PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank;
    case "status":
      return TASK_STATUSES.indexOf(a.status) - TASK_STATUSES.indexOf(b.status);
    case "dueDate":
      // Tasks without a due date sort after dated tasks in both directions.
      if (a.dueDate === b.dueDate) return 0;
      if (a.dueDate === null) return 1;
      if (b.dueDate === null) return -1;
      return compareStrings(a.dueDate, b.dueDate);
    case "updatedAt":
      return compareStrings(a.updatedAt, b.updatedAt);
  }
}

export function sortTasks(tasks: readonly Task[], sort: TaskSort): Task[] {
  const direction = sort.direction === "asc" ? 1 : -1;
  return [...tasks].sort((a, b) => {
    // Undated tasks stay at the end whichever way the due date is sorted.
    if (sort.field === "dueDate" && (a.dueDate === null || b.dueDate === null)) {
      return compareByField(a, b, sort.field);
    }
    return compareByField(a, b, sort.field) * direction || compareStrings(a.id, b.id);
  });
}

export function groupTasksByStatus(tasks: readonly Task[]): Record<TaskStatus, Task[]> {
  const groups: Record<TaskStatus, Task[]> = {
    backlog: [],
    todo: [],
    in_progress: [],
    in_review: [],
    done: [],
  };
  for (const task of tasks) {
    groups[task.status].push(task);
  }
  return groups;
}

export function nextTaskNumber(tasks: readonly Task[], projectId: string): number {
  return tasks.reduce((max, task) => (task.projectId === projectId ? Math.max(max, task.number) : max), 0) + 1;
}
