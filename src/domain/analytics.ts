import { dayDiff, shiftDate, toCalendarDate } from "./calendar";
import { liveProjects, liveTasks, taskProgress } from "./stats";
import { isTaskOverdue } from "./tasks";
import type {
  CalendarDate,
  Project,
  Task,
  TaskPriority,
  TaskStatus,
} from "./types";
import { TASK_PRIORITIES, TASK_STATUSES } from "./types";

export const DATE_RANGES = ["7d", "30d", "90d"] as const;
export type DateRange = (typeof DATE_RANGES)[number];

export const DATE_RANGE_META: Record<DateRange, { label: string; days: number; bucketDays: number }> = {
  "7d": { label: "Last 7 days", days: 7, bucketDays: 1 },
  "30d": { label: "Last 30 days", days: 30, bucketDays: 1 },
  "90d": { label: "Last 90 days", days: 90, bucketDays: 7 },
};

export interface TrendPoint {
  start: CalendarDate;
  created: number;
  completed: number;
}

export interface ProductivitySummary {
  created: number;
  completed: number;
  averageCycleDays: number | null;
  onTimeRate: number | null;
  overdue: number;
}

function rangeStart(range: DateRange, today: CalendarDate): CalendarDate {
  return shiftDate(today, -(DATE_RANGE_META[range].days - 1));
}

function inRange(date: CalendarDate, start: CalendarDate, end: CalendarDate): boolean {
  return date >= start && date <= end;
}

export function completionTrend(tasks: readonly Task[], range: DateRange, today: CalendarDate): TrendPoint[] {
  const { days, bucketDays } = DATE_RANGE_META[range];
  const start = rangeStart(range, today);
  const bucketCount = Math.ceil(days / bucketDays);
  const points: TrendPoint[] = Array.from({ length: bucketCount }, (_, index) => ({
    start: shiftDate(start, index * bucketDays),
    created: 0,
    completed: 0,
  }));

  const indexFor = (date: CalendarDate) => Math.floor(dayDiff(start, date) / bucketDays);

  for (const task of tasks) {
    const createdOn = toCalendarDate(task.createdAt);
    if (inRange(createdOn, start, today)) points[indexFor(createdOn)].created += 1;

    if (task.completedAt !== null) {
      const completedOn = toCalendarDate(task.completedAt);
      if (inRange(completedOn, start, today)) points[indexFor(completedOn)].completed += 1;
    }
  }

  return points;
}

export function productivitySummary(
  tasks: readonly Task[],
  projects: readonly Project[],
  range: DateRange,
  today: CalendarDate,
): ProductivitySummary {
  const scoped = liveTasks(tasks, projects);
  const start = rangeStart(range, today);

  const created = scoped.filter((task) => inRange(toCalendarDate(task.createdAt), start, today));
  const completed = scoped.filter(
    (task) => task.completedAt !== null && inRange(toCalendarDate(task.completedAt), start, today),
  );

  const cycleDays = completed.map(
    (task) => (Date.parse(task.completedAt ?? task.updatedAt) - Date.parse(task.createdAt)) / (24 * 60 * 60 * 1000),
  );
  const withDue = completed.filter((task) => task.dueDate !== null);
  const onTime = withDue.filter((task) => task.completedAt !== null && toCalendarDate(task.completedAt) <= (task.dueDate ?? ""));

  return {
    created: created.length,
    completed: completed.length,
    averageCycleDays:
      cycleDays.length === 0 ? null : Math.round((cycleDays.reduce((sum, days) => sum + days, 0) / cycleDays.length) * 10) / 10,
    onTimeRate: withDue.length === 0 ? null : Math.round((onTime.length / withDue.length) * 100),
    overdue: scoped.filter((task) => isTaskOverdue(task, today)).length,
  };
}

export interface PriorityCount {
  priority: TaskPriority;
  count: number;
}

export function priorityDistribution(tasks: readonly Task[], projects: readonly Project[]): PriorityCount[] {
  const scoped = liveTasks(tasks, projects);
  return TASK_PRIORITIES.map((priority) => ({
    priority,
    count: scoped.filter((task) => task.priority === priority).length,
  }));
}

export interface StatusCount {
  status: TaskStatus;
  count: number;
}

export function statusDistribution(tasks: readonly Task[], projects: readonly Project[]): StatusCount[] {
  const scoped = liveTasks(tasks, projects);
  return TASK_STATUSES.map((status) => ({
    status,
    count: scoped.filter((task) => task.status === status).length,
  }));
}

export interface ProjectProgressPoint {
  projectId: string;
  name: string;
  tone: Project["tone"];
  done: number;
  total: number;
  percent: number;
}

export function projectProgressSeries(tasks: readonly Task[], projects: readonly Project[]): ProjectProgressPoint[] {
  return liveProjects(projects).map((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    const progress = taskProgress(projectTasks);
    return {
      projectId: project.id,
      name: project.name,
      tone: project.tone,
      done: progress.done,
      total: progress.total,
      percent: progress.percent,
    };
  });
}
