"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { OrbitRing } from "@/components/common/orbit-ring";
import { StatTile } from "@/components/common/stat-tile";
import { CompletionTrendChart } from "@/components/charts/completion-trend-chart";
import { TONE_CLASSES } from "@/components/common/tone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { WORKSPACE_TODAY } from "@/data/clock";
import { completionTrend } from "@/domain/analytics";
import { ActivityFeed } from "@/features/activity/activity-feed";
import { useTaskSheet } from "@/features/tasks/task-sheet-context";
import {
  dashboardStats,
  liveProjects,
  liveTasks,
  taskProgress,
  upcomingDeadlines,
  daysUntil,
  type DashboardStats,
} from "@/domain/stats";
import { isTaskOverdue, sortTasks } from "@/domain/tasks";
import { formatCalendarDate, formatCount, formatFullDate } from "@/lib/format";
import { cssVars } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useWorkspaceState } from "@/store/workspace-store";
import { TaskMiniRow } from "./task-mini-row";

const PANEL_LIMIT = 6;

export function DashboardView() {
  const { tasks, projects, members, currentMemberId, activity } = useWorkspaceState();
  const { openTask } = useTaskSheet();

  const membersById = useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);
  const projectsById = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);
  const me = membersById.get(currentMemberId);
  const scoped = useMemo(() => liveTasks(tasks, projects), [tasks, projects]);
  const stats = useMemo(
    () => dashboardStats(tasks, projects, currentMemberId, WORKSPACE_TODAY),
    [tasks, projects, currentMemberId],
  );
  const trend = useMemo(
    () =>
      completionTrend(scoped, "30d", WORKSPACE_TODAY).map((point) => ({
        label: formatCalendarDate(point.start),
        created: point.created,
        completed: point.completed,
      })),
    [scoped],
  );
  const assigned = useMemo(
    () =>
      sortTasks(
        scoped.filter((task) => task.assigneeId === currentMemberId && task.status !== "done"),
        { field: "dueDate", direction: "asc" },
      ).slice(0, PANEL_LIMIT),
    [scoped, currentMemberId],
  );
  const overdue = useMemo(
    () =>
      sortTasks(
        scoped.filter((task) => isTaskOverdue(task, WORKSPACE_TODAY)),
        { field: "dueDate", direction: "asc" },
      ).slice(0, PANEL_LIMIT),
    [scoped],
  );
  const deadlines = useMemo(() => upcomingDeadlines(tasks, projects, WORKSPACE_TODAY, PANEL_LIMIT), [tasks, projects]);
  const activeProjects = useMemo(
    () =>
      liveProjects(projects)
        .filter((project) => project.status !== "completed")
        .map((project) => ({
          project,
          progress: taskProgress(scoped.filter((task) => task.projectId === project.id)),
        }))
        .sort((a, b) => a.progress.percent - b.progress.percent),
    [projects, scoped],
  );
  const recentActivity = useMemo(() => activity.slice(0, 8), [activity]);
  const firstName = me?.name.split(" ")[0] ?? "there";

  return (
    <div className="flex min-w-0 flex-col gap-10">
      <section aria-label="Overview" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0 space-y-4">
          <p className="text-sm text-muted-foreground">{formatFullDate(WORKSPACE_TODAY)}</p>
          <h1 className="font-display text-5xl leading-[1.02] tracking-tight text-balance sm:text-6xl">
            Welcome back, <em className="text-brand">{firstName}</em>.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">{summarize(stats)}</p>
        </div>
        <div className="animate-reveal flex items-center gap-5 rounded-2xl border bg-card p-5 shadow-xs">
          <OrbitRing value={stats.completionRate} size={96} strokeWidth={6} showValue />
          <div className="space-y-1 pr-2">
            <p className="text-sm font-medium">Workspace completion</p>
            <p className="max-w-[14rem] text-sm text-muted-foreground">
              {formatCount(stats.completedThisWeek, "task")} finished in the last seven days.
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label="Active projects" value={stats.activeProjects} />
        <StatTile label="Open tasks" value={stats.openTasks} />
        <StatTile label="Completed this week" value={stats.completedThisWeek} />
        <StatTile label="Overdue" value={stats.overdue} emphasis={stats.overdue > 0} hint="Past due, not done" />
        <StatTile label="Due this week" value={stats.dueThisWeek} />
      </section>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="animate-reveal rounded-2xl" style={cssVars({ "--i": 0 })}>
            <CardHeader>
              <CardTitle className="font-display text-2xl font-normal">Task completion</CardTitle>
              <CardDescription>Tasks created and completed over the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <CompletionTrendChart data={trend} />
            </CardContent>
          </Card>

          <Card className="animate-reveal rounded-2xl" style={cssVars({ "--i": 1 })}>
            <CardHeader>
              <CardTitle className="font-display text-2xl font-normal">Project progress</CardTitle>
              <CardDescription>Active projects, with the furthest from done first.</CardDescription>
            </CardHeader>
            <CardContent>
              {activeProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active projects right now.</p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {activeProjects.map(({ project, progress }) => (
                    <li
                      key={project.id}
                      className="flex items-center gap-4 rounded-xl border p-4 transition-[border-color,transform] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-foreground/15"
                    >
                      <OrbitRing value={progress.percent} size={48} strokeWidth={4} showValue />
                      <div className="min-w-0 flex-1 space-y-1">
                        <Link href={`/projects/${project.id}`} className="flex min-w-0 items-center gap-2 hover:underline">
                          <span aria-hidden className={cn("size-2 shrink-0 rounded-full", TONE_CLASSES[project.tone].dot)} />
                          <span className="truncate text-sm font-medium">{project.name}</span>
                        </Link>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {progress.done} of {progress.total} tasks done
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="animate-reveal rounded-2xl" style={cssVars({ "--i": 2 })}>
            <CardHeader>
              <CardTitle className="font-display text-2xl font-normal">Assigned to you</CardTitle>
              <CardDescription>
                {assigned.length === 0 ? "Nothing assigned right now." : `${formatCount(stats.assignedToMe, "open task")}, soonest first.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assigned.length === 0 ? (
                <EmptyState icon={Check} title="You're all caught up" description="New assignments will show up here." />
              ) : (
                <ul className="-mx-2">
                  {assigned.map((task) => (
                    <TaskMiniRow key={task.id} task={task} project={projectsById.get(task.projectId)} onOpen={openTask} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          {overdue.length > 0 ? (
            <Card className="animate-reveal rounded-2xl border-ember/30" style={cssVars({ "--i": 3 })}>
              <CardHeader>
                <CardTitle className="font-display text-2xl font-normal text-ember">Overdue</CardTitle>
                <CardDescription>{formatCount(stats.overdue, "task")} past their due date.</CardDescription>
                <CardAction>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/tasks">View all</Link>
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <ul className="-mx-2">
                  {overdue.map((task) => (
                    <TaskMiniRow
                      key={task.id}
                      task={task}
                      project={projectsById.get(task.projectId)}
                      assignee={task.assigneeId === null ? null : membersById.get(task.assigneeId)}
                      onOpen={openTask}
                      showAssignee
                    />
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          <Card className="animate-reveal rounded-2xl" style={cssVars({ "--i": 4 })}>
            <CardHeader>
              <CardTitle className="font-display text-2xl font-normal">Upcoming deadlines</CardTitle>
              <CardDescription>Open tasks with the nearest due dates.</CardDescription>
            </CardHeader>
            <CardContent>
              {deadlines.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open tasks have a due date.</p>
              ) : (
                <ul className="-mx-2">
                  {deadlines.map((task) => (
                    <li key={task.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-foreground/5">
                      <button
                        type="button"
                        onClick={() => openTask(task.id)}
                        className="min-w-0 flex-1 truncate text-left font-medium focus-visible:outline-none focus-visible:underline"
                      >
                        {task.title}
                      </button>
                      <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
                        {deadlineText(task.dueDate, WORKSPACE_TODAY)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="animate-reveal rounded-2xl" style={cssVars({ "--i": 5 })}>
            <CardHeader>
              <CardTitle className="font-display text-2xl font-normal">Recent activity</CardTitle>
              <CardAction>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/activity">All activity</Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <ActivityFeed events={recentActivity} membersById={membersById} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

/** One sentence the hero can say from the same numbers the tiles show. */
function summarize(stats: DashboardStats): string {
  const due = `${formatCount(stats.dueThisWeek, "task")} due this week`;
  if (stats.overdue === 0) return `Nothing is overdue. ${due}.`;
  return `${formatCount(stats.overdue, "task")} overdue and ${due}.`;
}

function deadlineText(dueDate: string | null, today: string): string {
  if (dueDate === null) return "";
  const days = daysUntil(dueDate, today);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `in ${days} days`;
}
