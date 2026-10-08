"use client";

import { Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { liveProjects } from "@/domain/stats";
import { taskFormSchema, type TaskFormValues } from "@/domain/schemas";
import type { Task, TaskPatch, TaskStatus } from "@/domain/types";
import { workspaceActions, useWorkspaceState } from "@/store/workspace-store";
import {
  AssigneeSelect,
  DueDateInput,
  LabelPicker,
  PrioritySelect,
  ProjectSelect,
  StatusSelect,
} from "./task-fields";

type FieldErrors = Partial<Record<keyof TaskFormValues, string[]>>;

type TaskFormProps =
  | { mode: "create"; defaults?: { projectId?: string; status?: TaskStatus }; onDone: () => void }
  | { mode: "edit"; task: Task; onDone: () => void };

export function TaskForm(props: TaskFormProps) {
  const { projects, members } = useWorkspaceState();
  const availableProjects = liveProjects(projects);
  const [values, setValues] = useState<TaskFormValues>(() =>
    props.mode === "edit" ? fromTask(props.task) : emptyValues(props.defaults, availableProjects[0]?.id ?? ""),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const update = <K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = taskFormSchema.safeParse(values);
    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors);
      return;
    }
    setErrors({});

    if (props.mode === "create") {
      workspaceActions.createTask(result.data);
      toast.success("Task created", { description: result.data.title });
      props.onDone();
      return;
    }

    const patch = diffTask(props.task, result.data);
    if (Object.keys(patch).length > 0) {
      workspaceActions.updateTasks([props.task.id], patch);
      toast.success("Task saved");
    }
    props.onDone();
  };

  const onDelete = () => {
    if (props.mode !== "edit") return;
    workspaceActions.deleteTasks([props.task.id]);
    toast.success("Task deleted", { description: props.task.title });
    props.onDone();
  };

  const titleError = errors.title?.[0];
  const projectError = errors.projectId?.[0];

  return (
    <>
      <form id="task-form" onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <FormField id="task-title" label="Title" error={titleError} className="space-y-1.5">
            <Input
              id="task-title"
              autoFocus
              value={values.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="What needs doing?"
              aria-invalid={titleError !== undefined}
              className="h-auto border-0 px-0 text-lg font-semibold shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
          </FormField>

          <FormField id="task-description" label="Description">
            <Textarea
              id="task-description"
              rows={5}
              value={values.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Add context, links or acceptance criteria."
              className="resize-y"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
            {props.mode === "create" ? (
              <FormField id="task-project" label="Project" error={projectError}>
                <ProjectSelect
                  id="task-project"
                  value={values.projectId}
                  projects={availableProjects}
                  onChange={(projectId) => update("projectId", projectId)}
                />
              </FormField>
            ) : null}
            <FormField id="task-status" label="Status">
              <StatusSelect id="task-status" value={values.status} onChange={(status) => update("status", status)} />
            </FormField>
            <FormField id="task-priority" label="Priority">
              <PrioritySelect
                id="task-priority"
                value={values.priority}
                onChange={(priority) => update("priority", priority)}
              />
            </FormField>
            <FormField id="task-assignee" label="Assignee">
              <AssigneeSelect
                id="task-assignee"
                value={values.assigneeId}
                members={members}
                onChange={(assigneeId) => update("assigneeId", assigneeId)}
              />
            </FormField>
            <FormField id="task-due" label="Due date">
              <DueDateInput id="task-due" value={values.dueDate} onChange={(dueDate) => update("dueDate", dueDate)} />
            </FormField>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Labels</span>
            <LabelPicker value={values.labels} onChange={(labels) => update("labels", labels)} />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t px-6 py-4">
          {props.mode === "edit" ? (
            <Button type="button" variant="ghost" className="text-destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 aria-hidden />
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={props.onDone}>
              Cancel
            </Button>
            <Button type="submit">{props.mode === "create" ? "Create task" : "Save changes"}</Button>
          </div>
        </div>
      </form>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              The task and its place in the activity feed will be removed. You can recreate it, but this cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDelete}>
              Delete task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function emptyValues(defaults: { projectId?: string; status?: TaskStatus } | undefined, fallbackProjectId: string): TaskFormValues {
  return {
    title: "",
    description: "",
    projectId: defaults?.projectId ?? fallbackProjectId,
    status: defaults?.status ?? "todo",
    priority: "none",
    assigneeId: null,
    labels: [],
    dueDate: null,
  };
}

function fromTask(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description,
    projectId: task.projectId,
    status: task.status,
    priority: task.priority,
    assigneeId: task.assigneeId,
    labels: task.labels,
    dueDate: task.dueDate,
  };
}

/** Only fields that changed become part of the patch, so the activity feed records real edits. */
function diffTask(task: Task, next: TaskFormValues): TaskPatch {
  const patch: TaskPatch = {};
  if (next.title !== task.title) patch.title = next.title;
  if (next.description !== task.description) patch.description = next.description;
  if (next.status !== task.status) patch.status = next.status;
  if (next.priority !== task.priority) patch.priority = next.priority;
  if (next.assigneeId !== task.assigneeId) patch.assigneeId = next.assigneeId;
  if (next.dueDate !== task.dueDate) patch.dueDate = next.dueDate;
  if ([...next.labels].sort().join() !== [...task.labels].sort().join()) patch.labels = next.labels;
  return patch;
}
