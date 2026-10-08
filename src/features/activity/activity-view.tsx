"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACTIVITY_FILTERS, matchesActivityFilter, type ActivityFilter } from "@/domain/activity";
import { useWorkspaceState } from "@/store/workspace-store";
import { PageHeader } from "@/components/common/page-header";
import { ActivityFeed } from "./activity-feed";
import { asOption } from "@/lib/options";

const PAGE_SIZE = 20;
const FILTER_KEYS = Object.keys(ACTIVITY_FILTERS) as ActivityFilter[];

export function ActivityView() {
  const { activity, members, projects } = useWorkspaceState();
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [projectId, setProjectId] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const membersById = useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);

  const filtered = useMemo(
    () =>
      activity.filter(
        (event) => matchesActivityFilter(event, filter) && (projectId === "all" || event.projectId === projectId),
      ),
    [activity, filter, projectId],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Activity"
        description="Every status change, assignment and project update, newest first."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filter}
          onValueChange={(next) => {
            const option = asOption(FILTER_KEYS, next);
            if (option) {
              setFilter(option);
              setVisibleCount(PAGE_SIZE);
            }
          }}
        >
          <SelectTrigger size="sm" className="h-8 w-56" aria-label="Filter activity">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                {ACTIVITY_FILTERS[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={projectId}
          onValueChange={(next) => {
            setProjectId(next);
            setVisibleCount(PAGE_SIZE);
          }}
        >
          <SelectTrigger size="sm" className="h-8 w-56" aria-label="Filter by project">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">{filtered.length} events</span>
      </div>

      <ActivityFeed
        events={filtered.slice(0, visibleCount)}
        membersById={membersById}
        emptyMessage="Nothing matches these filters yet."
      />

      {filtered.length > visibleCount ? (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
            Show more
          </Button>
        </div>
      ) : null}
    </div>
  );
}
