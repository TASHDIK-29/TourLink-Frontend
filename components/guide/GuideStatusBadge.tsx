import { cn } from "@/lib/utils";
import type { GuideStatus } from "@/types";

const GUIDE_TONES: Record<GuideStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  APPROVED: "bg-accent/15 text-accent",
  REJECTED: "bg-destructive/15 text-destructive",
};

const GUIDE_LABELS: Record<GuideStatus, string> = {
  PENDING: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function GuideStatusBadge({ status }: { status: GuideStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        GUIDE_TONES[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {GUIDE_LABELS[status] ?? status}
    </span>
  );
}
