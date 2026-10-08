import { toast } from "sonner";
import type { Project } from "@/domain/types";
import { workspaceActions } from "@/store/workspace-store";

/** Archiving is reversible, so the confirmation is an Undo action on the toast instead of a dialog. */
export function setProjectArchived(project: Project, archived: boolean): void {
  workspaceActions.setProjectArchived(project.id, archived);

  if (archived) {
    toast.success(`Archived ${project.name}`, {
      action: {
        label: "Undo",
        onClick: () => workspaceActions.setProjectArchived(project.id, false),
      },
    });
    return;
  }

  toast.success(`Restored ${project.name}`);
}
