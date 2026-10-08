import { useSyncExternalStore } from "react";
import { SEED_WORKSPACE_STATE } from "@/data/seed";
import { nextTaskNumber } from "@/domain/tasks";
import type { ProjectFormValues, TaskFormValues } from "@/domain/schemas";
import type {
  Member,
  Preferences,
  Project,
  Task,
  TaskPatch,
  WorkspaceState,
} from "@/domain/types";
import { type ActionMeta, type WorkspaceAction, workspaceReducer } from "./workspace-reducer";
import { loadPersistedState, persistState } from "./workspace-storage";

/**
 * A single external store. The seed is the server snapshot, so the first client
 * render matches the server markup; persisted state is read only after hydration.
 */
let currentState: WorkspaceState | null = null;
const listeners = new Set<() => void>();

function getState(): WorkspaceState {
  if (currentState === null) {
    currentState = loadPersistedState() ?? SEED_WORKSPACE_STATE;
  }
  return currentState;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function dispatch(action: WorkspaceAction): void {
  const next = workspaceReducer(getState(), action);
  if (next === currentState) return;
  currentState = next;
  persistState(next);
  listeners.forEach((listener) => listener());
}

export function useWorkspaceState(): WorkspaceState {
  return useSyncExternalStore(subscribe, getState, () => SEED_WORKSPACE_STATE);
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function createMeta(): ActionMeta {
  return {
    actionId: createId("act"),
    at: new Date().toISOString(),
    actorId: getState().currentMemberId,
  };
}

export const workspaceActions = {
  createTask(values: TaskFormValues): string {
    const state = getState();
    const meta = createMeta();
    const id = createId("task");
    const task: Task = {
      id,
      projectId: values.projectId,
      number: nextTaskNumber(state.tasks, values.projectId),
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      assigneeId: values.assigneeId,
      labels: values.labels,
      dueDate: values.dueDate,
      createdAt: meta.at,
      updatedAt: meta.at,
      completedAt: values.status === "done" ? meta.at : null,
    };
    dispatch({ type: "task/created", meta, task });
    return id;
  },

  updateTasks(taskIds: string[], patch: TaskPatch): void {
    dispatch({ type: "task/updated", meta: createMeta(), taskIds, patch });
  },

  deleteTasks(taskIds: string[]): void {
    dispatch({ type: "task/deleted", meta: createMeta(), taskIds });
  },

  createProject(values: ProjectFormValues): string {
    const meta = createMeta();
    const id = createId("project");
    const project: Project = {
      id,
      key: values.key,
      name: values.name,
      description: values.description,
      status: values.status,
      tone: values.tone,
      ownerId: meta.actorId,
      targetDate: values.targetDate,
      createdAt: meta.at,
      archivedAt: null,
    };
    dispatch({ type: "project/created", meta, project });
    return id;
  },

  updateProject(projectId: string, values: ProjectFormValues): void {
    dispatch({
      type: "project/updated",
      meta: createMeta(),
      projectId,
      patch: {
        name: values.name,
        description: values.description,
        status: values.status,
        tone: values.tone,
        targetDate: values.targetDate,
      },
    });
  },

  setProjectArchived(projectId: string, archived: boolean): void {
    dispatch({ type: "project/archived", meta: createMeta(), projectId, archived });
  },

  updateMember(memberId: string, patch: Partial<Pick<Member, "name" | "email" | "title">>): void {
    dispatch({ type: "member/updated", memberId, patch });
  },

  updatePreferences(patch: Partial<Preferences>): void {
    dispatch({ type: "preferences/updated", patch });
  },

  toggleSidebar(): void {
    dispatch({
      type: "preferences/updated",
      patch: { sidebarCollapsed: !getState().preferences.sidebarCollapsed },
    });
  },

  renameWorkspace(workspaceId: string, name: string): void {
    dispatch({ type: "workspace/renamed", workspaceId, name });
  },

  resetWorkspace(): void {
    dispatch({ type: "workspace/reset" });
  },
};
