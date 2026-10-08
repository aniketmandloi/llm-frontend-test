# Engineering notes

These notes cover the decisions behind the code and what is knowingly left out. The code has been written and reviewed by reading it. It has not been built, type-checked, linted, tested or run in a browser.

## Architecture

**Routes are thin; features own the UI.** Each `app/` route renders one feature view. Feature views are client components because they read client state. Server components are used only where they add something: the root layout, `generateStaticParams` for project pages, and metadata.

**One external store, two layers.** Workspace data and preferences live in one store (`src/store/workspace-store.ts`), built on `useSyncExternalStore`. The store holds a single module-level state object. Components read it through `useWorkspaceState()` and write through `workspaceActions`. There is no context provider for data, so there is no re-render cascade from a provider value changing.

**The reducer is pure and owns activity.** `workspace-reducer.ts` takes an action and returns the next state. Every change a user can see in the activity feed is recorded by the reducer itself, from the same diff that produced the change. The feed cannot disagree with the data. Actions carry an `actionId` and a timestamp, so the reducer stays deterministic and testable.

**Derived values come from selectors, never from copies.** Counts, progress, overdue state, dashboard stats and chart series are computed in `src/domain/` from the store. No view keeps its own copy of a count. Aggregates use one scope rule, `liveProjects`, so archived projects are excluded everywhere.

**Shared task logic.** `useTaskView` holds filter, sort and scope state. The Tasks page, the project page and the board all use it, and `filterTasks` and `sortTasks` are the only implementations.

## Hydration and persistence

- The seed is the server snapshot. Server-rendered HTML and the first client render are identical. Persisted state is read only after hydration, through `useSyncExternalStore`. There is no `useEffect` that copies localStorage into state.
- Persisted payloads are validated with Zod. A payload that fails validation, or a JSON parse error, is ignored and the seed is used. The next save overwrites the bad payload.
- Storage access goes through `lib/storage.ts`, which catches exceptions from blocked or full storage. The app keeps working in memory.
- All dates and times are formatted in UTC with a fixed locale (`lib/format.ts`). Server and client produce the same text regardless of the machine's timezone. The seed is a UTC calendar, so this is also the only correct display.

## Forms and validation

Forms use controlled state and Zod `safeParse` on submit instead of a form library. There are three forms (task, project and profile), and each one is small enough that a library would add more than it removes. The schemas live in `domain/schemas.ts` and are shared by the task sheet and the quick-add control, so the rules for a valid task are written once.

Task edits send a patch containing only the fields that changed (`diffTask`). The activity feed therefore records real edits, not every field on save.

## Drag and drop

`@dnd-kit/core` provides pointer, touch and keyboard sensors. Columns are droppable with the status as the id, and cards are draggable. Dropping on a column dispatches one `updateTasks` call and one activity event. Each card also has a menu that moves it by status. This is the non-drag path, and it is the one the keyboard and screen-reader paths rely on as well.

The drag overlay renders the same presentational card as the column, so the dragged card looks like the card it came from. The dragged original is dimmed.

## Keyboard and accessibility

- Global shortcuts ignore keystrokes that come from text inputs and are suspended while a dialog or sheet is open, so they cannot act behind a modal.
- The task list supports arrow-key movement between rows, Enter to open, and Space to toggle selection. Controls inside a row stop click propagation, because Radix portals bubble React events through the row.
- Sortable headers expose `aria-sort`. Icon-only buttons have labels. Status and priority icons carry accessible names.
- Bulk actions only apply to selected rows that are visible, so a filter cannot hide a target.

## Choices made

- **Next.js 16.4 with `cacheComponents` on.** This was the scaffold default. The app reads no request-time data in server components, so prerendering should work without Suspense boundaries. This is the setting most likely to need attention on the first build.
- **TypeScript 5.9, not 7.** The brief asks for stable, compatible versions, and Next's toolchain targets 5.x.
- **Tailwind v4 with shadcn's Nova preset.** Neutral base colours. Five chart tokens carry the only colour in the interface, and project and member tones are used sparingly as dots and avatars.
- **`next-themes`** for the theme. It sets the class before first paint, so there is no flash of the wrong theme.
- **`recharts` through shadcn's chart wrapper.** It reads its colours from the same CSS variables as the rest of the UI.
- **`cmdk` through shadcn's command.** The palette uses it for keyboard movement only. Filtering is done by the palette, so results can be capped and grouped. The built-in filter cannot do that.
- **`sonner`** for feedback after actions. Archive is reversible, so it uses an Undo action rather than a confirmation dialog.
- **Native date inputs** for due dates and project target dates. They are accessible, need no extra dependency, and show the platform's picker.

## Dependency list

Runtime: `radix-ui`, `lucide-react`, `zod`, `@dnd-kit/core`, `@dnd-kit/utilities`, `recharts`, `cmdk`, `next-themes`, `sonner`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`.

Dev: `shadcn` (CLI, and the `shadcn/tailwind.css` variant definitions that the generated components import), plus the Next, Tailwind, TypeScript and ESLint toolchain from the scaffold.

Dates use the platform `Intl` API, pinned to UTC and en-US (`lib/format.ts`), and calendar-date arithmetic is UTC millisecond maths in `domain/calendar.ts`. Neither needs a date library.

## Known limitations

- **The clock is fixed.** "Today" is `2026-10-09` (`src/data/clock.ts`). Overdue and deadline indicators are correct for the demo data. Real-world use would need a clock source, and that would have to be a deliberate choice because it changes what the seed means.
- **Activity timestamps use the real clock.** Actions record `new Date()`, which is after the fixed workspace date when the machine's date is later than 9 October 2026. Those events sort correctly, but the day headings and "completed this week" counts are computed against the fixed date, so very recent changes may not yet count toward the week.
- **Workspaces are labels.** The switcher changes the active workspace and shows a toast explaining that the demo workspaces share one dataset. Each workspace does not have its own projects.
- **Single browser, single user.** localStorage is per origin and per browser. Two tabs do not sync. Edits in one tab are not picked up by another until a reload.
- **No undo** for edits, deletes or bulk actions, except archive. Reset demo data is the only way back.
- **Limited testing surface.** Nothing has been run. The first `npm run dev` will show any type or runtime errors, and it is the first real check on the drag-and-drop, the Radix portal event handling, and the charts.
- **Notifications are simulated.** The toggles persist preferences. Nothing is sent.
- **Large seed-dependent views.** Filtering and sorting run on every change. That is fine for 69 tasks and would need memoised indexes or virtualisation for thousands.

## Intentionally omitted

Authentication, real users and permissions, multi-user sync and presence, comments on tasks, attachments, recurring tasks, time tracking, email and push delivery, import and export, a real search index, offline support, internationalisation, and automated tests (per the brief).
