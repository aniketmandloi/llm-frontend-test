import { Minus, SignalHigh, SignalLow, SignalMedium, TriangleAlert, type LucideIcon } from "lucide-react";
import { PRIORITY_META } from "@/domain/meta";
import type { TaskPriority } from "@/domain/types";
import { cn } from "@/lib/utils";

const PRIORITY_ICON: Record<TaskPriority, { icon: LucideIcon; className: string }> = {
  urgent: { icon: TriangleAlert, className: "text-red-600 dark:text-red-400" },
  high: { icon: SignalHigh, className: "text-foreground" },
  medium: { icon: SignalMedium, className: "text-foreground/70" },
  low: { icon: SignalLow, className: "text-muted-foreground" },
  none: { icon: Minus, className: "text-muted-foreground/60" },
};

export function PriorityIcon({
  priority,
  showLabel = false,
  className,
}: {
  priority: TaskPriority;
  showLabel?: boolean;
  className?: string;
}) {
  const { icon: Icon, className: tone } = PRIORITY_ICON[priority];
  const label = PRIORITY_META[priority].label;

  if (showLabel) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-sm", tone, className)}>
        <Icon aria-hidden className="size-3.5 shrink-0" />
        {label}
      </span>
    );
  }

  return <Icon aria-label={label} role="img" className={cn("size-4 shrink-0", tone, className)} />;
}
