"use client";

import { PageHeader } from "@/components/common/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppearanceSettings } from "./appearance-settings";
import { NotificationSettings } from "./notification-settings";
import { ProfileSettings } from "./profile-settings";
import { WorkspaceSettings } from "./workspace-settings";

export function SettingsView() {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader title="Settings" description="Your profile, how Orbit looks, and what it tells you about." />

      <Tabs defaultValue="profile" className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <TabsList variant="line" className="flex w-full flex-row justify-start overflow-x-auto lg:w-44 lg:flex-col lg:items-stretch">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <div className="min-w-0 flex-1">
          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>
          <TabsContent value="appearance">
            <AppearanceSettings />
          </TabsContent>
          <TabsContent value="workspace">
            <WorkspaceSettings />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
