"use client";

import { FolderOpen, LayoutGrid, Plus, Rows3 } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { WORKSPACE_TODAY } from "@/data/clock";
import { projectMetrics } from "@/domain/stats";
import { PROJECT_STATUS_META } from "@/domain/meta";
import { PROJECT_STATUSES, type Project, type ProjectStatus } from "@/domain/types";
import { asOption } from "@/lib/options";
import { useWorkspaceState } from "@/store/workspace-store";
import { ProjectCard } from "./project-card";
import { ProjectFormDialog } from "./project-form-dialog";
import { ProjectTable, type ProjectRow } from "./project-table";

type ViewMode = "grid" | "list";
type ProjectSortField = "name" | "progress" | "target";
type StatusFilter = ProjectStatus | "all";

const SORT_LABELS: Record<ProjectSortField, string> = {
  name: "Name",
  progress: "Progress",
  target: "Target date",
};

export function ProjectsView() {
  const { projects, tasks, members } = useWorkspaceState();
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<ProjectSortField>("name");
  const [showArchived, setShowArchived] = useState(false);
  const [dialog, setDialog] = useState<{ open: boolean; project: Project | undefined }>({ open: false, project: undefined });

  const rows = useMemo<ProjectRow[]>(() => {
    const membersById = new Map(members.map((member) => [member.id, member]));
    const needle = search.trim().toLowerCase();

    return projects
      .filter((project) => showArchived || project.archivedAt === null)
      .filter((project) => statusFilter === "all" || project.status === statusFilter)
      .filter(
        (project) =>
          needle === "" ||
          project.name.toLowerCase().includes(needle) ||
          project.key.toLowerCase().includes(needle),
      )
      .map((project) => ({
        project,
        metrics: projectMetrics(
          tasks.filter((task) => task.projectId === project.id),
          WORKSPACE_TODAY,
        ),
        owner: membersById.get(project.ownerId),
      }))
      .sort((a, b) => compareRows(a, b, sortField));
  }, [projects, tasks, members, search, statusFilter, sortField, showArchived]);

  const openCreate = () => setDialog({ open: true, project: undefined });
  const openEdit = (project: Project) => setDialog({ open: true, project });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Projects"
        description="Track progress across every project in this workspace."
        actions={
          <Button onClick={openCreate}>
            <Plus aria-hidden />
            New project
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filter projects"
          aria-label="Filter projects"
          className="h-8 w-full sm:w-56"
        />
        <Select
          value={statusFilter}
          onValueChange={(next) => {
            if (next === "all") setStatusFilter("all");
            else {
              const status = asOption(PROJECT_STATUSES, next);
              if (status) setStatusFilter(status);
            }
          }}
        >
          <SelectTrigger size="sm" className="h-8 w-40" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PROJECT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {PROJECT_STATUS_META[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sortField}
          onValueChange={(next) => {
            if (next === "name" || next === "progress" || next === "target") setSortField(next);
          }}
        >
          <SelectTrigger size="sm" className="h-8 w-40" aria-label="Sort projects">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_LABELS) as ProjectSortField[]).map((field) => (
              <SelectItem key={field} value={field}>
                Sort: {SORT_LABELS[field]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
          <Label htmlFor="show-archived" className="text-sm font-normal">
            Show archived
          </Label>
        </div>

        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={view}
          onValueChange={(next) => {
            if (next === "grid" || next === "list") setView(next);
          }}
          aria-label="Layout"
          className="ml-auto"
        >
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid aria-hidden />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <Rows3 aria-hidden />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={projects.length === 0 ? "No projects yet" : "No projects match these filters"}
          description={
            projects.length === 0
              ? "Create a project to group tasks and track progress."
              : "Try another status or show archived projects."
          }
          action={
            projects.length === 0 ? (
              <Button size="sm" onClick={openCreate}>
                New project
              </Button>
            ) : undefined
          }
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <ProjectCard key={row.project.id} project={row.project} metrics={row.metrics} owner={row.owner} onEdit={openEdit} />
          ))}
        </div>
      ) : (
        <ProjectTable rows={rows} onEdit={openEdit} />
      )}

      <ProjectFormDialog
        open={dialog.open}
        project={dialog.project}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
      />
    </div>
  );
}

function compareRows(a: ProjectRow, b: ProjectRow, field: ProjectSortField): number {
  switch (field) {
    case "name":
      return a.project.name.localeCompare(b.project.name);
    case "progress":
      return b.metrics.percent - a.metrics.percent || a.project.name.localeCompare(b.project.name);
    case "target":
      return (a.project.targetDate ?? "9999").localeCompare(b.project.targetDate ?? "9999");
  }
}
