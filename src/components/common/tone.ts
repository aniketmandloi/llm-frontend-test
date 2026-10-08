import type { ProjectTone } from "@/domain/types";

/** Tailwind classes for each project and member tone. Kept literal so Tailwind can detect them. */
export const TONE_CLASSES: Record<ProjectTone, { dot: string; avatar: string; soft: string }> = {
  blue: {
    dot: "bg-blue-500",
    avatar: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    soft: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  emerald: {
    dot: "bg-emerald-500",
    avatar: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    soft: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  amber: {
    dot: "bg-amber-500",
    avatar: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    soft: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  rose: {
    dot: "bg-rose-500",
    avatar: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    soft: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
  violet: {
    dot: "bg-violet-500",
    avatar: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    soft: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  slate: {
    dot: "bg-slate-500",
    avatar: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
    soft: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  },
};

/** Hex values for charts, where Tailwind classes cannot be used. */
export const TONE_HEX: Record<ProjectTone, string> = {
  blue: "#3b82f6",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  violet: "#8b5cf6",
  slate: "#64748b",
};
