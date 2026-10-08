"use client";

import { Switch } from "@/components/ui/switch";
import type { Preferences } from "@/domain/types";
import { useWorkspaceState, workspaceActions } from "@/store/workspace-store";
import { SettingRow, SettingsSection } from "./settings-section";

type NotificationKey = keyof Preferences["notifications"];

const NOTIFICATIONS: { key: NotificationKey; label: string; description: string }[] = [
  { key: "assignments", label: "Assignments", description: "When a task is assigned to you." },
  { key: "dueSoon", label: "Due soon", description: "A reminder the day before a task is due." },
  { key: "projectUpdates", label: "Project updates", description: "Status and target date changes on your projects." },
  { key: "weeklyDigest", label: "Weekly digest", description: "A summary of completed work every Monday." },
];

export function NotificationSettings() {
  const { preferences } = useWorkspaceState();

  const setNotification = (key: NotificationKey, enabled: boolean) => {
    workspaceActions.updatePreferences({
      notifications: { ...preferences.notifications, [key]: enabled },
    });
  };

  return (
    <SettingsSection title="Notifications" description="Choose what Orbit tells you about. Delivery is simulated in this demo.">
      {NOTIFICATIONS.map((item) => (
        <SettingRow
          key={item.key}
          label={item.label}
          description={item.description}
          htmlFor={`notify-${item.key}`}
          control={
            <Switch
              id={`notify-${item.key}`}
              checked={preferences.notifications[item.key]}
              onCheckedChange={(checked) => setNotification(item.key, checked)}
              aria-label={item.label}
            />
          }
        />
      ))}
    </SettingsSection>
  );
}
