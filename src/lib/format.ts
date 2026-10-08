import { format, parseISO } from "date-fns";
import { dayDiff, toCalendarDate } from "@/domain/calendar";
import type { CalendarDate, Timestamp } from "@/domain/types";

export function formatCalendarDate(date: CalendarDate): string {
  return format(parseISO(date), "MMM d");
}

export function formatFullDate(date: CalendarDate): string {
  return format(parseISO(date), "EEE, MMM d, yyyy");
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
  return format(parseISO(timestamp), "EEEE, MMM d");
}

export function formatTime(timestamp: Timestamp): string {
  return format(parseISO(timestamp), "HH:mm");
}

export function formatCount(value: number, singular: string, plural = `${singular}s`): string {
  return `${value} ${value === 1 ? singular : plural}`;
}
