"use client";

import { ListTodo, SearchX } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { toggleValue } from "@/lib/options";
import { useWorkspaceState } from "@/store/workspace-store";
import { BulkActionBar } from "./bulk-action-bar";
import { EMPTY_TASK_FILTERS } from "@/domain/tasks";
import { useTaskSheet } from "./task-sheet-context";
import { TaskList } from "./task-list";
import { TaskToolbar } from "./task-toolbar";
import { useTaskView } from "./use-task-view";

/**
 * Filter, sort, select and bulk-edit tasks. Used by the Tasks page and by project
 * pages (scoped with `projectId`), so both behave the same way.
 */
export function TaskWorkbench({ projectId }: { projectId?: string }) {
  const { members, projects, preferences } = useWorkspaceState();
  const { filters, setFilters, sort, setSort, scopedTasks, visibleTasks, projectsById } = useTaskView({ projectId });
  const { openCreate, openTask } = useTaskSheet();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const visibleIds = useMemo(() => visibleTasks.map((task) => task.id), [visibleTasks]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  // Bulk actions only touch selected rows that are on screen, so a filter cannot hide a target.
  const bulkTargetIds = useMemo(() => visibleIds.filter((id) => selectedSet.has(id)), [visibleIds, selectedSet]);

  const toggleSelected = useCallback((taskId: string) => {
    setSelectedIds((current) => toggleValue(current, taskId));
  }, []);

  const toggleAll = useCallback(
    (checked: boolean) => {
      setSelectedIds(checked ? visibleIds : []);
    },
    [visibleIds],
  );

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const isEmptyScope = scopedTasks.length === 0;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      {isEmptyScope ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks yet"
          description="Create a task to start tracking work across this project."
          action={
            <Button size="sm" onClick={() => openCreate({ projectId })}>
              New task
            </Button>
          }
        />
      ) : (
        <>
          <TaskToolbar
            filters={filters}
            onFiltersChange={setFilters}
            sort={sort}
            onSortChange={setSort}
            members={members}
            projects={projects}
            showProjectFilter={projectId === undefined}
            resultCount={visibleTasks.length}
            totalCount={scopedTasks.length}
          />

          {visibleTasks.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No tasks match these filters"
              description="Try a different search term or clear the filters."
              action={
                <Button variant="outline" size="sm" onClick={() => setFilters(EMPTY_TASK_FILTERS)}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <TaskList
              tasks={visibleTasks}
              projectsById={projectsById}
              members={members}
              selectedIds={selectedSet}
              onToggleSelected={toggleSelected}
              onToggleAll={toggleAll}
              onOpenTask={openTask}
              sort={sort}
              onSortChange={setSort}
              density={preferences.density}
            />
          )}
        </>
      )}

      <BulkActionBar taskIds={bulkTargetIds} onClear={clearSelection} />
    </div>
  );
}
