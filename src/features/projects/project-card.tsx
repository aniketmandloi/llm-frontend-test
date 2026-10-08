import Link from "next/link";
import { MemberAvatar } from "@/components/common/member-avatar";
import { ProjectStatusBadge } from "@/components/common/project-status-badge";
import { TONE_CLASSES } from "@/components/common/tone";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { ProjectMetrics } from "@/domain/stats";
import type { Member, Project } from "@/domain/types";
import { formatCalendarDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProjectMenu } from "./project-menu";

interface ProjectCardProps {
  project: Project;
  metrics: ProjectMetrics;
  owner: Member | undefined;
  onEdit: (project: Project) => void;
}

export function ProjectCard({ project, metrics, owner, onEdit }: ProjectCardProps) {
  const archived = project.archivedAt !== null;

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/25",
        archived && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span aria-hidden className={cn("size-2 rounded-full", TONE_CLASSES[project.tone].dot)} />
            <span className="font-mono">{project.key}</span>
            {archived ? <Badge variant="outline">Archived</Badge> : null}
          </div>
          <h3 className="truncate text-base font-semibold">
            <Link
              href={`/projects/${project.id}`}
              className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              {project.name}
            </Link>
          </h3>
        </div>
        <ProjectMenu project={project} onEdit={onEdit} className="relative z-10 -mt-1 -mr-2" />
      </div>

      <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{project.description}</p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="tabular-nums">
            {metrics.done} of {metrics.total} tasks done
          </span>
          <span className="font-medium text-foreground tabular-nums">{metrics.percent}%</span>
        </div>
        <Progress value={metrics.percent} className="h-1.5" aria-label={`${project.name} progress`} />
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <ProjectStatusBadge status={project.status} />
        <div className="flex items-center gap-3">
          {metrics.overdue > 0 ? <span className="text-destructive tabular-nums">{metrics.overdue} overdue</span> : null}
          {project.targetDate ? <span>Due {formatCalendarDate(project.targetDate)}</span> : null}
          <MemberAvatar member={owner} size="xs" />
        </div>
      </div>
    </article>
  );
}
