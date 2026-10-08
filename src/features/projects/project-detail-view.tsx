"use client";

import { Archive, ArchiveRestore, FolderX, Pencil } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ProjectStatusBadge } from "@/components/common/project-status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { OrbitRing } from "@/components/common/orbit-ring";
import { PageHeader } from "@/components/common/page-header";
import { StatTile } from "@/components/common/stat-tile";
import { TONE_CLASSES } from "@/components/common/tone";
import { ActivityFeed } from "@/features/activity/activity-feed";
import { TaskWorkbench } from "@/features/tasks/task-workbench";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WORKSPACE_TODAY } from "@/data/clock";
import { projectMetrics } from "@/domain/stats";
import { formatCalendarDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useWorkspaceState } from "@/store/workspace-store";
import { setProjectArchived } from "./project-actions";
import { ProjectFormDialog } from "./project-form-dialog";

const RECENT_ACTIVITY_LIMIT = 12;

export function ProjectDetailView({ projectId }: { projectId: string }) {
  const { projects, tasks, members, activity } = useWorkspaceState();
  const [editing, setEditing] = useState(false);

  const project = projects.find((item) => item.id === projectId);
  const membersById = useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);

  if (!project) {
    return (
      <EmptyState
        icon={FolderX}
        title="Project not found"
        description="It may have been removed when demo data was reset."
        action={
          <Button asChild size="sm" variant="outline">
            <Link href="/projects">Back to projects</Link>
          </Button>
        }
      />
    );
  }

  const projectTasks = tasks.filter((task) => task.projectId === project.id);
  const metrics = projectMetrics(projectTasks, WORKSPACE_TODAY);
  const archived = project.archivedAt !== null;
  const owner = membersById.get(project.ownerId);
  const recentActivity = activity.filter((event) => event.projectId === project.id).slice(0, RECENT_ACTIVITY_LIMIT);

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <PageHeader
        title={project.name}
        description={project.description}
        leading={<OrbitRing value={metrics.percent} size={88} strokeWidth={6} showValue />}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil aria-hidden />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProjectArchived(project, !archived)}
            >
              {archived ? <ArchiveRestore aria-hidden /> : <Archive aria-hidden />}
              {archived ? "Restore" : "Archive"}
            </Button>
          </>
        }
      />

      <div className="-mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <span aria-hidden className={cn("size-2 rounded-full", TONE_CLASSES[project.tone].dot)} />
          <span className="font-mono">{project.key}</span>
        </span>
        <ProjectStatusBadge status={project.status} />
        {archived ? <Badge variant="outline">Archived</Badge> : null}
        <span>Owner {owner?.name ?? "Unassigned"}</span>
        {project.targetDate ? <span>Target {formatCalendarDate(project.targetDate)}</span> : null}
      </div>

      <section aria-label="Project metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Progress" value={`${metrics.percent}%`} hint="Share of tasks done" />
        <StatTile label="Done" value={metrics.done} hint={`of ${metrics.total} tasks`} />
        <StatTile label="Open" value={metrics.open} hint="Still in flight" />
        <StatTile label="Overdue" value={metrics.overdue} emphasis={metrics.overdue > 0} hint="Past their due date" />
      </section>

      <section aria-labelledby="project-tasks-heading" className="flex min-w-0 flex-col gap-4">
        <h2 id="project-tasks-heading" className="font-display text-3xl leading-none">
          Tasks
        </h2>
        <TaskWorkbench projectId={project.id} />
      </section>

      <section aria-labelledby="project-activity-heading" className="flex flex-col gap-4">
        <h2 id="project-activity-heading" className="font-display text-3xl leading-none">
          Recent activity
        </h2>
        <ActivityFeed events={recentActivity} membersById={membersById} emptyMessage="No activity for this project yet." />
      </section>

      <ProjectFormDialog open={editing} project={project} onOpenChange={setEditing} />
    </div>
  );
}
