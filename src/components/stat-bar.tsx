import { cn } from "@/lib/utils";

export function StatBar({
  label,
  value,
  accent,
  className,
}: {
  label: string;
  value: number;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground font-medium tracking-wide uppercase">{label}</span>
        <span className="font-mono font-semibold tabular-nums">{value}</span>
      </div>
      <div className="bg-muted h-1.5 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${value}%`,
            backgroundColor: accent ?? "var(--primary)",
          }}
        />
      </div>
    </div>
  );
}
