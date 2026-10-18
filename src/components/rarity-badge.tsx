import { Link } from "react-router-dom";
import { Crown, Gem, Sparkles } from "lucide-react";
import { RARITY_MAP, type Rarity } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Partial<Record<Rarity, typeof Crown>> = {
  legendaire: Crown,
  "ultra-rare": Gem,
  "super-rare": Sparkles,
};

export function RarityBadge({
  rarity,
  className,
  withLabel = false,
}: {
  rarity: Rarity;
  className?: string;
  withLabel?: boolean;
}) {
  const info = RARITY_MAP[rarity];
  const Icon = ICONS[rarity];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase backdrop-blur-sm",
        className,
      )}
      style={{
        borderColor: `color-mix(in oklch, ${info.accent} 55%, transparent)`,
        color: info.accent,
        backgroundColor: `color-mix(in oklch, ${info.accent} 14%, transparent)`,
      }}
    >
      {Icon ? <Icon className="size-3" /> : null}
      {withLabel ? info.label : info.short}
    </span>
  );
}

export function RarityDot({ rarity, className }: { rarity: Rarity; className?: string }) {
  return (
    <span
      className={cn("size-2 rounded-full", className)}
      style={{ backgroundColor: RARITY_MAP[rarity].accent }}
      title={RARITY_MAP[rarity].label}
    />
  );
}

export function RarityLink({ rarity }: { rarity: Rarity }) {
  return (
    <Link
      to={`/explorer?rarete=${rarity}`}
      className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
    >
      {RARITY_MAP[rarity].label}
    </Link>
  );
}
