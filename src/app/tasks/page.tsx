import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { TaskWorkbench } from "@/features/tasks/task-workbench";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <PageHeader title="Tasks" description="Every open and completed task across live projects." />
      <TaskWorkbench />
    </div>
  );
}
