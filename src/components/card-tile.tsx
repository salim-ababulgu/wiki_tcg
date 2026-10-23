import { Link, useLocation } from "react-router-dom";
import { Check, Coins } from "lucide-react";
import { WikiPhoto } from "@/components/wiki-photo";
import { useGame } from "@/lib/game-store";
import { RarityBadge } from "@/components/rarity-badge";
import { RARITY_MAP, type Card } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";
import { getCardShadow, getCardNumberOpacity } from "@/lib/card-styles";

export function CardTile({
  card,
  owned = false,
  className,
  compact = false,
}: {
  card: Card;
  owned?: boolean;
  className?: string;
  compact?: boolean;
}) {
  const accent = RARITY_MAP[card.rarity].accent;
  const location = useLocation();
  const { minor, streamer } = useGame();

  return (
    <Link
      to={`/carte/${card.slug}`}
      // Mémorise la page en cours : la fiche s'ouvrira en fenêtre par-dessus.
      state={{ backgroundLocation: location }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-300",
        "hover:-translate-y-1 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
      style={{
        borderColor: `color-mix(in oklch, ${accent} 45%, var(--border))`,
        boxShadow: getCardShadow(card.rarity),
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120% 80% at 50% 0%, color-mix(in oklch, ${accent} 16%, transparent), transparent 70%)`,
        }}
      />
      {/* Foil shimmer effect au hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 card-shimmer"
        style={{
          background: `linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.15) 20%, transparent 40%)`,
          backgroundSize: "1000px 1000px",
        }}
      />

      <div className="relative">
        <WikiPhoto
          card={card}
          blurred={card.sensitive && (minor || streamer)}
          revealable={!minor}
          className={compact ? "h-32" : "h-44"}
          glyphClassName={compact ? "size-10" : "size-14"}
        />
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <RarityBadge rarity={card.rarity} />
        </div>
        <div className="absolute top-2 right-2">
          {owned ? (
            <span className="bg-emerald-500/25 text-emerald-200 ring-emerald-500/50 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1.5 backdrop-blur-sm">
              <Check className="size-3" /> Possédée
            </span>
          ) : (
            <span className={cn(
              "rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur-sm border border-white/10 font-mono tracking-wider",
              getCardNumberOpacity(card.rarity)
            )}>
              {card.number}
            </span>
          )}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col gap-1.5 p-3">
        <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-medium tracking-wide uppercase">
          <span>{card.category}</span>
          {card.era && (
            <>
              <span className="opacity-40">•</span>
              <span>{card.era}</span>
            </>
          )}
        </div>
        <h3 className="font-display text-[15px] leading-tight font-semibold text-balance">
          {card.name}
        </h3>
        <p className="text-muted-foreground line-clamp-2 text-xs leading-snug">{card.blurb}</p>

        <div className="mt-auto flex flex-col gap-2">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1 text-xs font-medium tabular-nums">
              <Coins className="size-3.5 text-[var(--gold)]" />
              {formatNumber(card.value)}
            </span>
            <span className="text-muted-foreground/80 text-[10px] font-medium">
              SAV {card.stats.savoir} · INF {card.stats.influence}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
