"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DEFAULT_VIEW_META } from "@/domain/meta";
import { useWorkspaceState } from "@/store/workspace-store";

/** The default view is a client preference, so the redirect happens after mount. */
export default function HomePage() {
  const router = useRouter();
  const { preferences } = useWorkspaceState();

  useEffect(() => {
    router.replace(DEFAULT_VIEW_META[preferences.defaultView].href);
  }, [router, preferences.defaultView]);

  return null;
}
