# Orbit

A project management frontend built with Next.js (App Router), React, TypeScript, Tailwind CSS v4 and shadcn/ui. There is no backend. Data is seeded in code and changes are kept in client state and persisted to `localStorage`.

## Running it

Requirements: Node.js 20.9 or later (Node 24 is what the project was set up with) and npm.

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. The root redirects to the default view you choose in Settings (Dashboard unless changed).

Other scripts from `package.json`: `npm run build`, `npm run start` and `npm run lint`. They are not part of this handoff; the project has not been built or linted in the environment it was written in.

## What is in the app

- **Shell.** Collapsible sidebar with a workspace switcher and a project list, breadcrumbs, a top bar, a user menu with theme and demo reset, and a mobile navigation sheet.
- **Command palette** (Ctrl/Cmd+K). Searches pages, actions, projects and tasks. It also serves as global search.
- **Dashboard.** Key metrics, a 30-day completion chart, project progress, tasks assigned to you, overdue tasks, upcoming deadlines and recent activity.
- **Projects.** Grid and list views, search, status filter, sort, archived toggle, and create, edit and archive. Archiving shows an Undo toast. The detail page has metrics, a task list scoped to the project and its activity.
- **Tasks.** Search, multi-criteria filters (status, priority, assignee, label, project, overdue), sorting, inline status, priority and assignee controls, multi-select with bulk actions, and a task sheet for create, edit and delete.
- **Board.** Kanban with drag and drop (pointer, touch and keyboard), column counts, quick add, and a Move menu on every card as a non-drag alternative.
- **Analytics.** Date range (7, 30 or 90 days), productivity summary, completion trend, priority distribution, status distribution and project progress.
- **Activity.** Day-grouped feed with filters by type and project.
- **Settings.** Profile, appearance (theme and density), workspace (rename and default view) and notification toggles. Preferences persist in the browser.

## Keyboard shortcuts

| Keys | Action |
| --- | --- |
| Ctrl/Cmd + K | Open the command palette |
| `c` | Create a task |
| `[` | Collapse or expand the sidebar |
| `/` | Focus the search field on a task list or board |
| `g` then `d`, `p`, `b`, `t`, `a`, `v`, `s` | Go to Dashboard, Projects, Board, Tasks, Analytics, Activity, Settings |
| Arrow keys, Enter, Space (task list) | Move between rows, open a task, toggle selection |
| Space or Enter (board card) | Pick up a card, then arrow keys and Space or Enter to drop it |

Single-key shortcuts are ignored while typing and while a dialog is open.

## Demo data

The seed contains 8 members, 6 projects (one archived), and 69 tasks, with an activity history derived from them. The clock is fixed to 9 October 2026 so overdue and deadline indicators stay stable.

Changes persist in `localStorage` under `orbit:workspace:v1`. To go back to the seed, use **Reset demo data** in the user menu. Clearing site data does the same thing.

## Layout of the code

```
src/
  app/              Routes and layouts. Thin pages that render one feature view.
  features/         One folder per area: shell, dashboard, projects, tasks, board,
                    activity, analytics, settings
  domain/           Pure types, Zod schemas and selectors. No React.
  data/             Seed data and the workspace clock.
  store/            Pure reducer, storage adapter and external store.
  components/ui/    shadcn/ui primitives
  components/common Shared presentation pieces
  components/charts Shared chart components
  lib/              Formatting, storage access and small helpers
```

See `docs/implementation-plan.md` for the plan and `docs/engineering-notes.md` for the decisions and known limitations.
