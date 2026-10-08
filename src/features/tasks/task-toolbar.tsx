"use client";

import { ArrowDown, ArrowUp, ListFilter, Search, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { MemberAvatar } from "@/components/common/member-avatar";
import { PriorityIcon } from "@/components/common/priority-icon";
import { StatusIcon } from "@/components/common/status-icon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LABEL_META, PRIORITY_META, STATUS_META } from "@/domain/meta";
import {
  EMPTY_TASK_FILTERS,
  TASK_SORT_LABELS,
  UNASSIGNED,
  countActiveFilters,
  type TaskFilters,
  type TaskSort,
  type TaskSortField,
} from "@/domain/tasks";
import { TASK_LABELS, TASK_PRIORITIES, TASK_STATUSES, type Member, type Project } from "@/domain/types";
import { asOption, toggleValue } from "@/lib/options";
import { cn } from "@/lib/utils";

const SORT_FIELDS = Object.keys(TASK_SORT_LABELS) as TaskSortField[];

interface TaskToolbarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  sort: TaskSort;
  onSortChange: (sort: TaskSort) => void;
  members: readonly Member[];
  projects: readonly Project[];
  /** Hides the project filter when the list is already scoped to one project. */
  showProjectFilter: boolean;
  resultCount: number;
  totalCount: number;
  trailing?: ReactNode;
}

export function TaskToolbar({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  members,
  projects,
  showProjectFilter,
  resultCount,
  totalCount,
  trailing,
}: TaskToolbarProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const activeCount = countActiveFilters(filters);
  const hasFilters = activeCount > 0 || filters.search.trim() !== "";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            ref={searchRef}
            type="search"
            value={filters.search}
            onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
            placeholder="Search tasks or codes"
            aria-label="Search tasks"
            className="h-8 pl-8"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border bg-muted px-1 font-mono text-[0.65rem] text-muted-foreground sm:block">
            /
          </kbd>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <ListFilter aria-hidden />
              Filter
              {activeCount > 0 ? (
                <span className="rounded-full bg-foreground px-1.5 text-[0.65rem] leading-4 text-background tabular-nums">
                  {activeCount}
                </span>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 space-y-4 p-4">
            <FilterSection title="Status">
              {TASK_STATUSES.map((status) => (
                <FilterOption
                  key={status}
                  id={`filter-status-${status}`}
                  label={STATUS_META[status].label}
                  icon={<StatusIcon status={status} />}
                  checked={filters.statuses.includes(status)}
                  onCheckedChange={() => onFiltersChange({ ...filters, statuses: toggleValue(filters.statuses, status) })}
                />
              ))}
            </FilterSection>

            <FilterSection title="Priority">
              {TASK_PRIORITIES.map((priority) => (
                <FilterOption
                  key={priority}
                  id={`filter-priority-${priority}`}
                  label={PRIORITY_META[priority].label}
                  icon={<PriorityIcon priority={priority} />}
                  checked={filters.priorities.includes(priority)}
                  onCheckedChange={() =>
                    onFiltersChange({ ...filters, priorities: toggleValue(filters.priorities, priority) })
                  }
                />
              ))}
            </FilterSection>

            <FilterSection title="Assignee">
              <FilterOption
                id="filter-assignee-unassigned"
                label="Unassigned"
                icon={<MemberAvatar member={null} size="xs" />}
                checked={filters.assigneeIds.includes(UNASSIGNED)}
                onCheckedChange={() =>
                  onFiltersChange({ ...filters, assigneeIds: toggleValue(filters.assigneeIds, UNASSIGNED) })
                }
              />
              {members.map((member) => (
                <FilterOption
                  key={member.id}
                  id={`filter-assignee-${member.id}`}
                  label={member.name}
                  icon={<MemberAvatar member={member} size="xs" />}
                  checked={filters.assigneeIds.includes(member.id)}
                  onCheckedChange={() =>
                    onFiltersChange({ ...filters, assigneeIds: toggleValue(filters.assigneeIds, member.id) })
                  }
                />
              ))}
            </FilterSection>

            <FilterSection title="Labels">
              {TASK_LABELS.map((label) => (
                <FilterOption
                  key={label}
                  id={`filter-label-${label}`}
                  label={LABEL_META[label].label}
                  checked={filters.labels.includes(label)}
                  onCheckedChange={() => onFiltersChange({ ...filters, labels: toggleValue(filters.labels, label) })}
                />
              ))}
            </FilterSection>

            {showProjectFilter ? (
              <FilterSection title="Project">
                {projects.map((project) => (
                  <FilterOption
                    key={project.id}
                    id={`filter-project-${project.id}`}
                    label={project.name}
                    checked={filters.projectIds.includes(project.id)}
                    onCheckedChange={() =>
                      onFiltersChange({ ...filters, projectIds: toggleValue(filters.projectIds, project.id) })
                    }
                  />
                ))}
              </FilterSection>
            ) : null}

            <div className="flex items-center justify-between gap-3 border-t pt-3">
              <Label htmlFor="filter-overdue" className="text-sm">
                Overdue only
              </Label>
              <Switch
                id="filter-overdue"
                checked={filters.overdueOnly}
                onCheckedChange={(checked) => onFiltersChange({ ...filters, overdueOnly: checked })}
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              disabled={activeCount === 0}
              onClick={() => onFiltersChange({ ...EMPTY_TASK_FILTERS, search: filters.search })}
            >
              Clear filters
            </Button>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-1">
          <Select
            value={sort.field}
            onValueChange={(next) => {
              const field = asOption(SORT_FIELDS, next);
              if (field) onSortChange({ ...sort, field });
            }}
          >
            <SelectTrigger size="sm" className="h-8 w-36" aria-label="Sort by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_FIELDS.map((field) => (
                <SelectItem key={field} value={field}>
                  {TASK_SORT_LABELS[field]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={sort.direction === "asc" ? "Sorted ascending. Switch to descending" : "Sorted descending. Switch to ascending"}
            onClick={() => onSortChange({ ...sort, direction: sort.direction === "asc" ? "desc" : "asc" })}
          >
            {sort.direction === "asc" ? <ArrowUp aria-hidden /> : <ArrowDown aria-hidden />}
          </Button>
        </div>

        {hasFilters ? (
          <Button variant="ghost" size="sm" className="h-8" onClick={() => onFiltersChange(EMPTY_TASK_FILTERS)}>
            <X aria-hidden />
            Reset
          </Button>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          <span className={cn("text-xs text-muted-foreground tabular-nums", resultCount === 0 && "text-destructive")}>
            {resultCount} of {totalCount}
          </span>
          {trailing}
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-medium text-muted-foreground">{title}</legend>
      <div className="grid max-h-44 gap-1.5 overflow-y-auto">{children}</div>
    </fieldset>
  );
}

function FilterOption({
  id,
  label,
  icon,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  icon?: ReactNode;
  checked: boolean;
  onCheckedChange: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-md px-1 py-1 hover:bg-muted">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      {icon}
      <Label htmlFor={id} className="min-w-0 flex-1 truncate text-sm font-normal">
        {label}
      </Label>
    </div>
  );
}
