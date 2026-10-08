import { PROJECT_STATUS_META } from "@/domain/meta";
import type { ProjectStatus } from "@/domain/types";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<ProjectStatus, string> = {
  planning: "bg-slate-400",
  active: "bg-emerald-500",
  at_risk: "bg-rose-500",
  completed: "bg-blue-500",
};

export function ProjectStatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm text-muted-foreground", className)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", STATUS_DOT[status])} />
      {PROJECT_STATUS_META[status].label}
    </span>
  );
}
