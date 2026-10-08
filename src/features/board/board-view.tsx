"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { STATUS_META } from "@/domain/meta";
import { groupTasksByStatus, taskCode } from "@/domain/tasks";
import { TASK_STATUSES } from "@/domain/types";
import { asOption } from "@/lib/options";
import { useTaskSheet } from "@/features/tasks/task-sheet-context";
import { TaskToolbar } from "@/features/tasks/task-toolbar";
import { useTaskView } from "@/features/tasks/use-task-view";
import { useWorkspaceState, workspaceActions } from "@/store/workspace-store";
import { BoardColumn } from "./board-column";
import { TaskCardBody } from "./task-card";

export function BoardView() {
  const { members, projects } = useWorkspaceState();
  const { filters, setFilters, sort, setSort, scopedTasks, visibleTasks, projectsById } = useTaskView();
  const { openTask } = useTaskSheet();
  const [activeId, setActiveId] = useState<string | null>(null);

  const membersById = useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);
  const columns = useMemo(() => groupTasksByStatus(visibleTasks), [visibleTasks]);
  const activeTask = activeId === null ? undefined : visibleTasks.find((task) => task.id === activeId);

  // A single project filter makes that project the target for quick add. Otherwise use the first live project.
  const quickAddProjectId =
    filters.projectIds.length === 1 ? filters.projectIds[0] : projects.find((project) => project.archivedAt === null)?.id;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const onDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const onDragCancel = useCallback(() => setActiveId(null), []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const status = asOption(TASK_STATUSES, String(over.id));
      const task = scopedTasks.find((item) => item.id === String(active.id));
      if (!status || !task || task.status === status) return;

      workspaceActions.updateTasks([task.id], { status });
      toast.success(`Moved to ${STATUS_META[status].label}`, { description: task.title });
    },
    [scopedTasks],
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-5">
      <PageHeader title="Board" description="Drag tasks between columns to change their status." />

      <TaskToolbar
        filters={filters}
        onFiltersChange={setFilters}
        sort={sort}
        onSortChange={setSort}
        members={members}
        projects={projects}
        showProjectFilter
        resultCount={visibleTasks.length}
        totalCount={scopedTasks.length}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto pb-2">
          {TASK_STATUSES.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={columns[status]}
              projectsById={projectsById}
              membersById={membersById}
              quickAddProjectId={quickAddProjectId}
              onOpenTask={openTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCardBody
              task={activeTask}
              code={taskCode(activeTask, projectsById.get(activeTask.projectId))}
              assignee={activeTask.assigneeId === null ? null : (membersById.get(activeTask.assigneeId) ?? null)}
              overlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
