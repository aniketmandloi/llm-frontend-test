import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SEED_WORKSPACE_STATE } from "@/data/seed";
import { ProjectDetailView } from "@/features/projects/project-detail-view";

export const metadata: Metadata = { title: "Project" };

export function generateStaticParams() {
  return SEED_WORKSPACE_STATE.projects.map((project) => ({ projectId: project.id }));
}

/** The shell renders instantly. Reading the dynamic segment happens inside Suspense so it can stream. */
export default function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  return (
    <Suspense fallback={<ProjectSkeleton />}>
      <ProjectRoute params={params} />
    </Suspense>
  );
}

async function ProjectRoute({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ProjectDetailView projectId={projectId} />;
}

function ProjectSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading project">
      <div className="flex items-center gap-5">
        <Skeleton className="size-24 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-12 w-80" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
