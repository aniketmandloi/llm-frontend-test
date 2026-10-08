"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTaskSheet } from "@/features/tasks/task-sheet-context";
import { workspaceActions } from "@/store/workspace-store";
import { NAV_ITEMS } from "./nav";

const G_PREFIX_TIMEOUT_MS = 1000;

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

/** Single-key shortcuts stay off while a dialog or sheet is open, so they cannot act behind it. */
function isDialogOpen(): boolean {
  return document.querySelector('[role="dialog"]') !== null;
}

/**
 * Global shortcuts. Mod+K toggles the palette. `c` creates a task, `[` toggles
 * the sidebar, and `g` followed by a letter navigates.
 */
export function KeyboardShortcuts({ onTogglePalette }: { onTogglePalette: () => void }) {
  const router = useRouter();
  const { openCreate } = useTaskSheet();

  useEffect(() => {
    let awaitingNavKey = false;
    let timeout: number | undefined;

    const clearPrefix = () => {
      awaitingNavKey = false;
      window.clearTimeout(timeout);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onTogglePalette();
        return;
      }

      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target) || isDialogOpen()) return;

      if (awaitingNavKey) {
        clearPrefix();
        const item = NAV_ITEMS.find((navItem) => navItem.shortcut === event.key);
        if (item) {
          event.preventDefault();
          router.push(item.href);
        }
        return;
      }

      if (event.key === "g") {
        awaitingNavKey = true;
        timeout = window.setTimeout(clearPrefix, G_PREFIX_TIMEOUT_MS);
        return;
      }

      if (event.key === "c") {
        event.preventDefault();
        openCreate();
      } else if (event.key === "[") {
        event.preventDefault();
        workspaceActions.toggleSidebar();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      clearPrefix();
    };
  }, [onTogglePalette, openCreate, router]);

  return null;
}
