import { Compass } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <EmptyState
      icon={Compass}
      title="This page is out of orbit"
      description="The page you are looking for does not exist or may have moved."
      action={
        <Button asChild size="sm">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      }
    />
  );
}
