import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">{children}</CardContent>
    </Card>
  );
}

/** Label and description on the left, control on the right. Stacks on narrow screens. */
export function SettingRow({
  label,
  description,
  htmlFor,
  control,
}: {
  label: string;
  description?: string;
  htmlFor?: string;
  control: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
        </label>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
