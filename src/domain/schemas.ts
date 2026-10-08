import { z } from "zod";
import {
  DEFAULT_VIEWS,
  DENSITIES,
  PROJECT_STATUSES,
  PROJECT_TONES,
  TASK_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "./types";

const calendarDate = z.iso.date();
const timestamp = z.iso.datetime();

export const memberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  title: z.string(),
  tone: z.enum(PROJECT_TONES),
});

export const projectSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(PROJECT_STATUSES),
  tone: z.enum(PROJECT_TONES),
  ownerId: z.string(),
  targetDate: calendarDate.nullable(),
  createdAt: timestamp,
  archivedAt: timestamp.nullable(),
});

export const taskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  number: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  assigneeId: z.string().nullable(),
  labels: z.array(z.enum(TASK_LABELS)),
  dueDate: calendarDate.nullable(),
  createdAt: timestamp,
  updatedAt: timestamp,
  completedAt: timestamp.nullable(),
});

const activityBase = z.object({
  id: z.string(),
  at: timestamp,
  actorId: z.string(),
});

const taskActivityBase = activityBase.extend({
  taskId: z.string(),
  taskTitle: z.string(),
  projectId: z.string(),
});

export const activityEventSchema = z.discriminatedUnion("type", [
  taskActivityBase.extend({ type: z.literal("task.created") }),
  taskActivityBase.extend({
    type: z.literal("task.status_changed"),
    from: z.enum(TASK_STATUSES),
    to: z.enum(TASK_STATUSES),
  }),
  taskActivityBase.extend({
    type: z.literal("task.priority_changed"),
    from: z.enum(TASK_PRIORITIES),
    to: z.enum(TASK_PRIORITIES),
  }),
  taskActivityBase.extend({
    type: z.literal("task.assigned"),
    assigneeId: z.string().nullable(),
  }),
  activityBase.extend({
    type: z.literal("task.deleted"),
    taskTitle: z.string(),
    projectId: z.string(),
  }),
  activityBase.extend({
    type: z.literal("project.created"),
    projectId: z.string(),
    projectName: z.string(),
  }),
  activityBase.extend({
    type: z.literal("project.updated"),
    projectId: z.string(),
    projectName: z.string(),
  }),
  activityBase.extend({
    type: z.literal("project.archived"),
    projectId: z.string(),
    projectName: z.string(),
    archived: z.boolean(),
  }),
]);

export const preferencesSchema = z.object({
  activeWorkspaceId: z.string(),
  defaultView: z.enum(DEFAULT_VIEWS),
  density: z.enum(DENSITIES),
  sidebarCollapsed: z.boolean(),
  notifications: z.object({
    assignments: z.boolean(),
    dueSoon: z.boolean(),
    projectUpdates: z.boolean(),
    weeklyDigest: z.boolean(),
  }),
});

export const workspaceStateSchema = z.object({
  currentMemberId: z.string(),
  workspaces: z.array(z.object({ id: z.string(), name: z.string(), plan: z.string() })),
  members: z.array(memberSchema),
  projects: z.array(projectSchema),
  tasks: z.array(taskSchema),
  activity: z.array(activityEventSchema),
  preferences: preferencesSchema,
});

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Give the task a title.").max(140, "Keep the title under 140 characters."),
  description: z.string().max(2000, "Keep the description under 2000 characters."),
  projectId: z.string().min(1, "Choose a project."),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  assigneeId: z.string().nullable(),
  labels: z.array(z.enum(TASK_LABELS)),
  dueDate: calendarDate.nullable(),
});

export const projectFormSchema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters.").max(60, "Keep the name under 60 characters."),
  key: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2,5}$/, "Use 2 to 5 letters, for example WEB."),
  description: z.string().max(500, "Keep the description under 500 characters."),
  status: z.enum(PROJECT_STATUSES),
  tone: z.enum(PROJECT_TONES),
  targetDate: calendarDate.nullable(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
export type ProjectFormValues = z.infer<typeof projectFormSchema>;
