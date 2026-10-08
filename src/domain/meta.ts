import type {
  DefaultView,
  Density,
  ProjectStatus,
  TaskLabel,
  TaskPriority,
  TaskStatus,
} from "./types";

export const STATUS_META: Record<TaskStatus, { label: string; description: string }> = {
  backlog: { label: "Backlog", description: "Not yet planned" },
  todo: { label: "To do", description: "Planned and ready to start" },
  in_progress: { label: "In progress", description: "Actively being worked on" },
  in_review: { label: "In review", description: "Waiting on feedback or QA" },
  done: { label: "Done", description: "Completed" },
};

export const PRIORITY_META: Record<TaskPriority, { label: string; rank: number }> = {
  urgent: { label: "Urgent", rank: 0 },
  high: { label: "High", rank: 1 },
  medium: { label: "Medium", rank: 2 },
  low: { label: "Low", rank: 3 },
  none: { label: "No priority", rank: 4 },
};

export const LABEL_META: Record<TaskLabel, { label: string }> = {
  bug: { label: "Bug" },
  feature: { label: "Feature" },
  design: { label: "Design" },
  infra: { label: "Infra" },
  docs: { label: "Docs" },
  research: { label: "Research" },
};

export const PROJECT_STATUS_META: Record<ProjectStatus, { label: string }> = {
  planning: { label: "Planning" },
  active: { label: "Active" },
  at_risk: { label: "At risk" },
  completed: { label: "Completed" },
};

export const DEFAULT_VIEW_META: Record<DefaultView, { label: string; href: string }> = {
  dashboard: { label: "Dashboard", href: "/dashboard" },
  projects: { label: "Projects", href: "/projects" },
  board: { label: "Board", href: "/board" },
  tasks: { label: "Tasks", href: "/tasks" },
};

export const DENSITY_META: Record<Density, { label: string }> = {
  comfortable: { label: "Comfortable" },
  compact: { label: "Compact" },
};
