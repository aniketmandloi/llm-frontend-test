import Link from "next/link";
import { MemberAvatar } from "@/components/common/member-avatar";
import { ProjectStatusBadge } from "@/components/common/project-status-badge";
import { TONE_CLASSES } from "@/components/common/tone";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ProjectMetrics } from "@/domain/stats";
import type { Member, Project } from "@/domain/types";
import { formatCalendarDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProjectMenu } from "./project-menu";

export interface ProjectRow {
  project: Project;
  metrics: ProjectMetrics;
  owner: Member | undefined;
}

export function ProjectTable({ rows, onEdit }: { rows: readonly ProjectRow[]; onEdit: (project: Project) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Project</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="w-56">Progress</TableHead>
            <TableHead className="hidden md:table-cell">Tasks</TableHead>
            <TableHead className="hidden lg:table-cell">Owner</TableHead>
            <TableHead className="hidden lg:table-cell">Target</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ project, metrics, owner }) => {
            const archived = project.archivedAt !== null;
            return (
              <TableRow key={project.id} className={cn("h-14", archived && "text-muted-foreground")}>
                <TableCell className="pl-4">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span aria-hidden className={cn("size-2 shrink-0 rounded-full", TONE_CLASSES[project.tone].dot)} />
                    <div className="flex min-w-0 flex-col">
                      <Link href={`/projects/${project.id}`} className="truncate font-medium hover:underline">
                        {project.name}
                      </Link>
                      <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                        {project.key}
                        {archived ? <Badge variant="outline" className="h-4 px-1 font-sans text-[0.6rem]">Archived</Badge> : null}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <ProjectStatusBadge status={project.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Progress value={metrics.percent} className="h-1.5 w-28" aria-label={`${project.name} progress`} />
                    <span className="text-xs tabular-nums">{metrics.percent}%</span>
                  </div>
                </TableCell>
                <TableCell className="hidden tabular-nums md:table-cell">
                  {metrics.done}/{metrics.total}
                  {metrics.overdue > 0 ? (
                    <span className="ml-2 text-xs text-destructive">{metrics.overdue} overdue</span>
                  ) : null}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <MemberAvatar member={owner} size="xs" />
                    <span className="truncate text-sm">{owner?.name ?? "Unassigned"}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden whitespace-nowrap text-muted-foreground lg:table-cell">
                  {project.targetDate ? formatCalendarDate(project.targetDate) : "—"}
                </TableCell>
                <TableCell>
                  <ProjectMenu project={project} onEdit={onEdit} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
