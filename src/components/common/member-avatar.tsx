import { UserRound } from "lucide-react";
import type { Member } from "@/domain/types";
import { cn } from "@/lib/utils";
import { TONE_CLASSES } from "./tone";

const SIZE_CLASSES = {
  xs: "size-5 text-[0.6rem]",
  sm: "size-6 text-[0.7rem]",
  md: "size-8 text-xs",
} as const;

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

export function MemberAvatar({
  member,
  size = "sm",
  className,
}: {
  member: Member | null | undefined;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  if (!member) {
    return (
      <span
        role="img"
        aria-label="Unassigned"
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground",
          SIZE_CLASSES[size],
          className,
        )}
      >
        <UserRound className="size-[55%]" aria-hidden />
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={member.name}
      title={member.name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium select-none",
        TONE_CLASSES[member.tone].avatar,
        SIZE_CLASSES[size],
        className,
      )}
    >
      {initialsOf(member.name)}
    </span>
  );
}
