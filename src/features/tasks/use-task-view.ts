"use client";

import { useMemo, useState } from "react";
import { WORKSPACE_TODAY } from "@/data/clock";
import { liveTasks } from "@/domain/stats";
import { EMPTY_TASK_FILTERS, filterTasks, sortTasks, type TaskFilters, type TaskSort } from "@/domain/tasks";
import type { Project } from "@/domain/types";
import { useWorkspaceState } from "@/store/workspace-store";

export const DEFAULT_TASK_SORT: TaskSort = { field: "updatedAt", direction: "desc" };

/**
 * Filter, sort and scope state shared by the task list, the board and project
 * pages. Derived results are memoized so views only re-sort when inputs change.
 */
export function useTaskView({ projectId }: { projectId?: string } = {}) {
  const { tasks, projects } = useWorkspaceState();
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_TASK_FILTERS);
  const [sort, setSort] = useState<TaskSort>(DEFAULT_TASK_SORT);

  const projectsById = useMemo(() => new Map<string, Project>(projects.map((project) => [project.id, project])), [projects]);

  const scopedTasks = useMemo(() => {
    const live = liveTasks(tasks, projects);
    return projectId ? live.filter((task) => task.projectId === projectId) : live;
  }, [tasks, projects, projectId]);

  const visibleTasks = useMemo(
    () => sortTasks(filterTasks(scopedTasks, filters, projectsById, WORKSPACE_TODAY), sort),
    [scopedTasks, filters, projectsById, sort],
  );

  return { filters, setFilters, sort, setSort, scopedTasks, visibleTasks, projectsById };
}
