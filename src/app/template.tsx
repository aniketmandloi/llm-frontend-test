import type { ReactNode } from "react";

/** A template re-mounts on every navigation, so each page gets the enter motion once. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-enter flex min-w-0 flex-1 flex-col">{children}</div>;
}
