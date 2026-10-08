import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  hint,
  emphasis = false,
  children,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  emphasis?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="group flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-5 shadow-xs transition-[transform,box-shadow,border-color] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-md">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-display text-4xl leading-none tracking-tight tabular-nums transition-colors duration-300",
          emphasis && "text-ember",
        )}
      >
        {value}
      </span>
      {children}
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}
