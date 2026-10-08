import { LABEL_META } from "@/domain/meta";
import type { TaskLabel } from "@/domain/types";
import { Badge } from "@/components/ui/badge";

export function LabelBadge({ label }: { label: TaskLabel }) {
  return (
    <Badge variant="outline" className="font-normal text-muted-foreground">
      {LABEL_META[label].label}
    </Badge>
  );
}
