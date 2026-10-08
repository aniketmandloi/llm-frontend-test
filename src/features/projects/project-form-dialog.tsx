"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { FormField } from "@/components/common/form-field";
import { TONE_CLASSES } from "@/components/common/tone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PROJECT_STATUS_META } from "@/domain/meta";
import { projectFormSchema, type ProjectFormValues } from "@/domain/schemas";
import { PROJECT_STATUSES, PROJECT_TONES, type Project, type ProjectStatus, type ProjectTone } from "@/domain/types";
import { asOption } from "@/lib/options";
import { workspaceActions, useWorkspaceState } from "@/store/workspace-store";

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to create a project. */
  project?: Project;
}

export function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
          <DialogDescription>
            {project
              ? "Update how this project is described and tracked."
              : "Projects group tasks and track progress toward a target date."}
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the form starts from the current project each time. */}
        {open ? <ProjectForm project={project} onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

type ProjectFieldErrors = Partial<Record<keyof ProjectFormValues, string[]>>;

function ProjectForm({ project, onDone }: { project?: Project; onDone: () => void }) {
  const { projects } = useWorkspaceState();
  const [values, setValues] = useState<ProjectFormValues>(() =>
    project
      ? {
          name: project.name,
          key: project.key,
          description: project.description,
          status: project.status,
          tone: project.tone,
          targetDate: project.targetDate,
        }
      : { name: "", key: "", description: "", status: "planning", tone: "blue", targetDate: null },
  );
  const [errors, setErrors] = useState<ProjectFieldErrors>({});

  const update = <K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = projectFormSchema.safeParse(values);
    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    const keyTaken = projects.some((item) => item.key === result.data.key && item.id !== project?.id);
    if (keyTaken) {
      setErrors({ key: ["Another project already uses this key."] });
      return;
    }
    setErrors({});

    if (project) {
      workspaceActions.updateProject(project.id, result.data);
      toast.success("Project saved");
    } else {
      workspaceActions.createProject(result.data);
      toast.success("Project created", { description: result.data.name });
    }
    onDone();
  };

  const nameError = errors.name?.[0];
  const keyError = errors.key?.[0];
  const targetError = errors.targetDate?.[0];

  return (
    <form id="project-form" onSubmit={onSubmit} className="flex flex-col gap-5">
      <FormField id="project-name" label="Name" error={nameError}>
        <Input
          id="project-name"
          autoFocus
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          placeholder="Marketing site redesign"
          aria-invalid={nameError !== undefined}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[8rem_1fr]">
        <FormField
          id="project-key"
          label="Key"
          error={keyError}
        >
          <Input
            id="project-key"
            value={values.key}
            onChange={(event) => update("key", event.target.value.toUpperCase())}
            placeholder="WEB"
            maxLength={5}
            disabled={project !== undefined}
            aria-invalid={keyError !== undefined}
            className="font-mono uppercase"
          />
        </FormField>
        <FormField id="project-description" label="Description">
          <Textarea
            id="project-description"
            rows={3}
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="What is this project for?"
            className="resize-none"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="project-status" label="Status">
          <Select
            value={values.status}
            onValueChange={(next) => {
              const status = asOption(PROJECT_STATUSES, next);
              if (status) update("status", status);
            }}
          >
            <SelectTrigger id="project-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUSES.map((status: ProjectStatus) => (
                <SelectItem key={status} value={status}>
                  {PROJECT_STATUS_META[status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField id="project-target" label="Target date" error={targetError}>
          <Input
            id="project-target"
            type="date"
            value={values.targetDate ?? ""}
            onChange={(event) => update("targetDate", event.target.value === "" ? null : event.target.value)}
          />
        </FormField>
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Colour</span>
        <ToggleGroup
          type="single"
          variant="outline"
          value={values.tone}
          onValueChange={(next) => {
            const tone = asOption(PROJECT_TONES, next);
            if (tone) update("tone", tone);
          }}
          aria-label="Project colour"
          className="justify-start"
        >
          {PROJECT_TONES.map((tone: ProjectTone) => (
            <ToggleGroupItem key={tone} value={tone} aria-label={tone} className="size-8 p-0">
              <span aria-hidden className={`size-3 rounded-full ${TONE_CLASSES[tone].dot}`} />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <DialogFooter className="gap-2 sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {project ? "The key stays fixed so task codes do not change." : "Keys are 2 to 5 letters and appear in task codes."}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit">{project ? "Save changes" : "Create project"}</Button>
        </div>
      </DialogFooter>
    </form>
  );
}
