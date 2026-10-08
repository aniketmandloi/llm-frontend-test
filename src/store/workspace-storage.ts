import { workspaceStateSchema } from "@/domain/schemas";
import type { WorkspaceState } from "@/domain/types";
import { readStorage, writeStorage } from "@/lib/storage";

/** Bump the version when the persisted shape changes; old payloads are then ignored. */
const STORAGE_KEY = "orbit:workspace:v1";

export function loadPersistedState(): WorkspaceState | null {
  const raw = readStorage(STORAGE_KEY);
  if (raw === null) return null;

  try {
    const result = workspaceStateSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function persistState(state: WorkspaceState): void {
  writeStorage(STORAGE_KEY, JSON.stringify(state));
}
