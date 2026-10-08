import { shiftDate } from "@/domain/calendar";
import type {
  ActivityEvent,
  Member,
  Preferences,
  Project,
  ProjectStatus,
  ProjectTone,
  Task,
  TaskLabel,
  TaskPriority,
  TaskStatus,
  Timestamp,
  WorkspaceState,
} from "@/domain/types";
import { WORKSPACE_TODAY } from "./clock";

/**
 * Seed data is written with short keys and expanded below, so the source stays
 * readable and every relationship (owner, assignee, project) is checked by the
 * type system instead of by hand-typed ids.
 */

type MemberKey = "maya" | "jonas" | "priya" | "diego" | "sam" | "lena" | "kenji" | "ana";
type ProjectKey = "WEB" | "APP" | "BIL" | "DAT" | "OPS" | "DOC";

interface MemberSeed {
  key: MemberKey;
  name: string;
  title: string;
  tone: ProjectTone;
}

const MEMBER_SEEDS: MemberSeed[] = [
  { key: "maya", name: "Maya Chen", title: "Head of Product", tone: "blue" },
  { key: "jonas", name: "Jonas Weber", title: "Staff Engineer", tone: "emerald" },
  { key: "priya", name: "Priya Raman", title: "Product Designer", tone: "violet" },
  { key: "diego", name: "Diego Alvarez", title: "Frontend Engineer", tone: "amber" },
  { key: "sam", name: "Sam Okafor", title: "Backend Engineer", tone: "rose" },
  { key: "lena", name: "Lena Fischer", title: "QA Lead", tone: "slate" },
  { key: "kenji", name: "Kenji Mori", title: "Data Engineer", tone: "blue" },
  { key: "ana", name: "Ana Costa", title: "Engineering Manager", tone: "emerald" },
];

interface ProjectSeed {
  key: ProjectKey;
  name: string;
  description: string;
  status: ProjectStatus;
  tone: ProjectTone;
  owner: MemberKey;
  /** Days from the workspace date. */
  targetInDays: number | null;
  createdDaysAgo: number;
  archivedDaysAgo: number | null;
}

const PROJECT_SEEDS: ProjectSeed[] = [
  {
    key: "WEB",
    name: "Marketing site redesign",
    description:
      "Rebuild the public marketing site on the new design system, with faster pages and localized landing pages.",
    status: "active",
    tone: "blue",
    owner: "maya",
    targetInDays: 42,
    createdDaysAgo: 100,
    archivedDaysAgo: null,
  },
  {
    key: "APP",
    name: "Mobile companion app",
    description:
      "An offline-first companion for capturing tasks on the go. We are still scoping the MVP and the sync model.",
    status: "planning",
    tone: "violet",
    owner: "priya",
    targetInDays: 67,
    createdDaysAgo: 75,
    archivedDaysAgo: null,
  },
  {
    key: "BIL",
    name: "Billing and invoicing v2",
    description:
      "Replace the legacy invoice pipeline with usage-based line items, proration rules and a new PDF renderer.",
    status: "at_risk",
    tone: "rose",
    owner: "ana",
    targetInDays: 21,
    createdDaysAgo: 90,
    archivedDaysAgo: null,
  },
  {
    key: "DAT",
    name: "Analytics pipeline",
    description:
      "Ingest product events, deduplicate them and roll them up for dashboards and experiments.",
    status: "active",
    tone: "emerald",
    owner: "kenji",
    targetInDays: 52,
    createdDaysAgo: 80,
    archivedDaysAgo: null,
  },
  {
    key: "OPS",
    name: "Internal tooling",
    description: "Admin screens, deployment tooling and the runbooks the engineering team relies on.",
    status: "completed",
    tone: "slate",
    owner: "jonas",
    targetInDays: -9,
    createdDaysAgo: 120,
    archivedDaysAgo: null,
  },
  {
    key: "DOC",
    name: "Developer docs portal",
    description:
      "The public API documentation site. Archived while its content moves into the marketing site.",
    status: "active",
    tone: "amber",
    owner: "lena",
    targetInDays: null,
    createdDaysAgo: 110,
    archivedDaysAgo: 56,
  },
];

/**
 * Tuple order: project, title, status, priority, assignee, due (days from the
 * workspace date, or null), labels, and age (days since creation).
 */
type TaskSeed = readonly [
  ProjectKey,
  string,
  TaskStatus,
  TaskPriority,
  MemberKey | null,
  number | null,
  TaskLabel[],
  number,
];

