"use client";

import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { taskFormSchema } from "@/domain/schemas";
import type { TaskStatus } from "@/domain/types";
import { workspaceActions } from "@/store/workspace-store";

interface QuickAddTaskProps {
  status: TaskStatus;
  projectId: string | undefined;
}

/** Creates a task in one column without opening the full sheet. Uses the same schema as the sheet. */
export function QuickAddTask({ status, projectId }: QuickAddTaskProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setTitle("");
    setError(null);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = taskFormSchema.safeParse({
      title,
      description: "",
      projectId: projectId ?? "",
      status,
      priority: "none",
      assigneeId: null,
      labels: [],
      dueDate: null,
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Check the task title.");
      return;
    }
    workspaceActions.createTask(result.data);
    setTitle("");
    setError(null);
  };

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground"
        disabled={projectId === undefined}
        onClick={() => setOpen(true)}
      >
        <Plus aria-hidden />
        New task
      </Button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-1.5 rounded-lg border bg-card p-2">
      <Input
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") close();
        }}
        placeholder="Task title"
        aria-label="Task title"
        aria-invalid={error !== null}
        className="h-8"
      />
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
      <div className="flex items-center justify-end gap-1.5">
        <Button type="button" variant="ghost" size="xs" onClick={close}>
          Cancel
        </Button>
        <Button type="submit" size="xs">
          Add task
        </Button>
      </div>
    </form>
  );
}
