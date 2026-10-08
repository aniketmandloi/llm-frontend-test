import { MemberAvatar } from "@/components/common/member-avatar";
import { WORKSPACE_TODAY } from "@/data/clock";
import { describeActivity } from "@/domain/activity";
import type { ActivityEvent, Member } from "@/domain/types";
import { formatDayHeading, formatTime } from "@/lib/format";

interface ActivityFeedProps {
  events: readonly ActivityEvent[];
  membersById: ReadonlyMap<string, Member>;
  emptyMessage?: string;
}

/** Events arrive newest first. Consecutive events on the same day share one heading. */
export function ActivityFeed({ events, membersById, emptyMessage = "No activity yet." }: ActivityFeedProps) {
  if (events.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const groups: { heading: string; events: ActivityEvent[] }[] = [];
  for (const event of events) {
    const heading = formatDayHeading(event.at, WORKSPACE_TODAY);
    const last = groups.at(-1);
    if (last && last.heading === heading) {
      last.events.push(event);
    } else {
      groups.push({ heading, events: [event] });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.heading} aria-label={group.heading} className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">{group.heading}</h3>
          <ol className="divide-y rounded-xl border bg-card">
            {group.events.map((event) => {
              const actor = membersById.get(event.actorId);
              return (
                <li key={event.id} className="flex items-start gap-3 px-4 py-3">
                  <MemberAvatar member={actor} size="sm" className="mt-0.5" />
                  <div className="min-w-0 flex-1 text-sm leading-relaxed">
                    <span className="font-medium">{actor?.name ?? "Someone"}</span>{" "}
                    <span className="text-muted-foreground">{describeActivity(event, membersById)}</span>
                  </div>
                  <time dateTime={event.at} className="shrink-0 pt-0.5 text-xs text-muted-foreground tabular-nums">
                    {formatTime(event.at)}
                  </time>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