const TASK_SEEDS: TaskSeed[] = [
  // Marketing site redesign
  ["WEB", "Audit current navigation and information architecture", "done", "high", "priya", -20, ["design"], 40],
  ["WEB", "Define new hero messaging with product marketing", "done", "medium", "maya", -12, ["docs"], 36],
  ["WEB", "Design component tokens for marketing pages", "done", "high", "priya", -5, ["design"], 30],
  ["WEB", "Build responsive header with mega menu", "in_review", "high", "diego", 2, ["feature"], 18],
  ["WEB", "Migrate pricing page to the new layout", "in_progress", "urgent", "diego", -2, ["feature"], 15],
  ["WEB", "Write case study copy for three customers", "in_progress", "medium", "maya", 9, ["docs"], 12],
  ["WEB", "Optimise hero image loading and LCP", "todo", "high", "jonas", 6, ["infra"], 10],
  ["WEB", "Set up preview deployments for content editors", "backlog", "low", "sam", null, ["infra"], 22],
  ["WEB", "Fix Safari layout shift in the footer", "todo", "medium", "lena", 4, ["bug"], 7],
  ["WEB", "Add analytics events to primary CTA buttons", "backlog", "low", null, 20, ["feature"], 9],
  ["WEB", "Localise the landing page into German and French", "backlog", "medium", "ana", 35, ["docs"], 5],
  ["WEB", "Accessibility audit of the contact form", "in_review", "high", "lena", -1, ["bug"], 14],
  ["WEB", "Dark mode pass on marketing templates", "todo", "low", "priya", 14, ["design"], 8],
  ["WEB", "Replace the carousel with static testimonials", "done", "medium", "diego", -3, ["feature"], 25],

  // Mobile companion app
  ["APP", "Define MVP scope for offline task capture", "done", "urgent", "maya", -28, ["research"], 45],
  ["APP", "Prototype the quick-add sheet in Figma", "done", "high", "priya", -15, ["design"], 38],
  ["APP", "Evaluate React Native against native shells", "done", "medium", "jonas", -22, ["research"], 42],
  ["APP", "Set up the Expo project with a shared API client", "in_progress", "high", "diego", 3, ["infra"], 16],
  ["APP", "Push notification opt-in flow", "todo", "medium", "diego", 17, ["feature"], 9],
  ["APP", "Offline sync conflict strategy write-up", "in_progress", "urgent", "jonas", 1, ["research"], 13],
  ["APP", "Biometric unlock for returning users", "backlog", "low", null, null, ["feature"], 6],
  ["APP", "Accessibility review of the quick-add sheet", "backlog", "medium", "lena", 26, ["design"], 4],
  ["APP", "Crash reporting integration", "todo", "high", "sam", 10, ["infra"], 11],
  ["APP", "Dark theme tokens for mobile", "in_review", "low", "priya", 0, ["design"], 19],
  ["APP", "Background sync retry with backoff", "backlog", "high", "sam", 30, ["infra"], 3],
  ["APP", "Deep links from email digests", "todo", "medium", "sam", 12, ["feature"], 8],
  ["APP", "Beta tester recruitment plan", "backlog", "none", "maya", 40, ["docs"], 2],

  // Billing and invoicing v2
  ["BIL", "Model invoice line items for usage billing", "done", "urgent", "sam", -16, ["feature"], 50],
  ["BIL", "Migrate legacy invoice PDFs to the new renderer", "in_progress", "urgent", "sam", -4, ["infra"], 33],
  ["BIL", "Proration rules for mid-cycle plan changes", "in_progress", "urgent", "jonas", -1, ["feature"], 28],
  ["BIL", "Webhook retries for failed payments", "in_review", "high", "jonas", 2, ["bug"], 21],
  ["BIL", "Tax fallback when the provider times out", "todo", "high", "sam", 5, ["bug"], 14],
  ["BIL", "Customer-facing invoice history page", "todo", "medium", "diego", 9, ["feature"], 12],
  ["BIL", "Reconcile ledger export with the accounting CSV", "in_progress", "high", "kenji", -6, ["infra"], 26],
  ["BIL", "Review dunning email copy", "in_review", "medium", "maya", 3, ["docs"], 17],
  ["BIL", "Fix rounding error in multi-currency totals", "todo", "urgent", "lena", -2, ["bug"], 9],
  ["BIL", "Admin refund flow with an audit trail", "backlog", "high", "sam", 24, ["feature"], 6],
  ["BIL", "Load test invoice generation at 10k per minute", "backlog", "medium", "lena", 31, ["infra"], 5],
  ["BIL", "Design the invoice header and footer", "done", "medium", "priya", -10, ["design"], 40],
  ["BIL", "Document API changes for billing v2", "backlog", "low", null, null, ["docs"], 4],
  ["BIL", "Sunset legacy plan identifiers", "backlog", "low", null, 45, ["infra"], 2],

  // Analytics pipeline
  ["DAT", "Ingest the event stream from the web SDK", "done", "high", "kenji", -30, ["infra"], 60],
  ["DAT", "Schema registry for event contracts", "done", "high", "kenji", -18, ["infra"], 48],
  ["DAT", "Deduplicate events by idempotency key", "done", "medium", "sam", -9, ["bug"], 35],
  ["DAT", "Daily rollup job for project metrics", "in_review", "high", "kenji", 1, ["feature"], 20],
  ["DAT", "Backfill 90 days of historic events", "in_progress", "medium", "kenji", 7, ["infra"], 15],
  ["DAT", "Dashboards read from rollup tables", "in_progress", "high", "diego", -3, ["feature"], 13],
  ["DAT", "Alert when ingestion lag exceeds ten minutes", "todo", "urgent", "sam", 4, ["infra"], 10],
  ["DAT", "Document event naming conventions", "todo", "low", "ana", 15, ["docs"], 9],
  ["DAT", "Evaluate ClickHouse for hot storage", "backlog", "medium", null, null, ["research"], 22],
  ["DAT", "Review warehouse query costs", "backlog", "medium", "ana", 28, ["research"], 7],
  ["DAT", "Retention policy for raw events", "todo", "medium", "jonas", 18, ["infra"], 6],
  ["DAT", "Scrub PII from user agent strings", "in_review", "high", "lena", -1, ["bug"], 16],
  ["DAT", "Cohort retention query prototype", "in_progress", "low", "priya", 12, ["research"], 5],
  ["DAT", "Sample dataset for designers", "backlog", "none", null, null, ["docs"], 3],

  // Internal tooling
  ["OPS", "Migrate CI runners to the new cluster", "done", "high", "jonas", -40, ["infra"], 70],
  ["OPS", "Single sign-on for the internal admin", "done", "urgent", "sam", -35, ["feature"], 66],
  ["OPS", "Release checklist template", "done", "low", "ana", -30, ["docs"], 60],
  ["OPS", "Fix flaky deploy smoke test", "done", "medium", "lena", -25, ["bug"], 52],
  ["OPS", "Feature flag admin page", "done", "medium", "diego", -20, ["feature"], 48],
  ["OPS", "Slack alerts for failed deploys", "done", "medium", "jonas", -18, ["infra"], 44],
  ["OPS", "Onboarding runbook for new engineers", "done", "low", "ana", -14, ["docs"], 40],
  ["OPS", "Rotate service account credentials", "done", "high", "sam", -10, ["infra"], 30],
  ["OPS", "Remove deprecated cron scripts", "done", "low", "jonas", -6, ["infra"], 25],
  ["OPS", "Audit log viewer", "done", "medium", "diego", -2, ["feature"], 20],

  // Developer docs portal (archived)
  ["DOC", "Choose a static site generator", "done", "medium", "lena", -60, ["research"], 90],
  ["DOC", "Write the authentication guide", "in_progress", "medium", "lena", -40, ["docs"], 70],
  ["DOC", "API reference generation pipeline", "backlog", "low", "diego", null, ["infra"], 50],
  ["DOC", "Code sample review", "todo", "low", "priya", null, ["docs"], 30],
];

