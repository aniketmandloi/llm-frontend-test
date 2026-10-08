import type { Metadata } from "next";
import { SEED_WORKSPACE_STATE } from "@/data/seed";
import { ProjectDetailView } from "@/features/projects/project-detail-view";

export const metadata: Metadata = { title: "Project" };

export function generateStaticParams() {
  return SEED_WORKSPACE_STATE.projects.map((project) => ({ projectId: project.id }));
}

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ProjectDetailView projectId={projectId} />;
}
