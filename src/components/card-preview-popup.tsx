import { type Card } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CardPreviewPopup({
  card,
  className,
}: {
  card: Card;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap",
        "bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2",
        "text-xs font-medium text-foreground shadow-lg",
        "opacity-0 transition-opacity duration-200",
        "group-hover:opacity-100",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">📊</span>
        <span>SAV {card.stats.savoir}</span>
        <span className="opacity-50">•</span>
        <span>INF {card.stats.influence}</span>
        <span className="opacity-50">•</span>
        <span>SIN {card.stats.singularite}</span>
      </div>
      <div className="h-px w-full bg-border my-1" />
      <div className="text-[10px] text-muted-foreground">
        {card.name}
      </div>
    </div>
  );
}