const LABEL_NOTE: Record<TaskLabel, string> = {
  bug: "Reproduce on staging, add a regression check and confirm the fix before release.",
  feature: "Agree the scope with product, build behind a flag and document the rollout.",
  design: "Share the working file with the team and sign off each state before handoff.",
  infra: "Record the change in the runbook and confirm alerts still fire after rollout.",
  docs: "Keep the wording consistent with the style guide and link it from the project overview.",
  research: "Write up the options with trade-offs and a recommendation for the next review.",
};

function stamp(daysAgo: number, hour: number, minute = 0): Timestamp {
  return new Date(Date.UTC(2026, 9, 9 - daysAgo, hour, minute)).toISOString();
}

const memberId = (key: MemberKey) => `m-${key}`;
const projectId = (key: ProjectKey) => `p-${key.toLowerCase()}`;

const members: Member[] = MEMBER_SEEDS.map(({ key, name, title, tone }) => ({
  id: memberId(key),
  name,
  email: `${name.toLowerCase().replace(" ", ".")}@orbit.app`,
  title,
  tone,
}));

const projects: Project[] = PROJECT_SEEDS.map((seed) => ({
  id: projectId(seed.key),
  key: seed.key,
  name: seed.name,
  description: seed.description,
  status: seed.status,
  tone: seed.tone,
  ownerId: memberId(seed.owner),
  targetDate: seed.targetInDays === null ? null : shiftDate(WORKSPACE_TODAY, seed.targetInDays),
  createdAt: stamp(seed.createdDaysAgo, 10),
  archivedAt: seed.archivedDaysAgo === null ? null : stamp(seed.archivedDaysAgo, 16),
}));

