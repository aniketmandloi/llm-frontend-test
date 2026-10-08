"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { TaskStatus } from "@/domain/types";
import { TaskSheet, type SheetTarget } from "./task-sheet";

interface TaskSheetApi {
  openCreate: (defaults?: { projectId?: string; status?: TaskStatus }) => void;
  openTask: (taskId: string) => void;
}

const TaskSheetContext = createContext<TaskSheetApi | null>(null);

interface SheetState {
  open: boolean;
  /** Kept after close so the sheet can animate out with its content still in place. */
  target: SheetTarget | null;
  /** Changes on every open so the form starts fresh, even when reopening the same task. */
  session: number;
}

/** Owns the create and edit sheet so any view, the palette or a shortcut can open it. */
export function TaskSheetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SheetState>({ open: false, target: null, session: 0 });

  const open = useCallback((target: SheetTarget) => {
    setState((current) => ({ open: true, target, session: current.session + 1 }));
  }, []);

  const onOpenChange = useCallback((next: boolean) => {
    setState((current) => ({ ...current, open: next }));
  }, []);

  const api = useMemo<TaskSheetApi>(
    () => ({
      openCreate: (defaults) => open({ kind: "create", ...defaults }),
      openTask: (taskId) => open({ kind: "edit", taskId }),
    }),
    [open],
  );

  return (
    <TaskSheetContext.Provider value={api}>
      {children}
      <TaskSheet
        open={state.open}
        target={state.target}
        session={state.session}
        onOpenChange={onOpenChange}
      />
    </TaskSheetContext.Provider>
  );
}

export function useTaskSheet(): TaskSheetApi {
  const api = useContext(TaskSheetContext);
  if (!api) {
    throw new Error("useTaskSheet must be used inside TaskSheetProvider");
  }
  return api;
}
