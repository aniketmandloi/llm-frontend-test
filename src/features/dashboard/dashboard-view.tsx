"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { StatTile } from "@/components/common/stat-tile";
import { CompletionTrendChart } from "@/components/charts/completion-trend-chart";
import { TONE_CLASSES } from "@/components/common/tone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WORKSPACE_TODAY } from "@/data/clock";
import { completionTrend } from "@/domain/analytics";
import { ActivityFeed } from "@/features/activity/activity-feed";
import { useTaskSheet } from "@/features/tasks/task-sheet-context";
import { dashboardStats, liveProjects, liveTasks, taskProgress, upcomingDeadlines, daysUntil } from "@/domain/stats";
import { isTaskOverdue, sortTasks } from "@/domain/tasks";
import { formatCalendarDate, formatFullDate } from "@/lib/format";
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
  const deadlines = useMemo(
    () => upcomingDeadlines(tasks, projects, WORKSPACE_TODAY, PANEL_LIMIT),
    [tasks, projects],
  );
  const activeProjects = useMemo(
    () => liveProjects(projects).filter((project) => project.status !== "completed"),
    [projects],
  );
  const recentActivity = useMemo(() => activity.slice(0, 8), [activity]);
  const firstName = me?.name.split(" ")[0] ?? "there";

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <PageHeader title={`Welcome back, ${firstName}`} description={`Snapshot for ${formatFullDate(WORKSPACE_TODAY)}`} />

      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Active projects" value={stats.activeProjects} />
        <StatTile label="Open tasks" value={stats.openTasks} />
        <StatTile label="Completed this week" value={stats.completedThisWeek} />
        <StatTile label="Overdue" value={stats.overdue} emphasis={stats.overdue > 0} hint="Past due, not done" />
        <StatTile label="Due this week" value={stats.dueThisWeek} />
        <StatTile label="Completion rate" value={`${stats.completionRate}%`}>
          <Progress value={stats.completionRate} className="h-1.5" aria-label="Completion rate" />
        </StatTile>
      </section>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Task completion</CardTitle>
              <CardDescription>Tasks created and completed over the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <CompletionTrendChart data={trend} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project progress</CardTitle>
              <CardDescription>Active projects, ordered by how much work is left.</CardDescription>
            </CardHeader>
            <CardContent>
              {activeProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active projects right now.</p>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2">
                  {activeProjects
                    .map((project) => ({
                      project,
                      progress: taskProgress(scoped.filter((task) => task.projectId === project.id)),
                    }))
                    .sort((a, b) => a.progress.percent - b.progress.percent)
                    .map(({ project, progress }) => (
                      <li key={project.id} className="space-y-2 rounded-lg border p-4">
                        <div className="flex items-center justify-between gap-2">
                          <Link href={`/projects/${project.id}`} className="flex min-w-0 items-center gap-2 hover:underline">
                            <span aria-hidden className={cn("size-2 shrink-0 rounded-full", TONE_CLASSES[project.tone].dot)} />
                            <span className="truncate text-sm font-medium">{project.name}</span>
                          </Link>
                          <span className="text-xs font-medium tabular-nums">{progress.percent}%</span>
                        </div>
                        <Progress value={progress.percent} className="h-1.5" aria-label={`${project.name} progress`} />
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {progress.done} of {progress.total} tasks done
                        </p>
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned to you</CardTitle>
              <CardDescription>
                {assigned.length === 0 ? "Nothing assigned right now." : `${stats.assignedToMe} open tasks, soonest first.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assigned.length === 0 ? (
                <EmptyState icon={Check} title="You're all caught up" description="New assignments will show up here." />
              ) : (
                <ul className="-mx-2">
                  {assigned.map((task) => (
                    <TaskMiniRow
                      key={task.id}
                      task={task}
                      project={projectsById.get(task.projectId)}
                      onOpen={openTask}
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          {overdue.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Overdue</CardTitle>
                <CardDescription>{stats.overdue} tasks past their due date.</CardDescription>
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

          <Card>
            <CardHeader>
              <CardTitle>Upcoming deadlines</CardTitle>
              <CardDescription>Open tasks with the nearest due dates.</CardDescription>
            </CardHeader>
            <CardContent>
              {deadlines.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open tasks have a due date.</p>
              ) : (
                <ul className="-mx-2">
                  {deadlines.map((task) => (
                    <li key={task.id} className="flex items-center justify-between gap-3 px-2 py-1.5 text-sm">
                      <button
                        type="button"
                        onClick={() => openTask(task.id)}
                        className="min-w-0 flex-1 truncate text-left font-medium hover:underline"
                      >
                        {task.title}
                      </button>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {deadlineText(task.dueDate, WORKSPACE_TODAY)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
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

function deadlineText(dueDate: string | null, today: string): string {
  if (dueDate === null) return "";
  const days = daysUntil(dueDate, today);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `in ${days} days`;
}