const projectByKey = new Map(PROJECT_SEEDS.map((seed) => [seed.key, seed]));
const taskCounters = new Map<ProjectKey, number>();

const tasks: Task[] = TASK_SEEDS.map(([projectKey, title, status, priority, assignee, due, labels, age], index) => {
  const number = (taskCounters.get(projectKey) ?? 0) + 1;
  taskCounters.set(projectKey, number);

  const hour = 9 + (index % 8);
  const completedDaysAgo = status === "done" ? Math.floor(age / 2) : null;
  const updatedDaysAgo = completedDaysAgo ?? Math.floor(age / 3);

  return {
    id: `task-${projectKey.toLowerCase()}-${number}`,
    projectId: projectId(projectKey),
    number,
    title,
    description: `${title}. ${LABEL_NOTE[labels[0]]}`,
    status,
    priority,
    assigneeId: assignee === null ? null : memberId(assignee),
    labels,
    dueDate: due === null ? null : shiftDate(WORKSPACE_TODAY, due),
    createdAt: stamp(age, hour),
    updatedAt: stamp(updatedDaysAgo, hour, 20),
    completedAt: completedDaysAgo === null ? null : stamp(completedDaysAgo, hour, 40),
  };
});

const activity: ActivityEvent[] = [];

for (const seed of PROJECT_SEEDS) {
  const owner = memberId(seed.owner);
  const base = { projectId: projectId(seed.key), projectName: seed.name, actorId: owner };
  activity.push({ id: `evt-p-${seed.key}-created`, type: "project.created", at: stamp(seed.createdDaysAgo, 10), ...base });
  if (seed.archivedDaysAgo !== null) {
    activity.push({
      id: `evt-p-${seed.key}-archived`,
      type: "project.archived",
      at: stamp(seed.archivedDaysAgo, 16),
      archived: true,
      ...base,
    });
  }
}

tasks.forEach((task, index) => {
  const seed = TASK_SEEDS[index];
  const [, , status, priority, , , , age] = seed;
  const hour = 9 + (index % 8);
  const base = { taskId: task.id, taskTitle: task.title, projectId: task.projectId };
  const creator = task.assigneeId ?? projects.find((project) => project.id === task.projectId)?.ownerId ?? "";

  activity.push({ id: `evt-${task.id}-created`, type: "task.created", at: task.createdAt, actorId: creator, ...base });

  if (task.assigneeId !== null) {
    activity.push({
      id: `evt-${task.id}-assigned`,
      type: "task.assigned",
      at: stamp(age, hour, 30),
      actorId: creator,
      assigneeId: task.assigneeId,
      ...base,
    });
  }

  if (status !== "backlog") {
    activity.push({
      id: `evt-${task.id}-status`,
      type: "task.status_changed",
      at: task.completedAt ?? task.updatedAt,
      actorId: task.assigneeId ?? creator,
      from: "backlog",
      to: status,
      ...base,
    });
  }

  if (priority === "urgent") {
    activity.push({
      id: `evt-${task.id}-priority`,
      type: "task.priority_changed",
      at: stamp(age, hour, 45),
      actorId: creator,
      from: "high",
      to: "urgent",
      ...base,
    });
  }
});

activity.sort((a, b) => b.at.localeCompare(a.at));

const DEFAULT_PREFERENCES: Preferences = {
  activeWorkspaceId: "ws-orbit",
  defaultView: "dashboard",
  density: "comfortable",
  sidebarCollapsed: false,
  notifications: {
    assignments: true,
    dueSoon: true,
    projectUpdates: true,
    weeklyDigest: false,
  },
};

/** Read-only seed. Client state starts from this and never mutates it. */
export const SEED_WORKSPACE_STATE: WorkspaceState = {
  currentMemberId: memberId("maya"),
  workspaces: [
    { id: "ws-orbit", name: "Orbit Labs", plan: "Team" },
    { id: "ws-northwind", name: "Northwind Studio", plan: "Free" },
    { id: "ws-personal", name: "Personal", plan: "Free" },
  ],
  members,
  projects,
  tasks,
  activity,
  preferences: DEFAULT_PREFERENCES,
};
