import { CircleCheck, CircleDashed, CircleDot, CircleDotDashed, Circle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_META } from "@/domain/meta";
import type { TaskStatus } from "@/domain/types";

const STATUS_ICON: Record<TaskStatus, { icon: LucideIcon; className: string }> = {
  backlog: { icon: CircleDashed, className: "text-muted-foreground" },
  todo: { icon: Circle, className: "text-muted-foreground" },
  in_progress: { icon: CircleDotDashed, className: "text-amber-500" },
  in_review: { icon: CircleDot, className: "text-violet-500" },
  done: { icon: CircleCheck, className: "text-emerald-600 dark:text-emerald-500" },
};

export function StatusIcon({ status, className }: { status: TaskStatus; className?: string }) {
  const { icon: Icon, className: tone } = STATUS_ICON[status];
  return <Icon aria-label={STATUS_META[status].label} role="img" className={cn("size-4 shrink-0", tone, className)} />;
}
