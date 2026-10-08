import { dayDiff, shiftDate, toCalendarDate } from "./calendar";
import type { CalendarDate, Member, Project, Task } from "./types";
import { isTaskOverdue, isTaskOpen } from "./tasks";

export interface TaskProgress {
  total: number;
  done: number;
  percent: number;
}

export function taskProgress(tasks: readonly Task[]): TaskProgress {
  const total = tasks.length;
  const done = tasks.filter((task) => task.status === "done").length;
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

/** Projects that are not archived. Every aggregate in the app is scoped to these. */
export function liveProjects(projects: readonly Project[]): Project[] {
  return projects.filter((project) => project.archivedAt === null);
}

export function liveTasks(tasks: readonly Task[], projects: readonly Project[]): Task[] {
  const liveIds = new Set(liveProjects(projects).map((project) => project.id));
  return tasks.filter((task) => liveIds.has(task.projectId));
}

export function tasksForProject(tasks: readonly Task[], projectId: string): Task[] {
  return tasks.filter((task) => task.projectId === projectId);
}

export interface DashboardStats {
  activeProjects: number;
  openTasks: number;
  completedThisWeek: number;
  overdue: number;
  dueThisWeek: number;
  assignedToMe: number;
  completionRate: number;
}

export function dashboardStats(
  tasks: readonly Task[],
  projects: readonly Project[],
  currentMemberId: Member["id"],
  today: CalendarDate,
): DashboardStats {
  const scoped = liveTasks(tasks, projects);
  const weekStart = shiftDate(today, -6);
  const weekEnd = shiftDate(today, 7);
  const progress = taskProgress(scoped);

  return {
    activeProjects: liveProjects(projects).filter((project) => project.status !== "completed").length,
    openTasks: scoped.filter(isTaskOpen).length,
    completedThisWeek: scoped.filter((task) => {
      if (task.completedAt === null) return false;
      const day = toCalendarDate(task.completedAt);
      return day >= weekStart && day <= today;
    }).length,
    overdue: scoped.filter((task) => isTaskOverdue(task, today)).length,
    dueThisWeek: scoped.filter(
      (task) => isTaskOpen(task) && task.dueDate !== null && task.dueDate >= today && task.dueDate < weekEnd,
    ).length,
    assignedToMe: scoped.filter((task) => isTaskOpen(task) && task.assigneeId === currentMemberId).length,
    completionRate: progress.percent,
  };
}

export function upcomingDeadlines(
  tasks: readonly Task[],
  projects: readonly Project[],
  today: CalendarDate,
  limit: number,
): Task[] {
  return liveTasks(tasks, projects)
    .filter((task) => isTaskOpen(task) && task.dueDate !== null && task.dueDate >= today)
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? "") || a.id.localeCompare(b.id))
    .slice(0, limit);
}

export function daysUntil(date: CalendarDate, today: CalendarDate): number {
  return dayDiff(today, date);
}
