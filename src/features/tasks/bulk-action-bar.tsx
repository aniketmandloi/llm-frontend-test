"use client";

import { ChevronDown, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MemberAvatar } from "@/components/common/member-avatar";
import { PriorityIcon } from "@/components/common/priority-icon";
import { StatusIcon } from "@/components/common/status-icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { PRIORITY_META, STATUS_META } from "@/domain/meta";
import { TASK_PRIORITIES, TASK_STATUSES, type TaskPatch } from "@/domain/types";
import { formatCount } from "@/lib/format";
import { useWorkspaceState, workspaceActions } from "@/store/workspace-store";

interface BulkActionBarProps {
  taskIds: string[];
  onClear: () => void;
}

export function BulkActionBar({ taskIds, onClear }: BulkActionBarProps) {
  const { members } = useWorkspaceState();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const count = taskIds.length;

  if (count === 0) return null;

  const apply = (patch: TaskPatch, message: string) => {
    workspaceActions.updateTasks(taskIds, patch);
    toast.success(`${message} on ${formatCount(count, "task")}`);
  };

  const onDelete = () => {
    workspaceActions.deleteTasks(taskIds);
    toast.success(`Deleted ${formatCount(count, "task")}`);
    onClear();
  };

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className="fixed inset-x-0 bottom-4 z-30 mx-auto flex w-fit max-w-[calc(100vw-2rem)] flex-wrap items-center gap-1 rounded-xl border bg-popover px-2 py-1.5 shadow-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
    >
      <span className="px-2 text-sm font-medium tabular-nums">{count} selected</span>
      <Separator orientation="vertical" className="mx-1 h-5" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            Status
            <ChevronDown aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-44">
          {TASK_STATUSES.map((status) => (
            <DropdownMenuItem key={status} onSelect={() => apply({ status }, `Moved to ${STATUS_META[status].label}`)}>
              <StatusIcon status={status} />
              {STATUS_META[status].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            Priority
            <ChevronDown aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-44">
          {TASK_PRIORITIES.map((priority) => (
            <DropdownMenuItem
              key={priority}
              onSelect={() => apply({ priority }, `Set priority to ${PRIORITY_META[priority].label}`)}
            >
              <PriorityIcon priority={priority} />
              {PRIORITY_META[priority].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            Assign
            <ChevronDown aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-56">
          <DropdownMenuItem onSelect={() => apply({ assigneeId: null }, "Unassigned")}>
            <MemberAvatar member={null} size="xs" />
            Unassigned
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {members.map((member) => (
            <DropdownMenuItem
              key={member.id}
              onSelect={() => apply({ assigneeId: member.id }, `Assigned to ${member.name}`)}
            >
              <MemberAvatar member={member} size="xs" />
              {member.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)}>
        <Trash2 aria-hidden />
        Delete
      </Button>

      <Button variant="ghost" size="icon-sm" onClick={onClear} aria-label="Clear selection">
        <X aria-hidden />
      </Button>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {formatCount(count, "task")}?</AlertDialogTitle>
            <AlertDialogDescription>
              The selected tasks will be removed from every view. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
