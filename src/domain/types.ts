export const TASK_STATUSES = ["backlog", "todo", "in_progress", "in_review", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["urgent", "high", "medium", "low", "none"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_LABELS = ["bug", "feature", "design", "infra", "docs", "research"] as const;
export type TaskLabel = (typeof TASK_LABELS)[number];

export const PROJECT_STATUSES = ["planning", "active", "at_risk", "completed"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_TONES = ["blue", "emerald", "amber", "rose", "violet", "slate"] as const;
export type ProjectTone = (typeof PROJECT_TONES)[number];

export const DEFAULT_VIEWS = ["dashboard", "projects", "board", "tasks"] as const;
export type DefaultView = (typeof DEFAULT_VIEWS)[number];

export const DENSITIES = ["comfortable", "compact"] as const;
export type Density = (typeof DENSITIES)[number];

/** ISO calendar date, `YYYY-MM-DD`. Compared as strings. */
export type CalendarDate = string;

/** Full ISO-8601 timestamp, e.g. `2026-10-08T09:30:00.000Z`. */
export type Timestamp = string;

export interface Member {
  id: string;
  name: string;
  email: string;
  title: string;
  tone: ProjectTone;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  status: ProjectStatus;
  tone: ProjectTone;
  ownerId: string;
  targetDate: CalendarDate | null;
  createdAt: Timestamp;
  archivedAt: Timestamp | null;
}

export interface Task {
  id: string;
  projectId: string;
  /** Sequence within the project, used to build the task code (e.g. WEB-12). */
  number: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  labels: TaskLabel[];
  dueDate: CalendarDate | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt: Timestamp | null;
}

export type TaskPatch = Partial<
  Pick<Task, "title" | "description" | "status" | "priority" | "assigneeId" | "labels" | "dueDate" | "projectId">
>;

export type ProjectPatch = Partial<
  Pick<Project, "name" | "description" | "status" | "tone" | "targetDate">
>;

interface ActivityBase {
  id: string;
  at: Timestamp;
  actorId: string;
}

export type ActivityEvent = ActivityBase &
  (
    | { type: "task.created"; taskId: string; taskTitle: string; projectId: string }
    | {
        type: "task.status_changed";
        taskId: string;
        taskTitle: string;
        projectId: string;
        from: TaskStatus;
        to: TaskStatus;
      }
    | {
        type: "task.priority_changed";
        taskId: string;
        taskTitle: string;
        projectId: string;
        from: TaskPriority;
        to: TaskPriority;
      }
    | {
        type: "task.assigned";
        taskId: string;
        taskTitle: string;
        projectId: string;
        assigneeId: string | null;
      }
    | { type: "task.deleted"; taskTitle: string; projectId: string }
    | { type: "project.created"; projectId: string; projectName: string }
    | { type: "project.updated"; projectId: string; projectName: string }
    | { type: "project.archived"; projectId: string; projectName: string; archived: boolean }
  );

export type ActivityType = ActivityEvent["type"];

export interface Workspace {
  id: string;
  name: string;
  plan: string;
}

export interface Preferences {
  activeWorkspaceId: string;
  workspaceName: string;
  defaultView: DefaultView;
  density: Density;
  sidebarCollapsed: boolean;
  notifications: {
    assignments: boolean;
    dueSoon: boolean;
    projectUpdates: boolean;
    weeklyDigest: boolean;
  };
}

export interface WorkspaceState {
  currentMemberId: string;
  workspaces: Workspace[];
  members: Member[];
  projects: Project[];
  tasks: Task[];
  activity: ActivityEvent[];
  preferences: Preferences;
}
