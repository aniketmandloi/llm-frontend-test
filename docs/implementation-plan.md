# Orbit — Implementation Plan

A frontend-only project management app. No backend: seeded mock data plus client-side state persisted to localStorage.

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript strict | Requested. Routes are thin server components; interactive trees are client components. |
| Styling | Tailwind CSS v4 + CSS variables for theme tokens | Requested. Tokens live on `:root` / `.dark` so light and dark share one component set. |
| Components | shadcn/ui on Radix (`radix-ui` unified package), Lucide icons | Requested. Components are copied into the repo and owned by it. |
| Validation | Zod | Validates persisted state on load and form input before mutation. |
| Drag and drop | `@dnd-kit/core` | Pointer, touch and keyboard sensors out of the box. |
| Charts | Recharts through shadcn `chart` | Standard pairing with shadcn; theme-aware through CSS variables. |
| Command palette | `cmdk` through shadcn `command` | Filtering and keyboard navigation are already correct. Also serves as global search. |
| Theme | `next-themes` | Avoids flash-of-wrong-theme with the App Router. |
| Dates | `date-fns` | Due-date math and relative labels without hand-rolled date code. |
| Feedback | `sonner` through shadcn | Confirms create, update, delete and archive actions. |

TypeScript stays on 5.x. Next's toolchain targets 5.x and the brief asks for stable, compatible versions.

## Architecture

```
src/
  app/                 Routes and layouts only. Thin server components.
  features/            One folder per feature: components, hooks, view-specific logic.
    shell/             Sidebar, topbar, breadcrumbs, workspace switcher, profile menu, command palette
    dashboard/
    projects/
    tasks/             Shared task logic: filter, sort, selection, task drawer, task form
    board/             Kanban (reuses tasks/ logic)
    analytics/
    activity/
    settings/
  domain/              Pure TypeScript: types, Zod schemas, selectors. No React imports.
  data/                Deterministic seed generator (members, projects, tasks, activity).
  store/               Reducer (pure), external store with useSyncExternalStore, localStorage adapter.
  components/ui/       shadcn primitives (generated, lightly adapted)
  components/common/   Shared composites: PageHeader, EmptyState, MemberAvatar, PriorityIcon, StatusIcon
  lib/                 cn(), date formatting, safe storage access
```

Pages in `app/` import one feature component each. Feature components own their local UI state.

## State ownership

- **Workspace data** (members, projects, tasks, activity) lives in one store. Every mutation goes through a pure reducer. The reducer also appends the matching activity event, so the feed cannot drift from the data.
- **Preferences** (profile, workspace, default view, notifications) are a second slice of the same store, persisted under its own storage key.
- **Theme** is owned by `next-themes`, not by the store.
- **Derived values** (counts, progress, overdue, chart series) are computed by selectors in `domain/`. No view stores a copy of a count.
- **Ephemeral UI state** (filters, selection, open drawer, dialog open state) lives in the component that renders it. Filters on the Tasks and Board views share one hook so the two views behave the same.
- The store uses `useSyncExternalStore` with the seed as the server snapshot. This avoids a hydration mismatch and avoids a `useEffect` that copies localStorage into state.

## Domain model

- `Member { id, name, email, role, initials, hue }`
- `Project { id, key, name, description, status, ownerId, color, targetDate, archived }`
  - `status`: `planning | active | at_risk | completed`
- `Task { id, projectId, number, title, description, status, priority, assigneeId, labels, dueDate, createdAt, updatedAt, completedAt }`
  - `status`: `backlog | todo | in_progress | in_review | done`
  - `priority`: `urgent | high | medium | low | none`
  - `labels`: fixed union of label keys
- `ActivityEvent` is a discriminated union on `type`: `task.created`, `task.status_changed`, `task.priority_changed`, `task.assigned`, `task.deleted`, `project.created`, `project.updated`, `project.archived`.

Dates are ISO strings in the store and parsed at the edge. Zod schemas in `domain/schemas.ts` validate localStorage payloads and form input.

## Derived data rules

- **Today** is a fixed constant (`2026-10-09`) in the seed module, so seeded data and overdue indicators are stable and do not depend on the machine clock. This is a known limitation, noted in the engineering notes.
- **Overdue**: `dueDate < today` and status is not `done`.
- **Progress**: done tasks divided by all non-deleted tasks in the project.
- **Completion trend**: tasks completed per bucket in the chosen date range, plus tasks created per bucket.

## Technically interesting interactions

1. **Kanban drag and drop.** Pointer, touch and keyboard sensors. Dropping a card on a column dispatches one status change and one activity event. Each card also has a menu to move it by status, for users who do not drag.
2. **Shared filter and selection logic.** Board and list views both use `domain/tasks` filter and sort functions. Selection is pruned when filters change so a bulk action never touches hidden rows.
3. **Command palette as global search.** Cmd/Ctrl+K opens cmdk over commands, projects and tasks. Shortcuts: `c` creates a task, `[` toggles the sidebar, `g` followed by a letter navigates.
4. **Persisted state without hydration mismatch.** The seed is the server snapshot. The client reads localStorage after hydration. Corrupt or outdated stored data fails Zod validation and falls back to the seed.

## Milestones

1. **Foundation.** Dependencies, configuration, theme tokens, shadcn primitives, domain types and schemas, seed generator, store.
2. **Shell.** Sidebar (collapsible), topbar, breadcrumbs, workspace switcher, profile menu, theme toggle, command palette, keyboard shortcuts.
3. **Tasks.** Shared task logic, list view with sort, filter, multi-select and bulk actions, task drawer for create, edit and delete.
4. **Projects.** Grid and list views, create and edit dialog, archive, filter and sort, project detail page.
5. **Board.** Kanban with drag and drop, column counts, quick add, mobile layout.
6. **Dashboard and activity.** Stat cards derived from store, overdue and assigned lists, deadlines, completion chart, project progress, activity feed.
7. **Analytics.** Date range selector, completion trend, priority distribution, project progress, productivity overview, status distribution.
8. **Settings.** Profile, appearance, workspace preferences, default view, notification toggles. All persisted.
9. **Documentation and self-review.** README, engineering notes, static review pass for types, hooks and accessibility.

## Commit approach

Small atomic commits, one per file where a change touches several files. Each commit is one logical step, so the branch reads as a sequence of small changes.

## Explicitly out of scope

Real authentication, multi-user sync, real-time collaboration, file attachments, comments on tasks, recurring tasks, email notifications, and server-side rendering of mutable data.
