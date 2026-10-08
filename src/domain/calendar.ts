import type { CalendarDate, Timestamp } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function shiftDate(date: CalendarDate, days: number): CalendarDate {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

export function dayDiff(from: CalendarDate, to: CalendarDate): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

export function toCalendarDate(timestamp: Timestamp): CalendarDate {
  return timestamp.slice(0, 10);
}
