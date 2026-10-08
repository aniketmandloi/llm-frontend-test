import { SEED_WORKSPACE_STATE } from "@/data/seed";
import type {
  ActivityEvent,
  Member,
  Preferences,
  Project,
  ProjectPatch,
  Task,
  TaskPatch,
  Timestamp,
  WorkspaceState,
} from "@/domain/types";

export interface ActionMeta {
  /** Unique per dispatched action. Activity ids are derived from it. */
  actionId: string;
  at: Timestamp;
  actorId: string;
}

export type WorkspaceAction =
  | { type: "task/created"; meta: ActionMeta; task: Task }
  | { type: "task/updated"; meta: ActionMeta; taskIds: string[]; patch: TaskPatch }
  | { type: "task/deleted"; meta: ActionMeta; taskIds: string[] }
  | { type: "project/created"; meta: ActionMeta; project: Project }
  | { type: "project/updated"; meta: ActionMeta; projectId: string; patch: ProjectPatch }
  | { type: "project/archived"; meta: ActionMeta; projectId: string; archived: boolean }
  | { type: "member/updated"; memberId: string; patch: Partial<Pick<Member, "name" | "email" | "title">> }
  | { type: "preferences/updated"; patch: Partial<Preferences> }
  | { type: "workspace/renamed"; workspaceId: string; name: string }
  | { type: "workspace/reset" };

/**
 * Pure transition function. Every mutation that a user can see in the activity
 * feed records its own event here, so the feed cannot drift from the data.
 */
export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "task/created": {
      const { task, meta } = action;
      const events: ActivityEvent[] = [
        {
          id: eventId(meta, "created"),
          type: "task.created",
          at: meta.at,
          actorId: meta.actorId,
          taskId: task.id,
          taskTitle: task.title,
          projectId: task.projectId,
        },
      ];
      if (task.assigneeId !== null) {
        events.push({
          id: eventId(meta, "assigned"),
          type: "task.assigned",
          at: meta.at,
          actorId: meta.actorId,
          taskId: task.id,
          taskTitle: task.title,
          projectId: task.projectId,
          assigneeId: task.assigneeId,
        });
      }
      return withActivity({ ...state, tasks: [...state.tasks, task] }, events);
    }

    case "task/updated": {
      const ids = new Set(action.taskIds);
      const events: ActivityEvent[] = [];
      const tasks = state.tasks.map((task) => {
        if (!ids.has(task.id)) return task;
        const next = applyTaskPatch(task, action.patch, action.meta.at);
        if (next === task) return task;
        events.push(...taskChangeEvents(task, next, action.meta));
        return next;
      });
      return withActivity({ ...state, tasks }, events);
    }

    case "task/deleted": {
      const ids = new Set(action.taskIds);
      const removed = state.tasks.filter((task) => ids.has(task.id));
      if (removed.length === 0) return state;
      const events: ActivityEvent[] = removed.map((task) => ({
        id: eventId(action.meta, `deleted:${task.id}`),
        type: "task.deleted",
        at: action.meta.at,
        actorId: action.meta.actorId,
        taskTitle: task.title,
        projectId: task.projectId,
      }));
      return withActivity({ ...state, tasks: state.tasks.filter((task) => !ids.has(task.id)) }, events);
    }

    case "project/created": {
      const event: ActivityEvent = {
        id: eventId(action.meta, "created"),
        type: "project.created",
        at: action.meta.at,
        actorId: action.meta.actorId,
        projectId: action.project.id,
        projectName: action.project.name,
      };
      return withActivity({ ...state, projects: [...state.projects, action.project] }, [event]);
    }

    case "project/updated": {
      const project = state.projects.find((item) => item.id === action.projectId);
      if (!project) return state;
      const next = { ...project, ...action.patch };
      if (isSameRecord(project, next)) return state;
      const event: ActivityEvent = {
        id: eventId(action.meta, "updated"),
        type: "project.updated",
        at: action.meta.at,
        actorId: action.meta.actorId,
        projectId: next.id,
        projectName: next.name,
      };
      return withActivity(
        { ...state, projects: replaceById(state.projects, next) },
        [event],
      );
    }

    case "project/archived": {
      const project = state.projects.find((item) => item.id === action.projectId);
      if (!project || (project.archivedAt !== null) === action.archived) return state;
      const next: Project = { ...project, archivedAt: action.archived ? action.meta.at : null };
      const event: ActivityEvent = {
        id: eventId(action.meta, "archived"),
        type: "project.archived",
        at: action.meta.at,
        actorId: action.meta.actorId,
        projectId: next.id,
        projectName: next.name,
        archived: action.archived,
      };
      return withActivity({ ...state, projects: replaceById(state.projects, next) }, [event]);
    }

    case "member/updated":
      return {
        ...state,
        members: state.members.map((member) =>
          member.id === action.memberId ? { ...member, ...action.patch } : member,
        ),
      };

    case "preferences/updated":
      return { ...state, preferences: { ...state.preferences, ...action.patch } };

    case "workspace/renamed":
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) =>
          workspace.id === action.workspaceId ? { ...workspace, name: action.name } : workspace,
        ),
      };

    case "workspace/reset":
      return SEED_WORKSPACE_STATE;
  }
}

function eventId(meta: ActionMeta, suffix: string): string {
  return `${meta.actionId}:${suffix}`;
}

function withActivity(state: WorkspaceState, events: ActivityEvent[]): WorkspaceState {
  if (events.length === 0) return state;
  return { ...state, activity: [...events, ...state.activity] };
}

function replaceById<T extends { id: string }>(items: readonly T[], next: T): T[] {
  return items.map((item) => (item.id === next.id ? next : item));
}

function isSameRecord<T extends object>(a: T, b: T): boolean {
  return (Object.keys(b) as (keyof T)[]).every((key) => JSON.stringify(a[key]) === JSON.stringify(b[key]));
}

/** Returns the same reference when nothing changed, so memoized views skip work. */
function applyTaskPatch(task: Task, patch: TaskPatch, at: Timestamp): Task {
  const next: Task = { ...task, ...patch };
  if (isSameRecord(task, next)) return task;

  const becameDone = next.status === "done" && task.status !== "done";
  const leftDone = next.status !== "done" && task.status === "done";
  return {
    ...next,
    updatedAt: at,
    completedAt: becameDone ? at : leftDone ? null : task.completedAt,
  };
}

function taskChangeEvents(previous: Task, next: Task, meta: ActionMeta): ActivityEvent[] {
  const base = {
    at: meta.at,
    actorId: meta.actorId,
    taskId: next.id,
    taskTitle: next.title,
    projectId: next.projectId,
  };
  const events: ActivityEvent[] = [];

  if (previous.status !== next.status) {
    events.push({
      ...base,
      id: eventId(meta, `status:${next.id}`),
      type: "task.status_changed",
      from: previous.status,
      to: next.status,
    });
  }
  if (previous.priority !== next.priority) {
    events.push({
      ...base,
      id: eventId(meta, `priority:${next.id}`),
      type: "task.priority_changed",
      from: previous.priority,
      to: next.priority,
    });
  }
  if (previous.assigneeId !== next.assigneeId) {
    events.push({
      ...base,
      id: eventId(meta, `assigned:${next.id}`),
      type: "task.assigned",
      assigneeId: next.assigneeId,
    });
  }
  return events;
}
