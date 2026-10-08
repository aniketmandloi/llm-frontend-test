"use client";

import { MemberAvatar } from "@/components/common/member-avatar";
import { PriorityIcon } from "@/components/common/priority-icon";
import { StatusIcon } from "@/components/common/status-icon";
import { TONE_CLASSES } from "@/components/common/tone";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LABEL_META, PRIORITY_META, STATUS_META } from "@/domain/meta";
import {
  TASK_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Member,
  type Project,
  type TaskLabel,
  type TaskPriority,
  type TaskStatus,
} from "@/domain/types";
import { asOption } from "@/lib/options";
import { cn } from "@/lib/utils";

export const UNASSIGNED_VALUE = "unassigned";

/** `inline` renders a borderless control for table rows; `field` renders a full-width form control. */
type FieldVariant = "field" | "inline";

const TRIGGER_CLASS: Record<FieldVariant, string> = {
  field: "w-full",
  inline: "h-7 w-auto min-w-0 border-transparent bg-transparent px-1.5 shadow-none hover:bg-muted",
};

export function StatusSelect({
  id,
  value,
  onChange,
  variant = "field",
}: {
  id: string;
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  variant?: FieldVariant;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        const status = asOption(TASK_STATUSES, next);
        if (status) onChange(status);
      }}
    >
      <SelectTrigger id={id} size={variant === "inline" ? "sm" : "default"} className={TRIGGER_CLASS[variant]} aria-label="Status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TASK_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            <StatusIcon status={status} />
            {STATUS_META[status].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function PrioritySelect({
  id,
  value,
  onChange,
  variant = "field",
}: {
  id: string;
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
  variant?: FieldVariant;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        const priority = asOption(TASK_PRIORITIES, next);
        if (priority) onChange(priority);
      }}
    >
      <SelectTrigger id={id} size={variant === "inline" ? "sm" : "default"} className={TRIGGER_CLASS[variant]} aria-label="Priority">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TASK_PRIORITIES.map((priority) => (
          <SelectItem key={priority} value={priority}>
            <PriorityIcon priority={priority} />
            {PRIORITY_META[priority].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AssigneeSelect({
  id,
  value,
  members,
  onChange,
  variant = "field",
}: {
  id: string;
  value: string | null;
  members: readonly Member[];
  onChange: (assigneeId: string | null) => void;
  variant?: FieldVariant;
}) {
  return (
    <Select
      value={value ?? UNASSIGNED_VALUE}
      onValueChange={(next) => {
        const member = members.find((item) => item.id === next);
        onChange(member ? member.id : null);
      }}
    >
      <SelectTrigger id={id} size={variant === "inline" ? "sm" : "default"} className={TRIGGER_CLASS[variant]} aria-label="Assignee">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGNED_VALUE}>
          <MemberAvatar member={null} size="xs" />
          Unassigned
        </SelectItem>
        {members.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            <MemberAvatar member={member} size="xs" />
            {member.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ProjectSelect({
  id,
  value,
  projects,
  onChange,
}: {
  id: string;
  value: string;
  projects: readonly Project[];
  onChange: (projectId: string) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        const project = projects.find((item) => item.id === next);
        if (project) onChange(project.id);
      }}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Choose a project" />
      </SelectTrigger>
      <SelectContent>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            <span aria-hidden className={cn("size-2 rounded-full", TONE_CLASSES[project.tone].dot)} />
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DueDateInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string | null;
  onChange: (date: string | null) => void;
}) {
  return (
    <Input
      id={id}
      type="date"
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value === "" ? null : event.target.value)}
      className="w-full"
    />
  );
}

export function LabelPicker({ value, onChange }: { value: TaskLabel[]; onChange: (labels: TaskLabel[]) => void }) {
  return (
    <ToggleGroup
      type="multiple"
      variant="outline"
      size="sm"
      value={value}
      onValueChange={(next) => onChange(next.flatMap((item) => asOption(TASK_LABELS, item) ?? []))}
      aria-label="Labels"
      className="flex-wrap justify-start"
    >
      {TASK_LABELS.map((label) => (
        <ToggleGroupItem key={label} value={label} className="h-7 px-2.5 text-xs">
          {LABEL_META[label].label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
