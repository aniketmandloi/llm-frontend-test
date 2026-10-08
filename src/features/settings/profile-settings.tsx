"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { MemberAvatar } from "@/components/common/member-avatar";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { profileFormSchema, type ProfileFormValues } from "@/domain/schemas";
import type { Member } from "@/domain/types";
import { useWorkspaceState, workspaceActions } from "@/store/workspace-store";
import { SettingsSection } from "./settings-section";

export function ProfileSettings() {
  const { members, currentMemberId } = useWorkspaceState();
  const me = members.find((member) => member.id === currentMemberId);

  if (!me) return null;

  return <ProfileForm key={me.id} member={me} />;
}

type ProfileFieldErrors = Partial<Record<keyof ProfileFormValues, string[]>>;

/** Compares against the stored member, so the form resets its dirty state after every save. */
function ProfileForm({ member }: { member: Member }) {
  const [values, setValues] = useState<ProfileFormValues>({
    name: member.name,
    title: member.title,
    email: member.email,
  });
  const [errors, setErrors] = useState<ProfileFieldErrors>({});

  const dirty = values.name !== member.name || values.title !== member.title || values.email !== member.email;

  const update = (key: keyof ProfileFormValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = profileFormSchema.safeParse(values);
    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors);
      return;
    }
    setErrors({});
    workspaceActions.updateMember(member.id, result.data);
    toast.success("Profile saved");
  };

  return (
    <SettingsSection title="Profile" description="How you appear to teammates across projects and activity.">
      <div className="flex items-center gap-4">
        <MemberAvatar member={member} size="md" className="size-12 text-sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{member.name}</p>
          <p className="truncate text-sm text-muted-foreground">{member.title}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <FormField id="profile-name" label="Full name" error={errors.name?.[0]} className="min-w-0 space-y-1.5 sm:col-span-2">
          <Input id="profile-name" value={values.name} onChange={(event) => update("name", event.target.value)} />
        </FormField>
        <FormField id="profile-title" label="Role" error={errors.title?.[0]} className="min-w-0 space-y-1.5">
          <Input id="profile-title" value={values.title} onChange={(event) => update("title", event.target.value)} />
        </FormField>
        <FormField id="profile-email" label="Email" error={errors.email?.[0]} className="min-w-0 space-y-1.5">
          <Input
            id="profile-email"
            type="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
          />
        </FormField>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button
            type="button"
            variant="outline"
            disabled={!dirty}
            onClick={() => setValues({ name: member.name, title: member.title, email: member.email })}
          >
            Discard
          </Button>
          <Button type="submit" disabled={!dirty}>
            Save profile
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}
