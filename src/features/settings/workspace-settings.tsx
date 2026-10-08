"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_VIEW_META } from "@/domain/meta";
import { workspaceNameSchema } from "@/domain/schemas";
import { DEFAULT_VIEWS } from "@/domain/types";
import { asOption } from "@/lib/options";
import { useWorkspaceState, workspaceActions } from "@/store/workspace-store";
import { SettingRow, SettingsSection } from "./settings-section";

export function WorkspaceSettings() {
  const { workspaces, preferences, projects, members } = useWorkspaceState();
  const active = workspaces.find((workspace) => workspace.id === preferences.activeWorkspaceId) ?? workspaces[0];
  const [name, setName] = useState(active?.name ?? "");
  const [nameError, setNameError] = useState<string | undefined>(undefined);

  if (!active) return null;

  const onRename = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = workspaceNameSchema.safeParse(name);
    if (!result.success) {
      setNameError(z.flattenError(result.error).formErrors[0]);
      return;
    }
    setNameError(undefined);
    workspaceActions.renameWorkspace(active.id, result.data);
    setName(result.data);
    toast.success("Workspace renamed");
  };

  return (
    <SettingsSection
      title="Workspace"
      description={`${projects.length} projects and ${members.length} members in ${active.name}. Plan: ${active.plan}.`}
    >
      <form onSubmit={onRename} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <FormField id="workspace-name" label="Workspace name" error={nameError}>
          <Input id="workspace-name" value={name} onChange={(event) => setName(event.target.value)} />
        </FormField>
        <Button type="submit" variant="outline" disabled={name.trim() === active.name}>
          Rename
        </Button>
      </form>

      <SettingRow
        label="Default view"
        description="Where Orbit opens when you launch it."
        htmlFor="default-view"
        control={
          <Select
            value={preferences.defaultView}
            onValueChange={(next) => {
              const view = asOption(DEFAULT_VIEWS, next);
              if (view) workspaceActions.updatePreferences({ defaultView: view });
            }}
          >
            <SelectTrigger id="default-view" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_VIEWS.map((view) => (
                <SelectItem key={view} value={view}>
                  {DEFAULT_VIEW_META[view].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </SettingsSection>
  );
}
