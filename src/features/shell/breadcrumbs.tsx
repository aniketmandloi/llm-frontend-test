"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useWorkspaceState } from "@/store/workspace-store";
import { ROUTE_LABELS } from "./nav";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const { projects } = useWorkspaceState();
  const crumbs = buildCrumbs(pathname, (id) => projects.find((project) => project.id === id)?.name);

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap truncate">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem className="min-w-0 whitespace-nowrap">
                {isLast || !crumb.href ? (
                  <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function buildCrumbs(pathname: string, projectName: (id: string) => string | undefined): Crumb[] {
  const [root, ...rest] = pathname.split("/").filter(Boolean);
  const rootHref = `/${root ?? ""}`;
  const rootLabel = ROUTE_LABELS[rootHref] ?? "Orbit";

  if (root === "projects" && rest.length > 0) {
    const projectId = rest[0];
    return [
      { label: rootLabel, href: rootHref },
      { label: projectName(projectId) ?? "Project" },
    ];
  }

  return [{ label: rootLabel }];
}
