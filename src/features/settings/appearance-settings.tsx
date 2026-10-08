"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DENSITY_META } from "@/domain/meta";
import { DENSITIES } from "@/domain/types";
import { asOption } from "@/lib/options";
import { useWorkspaceState, workspaceActions } from "@/store/workspace-store";
import { SettingRow, SettingsSection } from "./settings-section";

const THEMES = ["light", "dark", "system"] as const;
const THEME_ICON = { light: Sun, dark: Moon, system: Monitor } as const;

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { preferences } = useWorkspaceState();

  return (
    <SettingsSection title="Appearance" description="Theme and information density. Saved in this browser.">
      <SettingRow
        label="Theme"
        description="System follows your operating system setting."
        control={
          <ToggleGroup
            type="single"
            variant="outline"
            value={theme ?? "system"}
            onValueChange={(next) => {
              const option = asOption(THEMES, next);
              if (option) setTheme(option);
            }}
            aria-label="Theme"
          >
            {THEMES.map((option) => {
              const Icon = THEME_ICON[option];
              return (
                <ToggleGroupItem key={option} value={option} className="gap-1.5 px-3 text-xs capitalize">
                  <Icon aria-hidden />
                  {option}
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        }
      />

      <SettingRow
        label="Density"
        description="Compact tightens task list rows so more fit on screen."
        control={
          <ToggleGroup
            type="single"
            variant="outline"
            value={preferences.density}
            onValueChange={(next) => {
              const option = asOption(DENSITIES, next);
              if (option) workspaceActions.updatePreferences({ density: option });
            }}
            aria-label="Density"
          >
            {DENSITIES.map((option) => (
              <ToggleGroupItem key={option} value={option} className="px-3 text-xs">
                {DENSITY_META[option].label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        }
      />
    </SettingsSection>
  );
}
