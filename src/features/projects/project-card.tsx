import Link from "next/link";
import { MemberAvatar } from "@/components/common/member-avatar";
import { OrbitRing } from "@/components/common/orbit-ring";
import { ProjectStatusBadge } from "@/components/common/project-status-badge";
import { TONE_CLASSES } from "@/components/common/tone";
import { Badge } from "@/components/ui/badge";
import type { ProjectMetrics } from "@/domain/stats";
import type { Member, Project } from "@/domain/types";
import { formatCalendarDate } from "@/lib/format";
import { cssVars } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ProjectMenu } from "./project-menu";

interface ProjectCardProps {
  project: Project;
  metrics: ProjectMetrics;
  owner: Member | undefined;
  onEdit: (project: Project) => void;
  /** Position in the grid, used to stagger the entrance. */
  index?: number;
}

export function ProjectCard({ project, metrics, owner, onEdit, index = 0 }: ProjectCardProps) {
  const archived = project.archivedAt !== null;

  return (
    <article
      style={cssVars({ "--i": index })}
      className={cn(
        "animate-reveal group relative flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-xs transition-[transform,box-shadow,border-color] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-md",
        archived && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span aria-hidden className={cn("size-2 rounded-full", TONE_CLASSES[project.tone].dot)} />
            <span className="font-mono">{project.key}</span>
            {archived ? <Badge variant="outline">Archived</Badge> : null}
          </div>
          <h3 className="truncate font-display text-2xl leading-tight">
            <Link
              href={`/projects/${project.id}`}
              className="rounded-sm after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
            >
              {project.name}
            </Link>
          </h3>
        </div>
        <div className="flex shrink-0 items-start gap-1">
          <OrbitRing value={metrics.percent} size={52} strokeWidth={4} showValue />
          <ProjectMenu project={project} onEdit={onEdit} className="relative z-10 -mt-1 -mr-2" />
        </div>
      </div>

      <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">{project.description}</p>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t pt-4 text-xs text-muted-foreground">
        <ProjectStatusBadge status={project.status} />
        <span className="tabular-nums">
          {metrics.done} of {metrics.total} done
        </span>
        <div className="flex items-center gap-3">
          {metrics.overdue > 0 ? <span className="font-medium text-ember tabular-nums">{metrics.overdue} overdue</span> : null}
          {project.targetDate ? <span>Due {formatCalendarDate(project.targetDate)}</span> : null}
          <MemberAvatar member={owner} size="xs" />
        </div>
      </div>
    </article>
  );
}
