import { PRIORITY_META, STATUS_META } from "./meta";
import type { ActivityEvent, ActivityType, Member } from "./types";

export const ACTIVITY_FILTERS = {
  all: "All activity",
  tasks: "Task created or deleted",
  status: "Status changes",
  priority: "Priority changes",
  assignment: "Assignments",
  projects: "Project updates",
} as const;

export type ActivityFilter = keyof typeof ACTIVITY_FILTERS;

const FILTER_TYPES: Record<Exclude<ActivityFilter, "all">, readonly ActivityType[]> = {
  tasks: ["task.created", "task.deleted"],
  status: ["task.status_changed"],
  priority: ["task.priority_changed"],
  assignment: ["task.assigned"],
  projects: ["project.created", "project.updated", "project.archived"],
};

export function matchesActivityFilter(event: ActivityEvent, filter: ActivityFilter): boolean {
  return filter === "all" || FILTER_TYPES[filter].includes(event.type);
}

export function describeActivity(event: ActivityEvent, membersById: ReadonlyMap<string, Member>): string {
  switch (event.type) {
    case "task.created":
      return `created ${event.taskTitle}`;
    case "task.status_changed":
      return `moved ${event.taskTitle} from ${STATUS_META[event.from].label} to ${STATUS_META[event.to].label}`;
    case "task.priority_changed":
      return `set ${event.taskTitle} priority from ${PRIORITY_META[event.from].label} to ${PRIORITY_META[event.to].label}`;
    case "task.assigned": {
      if (event.assigneeId === null) return `unassigned ${event.taskTitle}`;
      const assignee = membersById.get(event.assigneeId)?.name ?? "someone";
      return `assigned ${event.taskTitle} to ${assignee}`;
    }
    case "task.deleted":
      return `deleted ${event.taskTitle}`;
    case "project.created":
      return `created project ${event.projectName}`;
    case "project.updated":
      return `updated project ${event.projectName}`;
    case "project.archived":
      return event.archived ? `archived ${event.projectName}` : `restored ${event.projectName}`;
  }
}
