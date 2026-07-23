import { Award } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuideCategory } from "@/types";

const TONES: Record<GuideCategory, string> = {
  STANDARD: "bg-muted text-muted-foreground",
  PREMIUM: "bg-primary/10 text-primary",
};

const LABELS: Record<GuideCategory, string> = {
  STANDARD: "Standard",
  PREMIUM: "Premium",
};

export function GuideCategoryBadge({ category }: { category: GuideCategory }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        TONES[category] ?? "bg-muted text-muted-foreground",
      )}
    >
      {category === "PREMIUM" && <Award className="h-3 w-3" />}
      {LABELS[category] ?? category}
    </span>
  );
}
