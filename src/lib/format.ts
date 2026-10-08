import { dayDiff, toCalendarDate } from "@/domain/calendar";
import type { CalendarDate, Timestamp } from "@/domain/types";

/*
 * Every formatter pins the UTC zone and the en-US locale. The seed and the
 * workspace date are UTC calendars, and server and client must render the
 * same text during hydration regardless of the machine's timezone.
 */

const SHORT_DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const FULL_DATE = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const DAY_HEADING = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const CLOCK = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });

function calendarToDate(date: CalendarDate): Date {
  return new Date(`${date}T00:00:00Z`);
}

export function formatCalendarDate(date: CalendarDate): string {
  return SHORT_DATE.format(calendarToDate(date));
}

export function formatFullDate(date: CalendarDate): string {
  return FULL_DATE.format(calendarToDate(date));
}

/** "Today", "Tomorrow", "Yesterday", otherwise "Oct 14". Relative to the workspace date. */
export function formatDueLabel(date: CalendarDate, today: CalendarDate): string {
  const diff = dayDiff(today, date);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return formatCalendarDate(date);
}

export function formatDayHeading(timestamp: Timestamp, today: CalendarDate): string {
  const diff = dayDiff(toCalendarDate(timestamp), today);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return DAY_HEADING.format(new Date(timestamp));
}

export function formatTime(timestamp: Timestamp): string {
  return `${CLOCK.format(new Date(timestamp))} UTC`;
}

export function formatCount(value: number, singular: string, plural = `${singular}s`): string {
  return `${value} ${value === 1 ? singular : plural}`;
}
