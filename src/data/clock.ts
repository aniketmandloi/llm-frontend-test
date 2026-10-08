import type { CalendarDate } from "@/domain/types";

/**
 * The workspace's notion of "today". Seeded data is written relative to this
 * date, so overdue and deadline indicators stay stable instead of drifting
 * with the machine clock.
 */
export const WORKSPACE_TODAY: CalendarDate = "2026-10-09";
