import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Combine, Copy, Layers, Lock, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { WikiPhoto } from "@/components/wiki-photo";
import { PageHeader } from "@/components/page-header";
import { RarityBadge } from "@/components/rarity-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CARD_BY_ID, CARDS } from "@/data/cards";
import { FUSION_COST, useGame } from "@/lib/game-store";
import { RARITIES, RARITY_MAP, type Card as CardType, type Rarity } from "@/lib/types";
import { cn, plural } from "@/lib/utils";

type Mode = "doublons" | "rarete";

type Ritual = {
  phase: "idle" | "converge" | "reveal";
  consumed: CardType[];
  gained: CardType | null;
};

const IDLE: Ritual = { phase: "idle", consumed: [], gained: null };

function nextRarity(rarity: Rarity): Rarity | null {
  return RARITIES[RARITIES.indexOf(rarity) + 1] ?? null;
}

export function FusionPage() {
  const { collection, fuse } = useGame();
  const [mode, setMode] = React.useState<Mode>("doublons");
  const [ritual, setRitual] = React.useState<Ritual>(IDLE);

  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    collection.forEach((owned) => map.set(owned.cardId, (map.get(owned.cardId) ?? 0) + 1));
    return map;
  }, [collection]);

  /** Doublons, par carte : au moins 3 exemplaires au total. */
  const byCard = React.useMemo(() => {
    return [...counts.entries()]
      .filter(([, copies]) => copies - 1 >= FUSION_COST)
      .map(([cardId, copies]) => ({ card: CARD_BY_ID.get(cardId), copies }))
      .filter((entry): entry is { card: CardType; copies: number } => Boolean(entry.card))
      .sort((a, b) => RARITIES.indexOf(b.card.rarity) - RARITIES.indexOf(a.card.rarity));
  }, [counts]);

  /** Doublons disponibles par rareté. */
  const byRarity = React.useMemo(() => {
    return RARITIES.map((rarity) => {
      let extras = 0;
      for (const [cardId, copies] of counts) {
        const card = CARD_BY_ID.get(cardId);
        if (card?.rarity === rarity) extras += Math.max(0, copies - 1);
      }
      return { rarity, extras, target: nextRarity(rarity) };
    });
  }, [counts]);

  const totalExtras = [...counts.values()].reduce((sum, copies) => sum + Math.max(0, copies - 1), 0);

  const runFusion = (input: Parameters<typeof fuse>[0]) => {
    const result = fuse(input);
    if (!result.ok) {
      toast.error(
        result.reason === "rang-max"
          ? "Ce rang est le plus élevé : rien au-dessus à obtenir."
          : "Il faut davantage de doublons pour fusionner.",
      );
      return;
    }

    setRitual({ phase: "converge", consumed: result.consumed, gained: result.card });
    window.setTimeout(() => {
      setRitual((prev) => ({ ...prev, phase: "reveal" }));
    }, 950);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Fusion"
        title="Transformer les doublons"
        description={`${plural(totalExtras, "doublon disponible", "doublons disponibles")}. Deux recettes possibles, une seule règle : la dernière carte de chaque fiche reste toujours dans votre collection.`}
      />

      {/* Deux recettes, expliquées visuellement */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            key: "doublons" as Mode,
            icon: Copy,
            title: "Trois fois la même carte",
            detail: "La carte + 2 doublons → une carte du rang supérieur",
            sample: "×3",
          },
          {
            key: "rarete" as Mode,
            icon: Layers,
            title: "Trois cartes du même rang",
            detail: "3 doublons d'une rareté → une carte du rang supérieur",
            sample: "rares",
          },
        ].map((recette) => {
          const active = mode === recette.key;
          return (
            <button
              key={recette.key}
              type="button"
              onClick={() => setMode(recette.key)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                active
                  ? "border-primary/50 bg-primary/10 shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_40%,transparent)]"
                  : "bg-card/40 hover:bg-accent/30",
              )}
            >
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-lg",
                  active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                <recette.icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{recette.title}</span>
                <span className="text-muted-foreground block text-[11px] leading-relaxed">
                  {recette.detail}
                </span>
              </span>
              <Badge variant={active ? "default" : "outline"} className="shrink-0 text-[10px]">
                {recette.sample}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Contenu selon le mode */}
      {mode === "doublons" ? (
        byCard.length === 0 ? (
          <EmptyBlock text={`Il vous faut ${FUSION_COST + 1} exemplaires d'une même carte.`} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {byCard.map(({ card, copies }) => {
              const tier = nextRarity(card.rarity);
              return (
                <div
                  key={card.id}
                  className="flex gap-3 rounded-xl border bg-card p-3"
                  style={{
                    borderColor: `color-mix(in oklch, ${RARITY_MAP[card.rarity].accent} 28%, var(--border))`,
                  }}
                >
                  <WikiPhoto
                    card={card}
                    className="h-24 w-[70px] shrink-0 rounded-lg"
                    glyphClassName="size-7"
                    lazy={false}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <RarityBadge rarity={card.rarity} />
                      <Badge variant="secondary" className="text-[10px] tabular-nums">
                        ×{copies}
                      </Badge>
                    </div>
                    <p className="truncate text-sm font-semibold">{card.name}</p>
                    <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                      2 doublons <ArrowRight className="size-3" />
                      {tier ? RARITY_MAP[tier].label : "rang maximum"}
                    </p>
                    <Button
                      size="sm"
                      className="mt-auto h-7 w-full text-[11px]"
                      disabled={!tier}
                      onClick={() => runFusion({ mode: "doublons", cardId: card.id })}
                    >
                      <Combine className="size-3" /> Fusionner
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="space-y-2">
          {byRarity.map(({ rarity, extras, target }) => {
            const ready = extras >= FUSION_COST + 1 && Boolean(target);
            return (
              <div
                key={rarity}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-xl border p-3 transition-colors",
                  ready ? "bg-card" : "bg-card/40",
                )}
                style={{
                  borderColor: ready
                    ? `color-mix(in oklch, ${RARITY_MAP[rarity].accent} 30%, var(--border))`
                    : undefined,
                }}
              >
                <RarityBadge rarity={rarity} withLabel className="w-28" />
                <span className="text-muted-foreground text-[11px] tabular-nums">
                  {extras} doublon{extras > 1 ? "s" : ""}
                </span>
                <ArrowRight className="text-muted-foreground size-3.5" />
                <span className="flex items-center gap-1.5 text-[11px]">
                  {target ? (
                    <>
                      <span
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: RARITY_MAP[target].accent }}
                      />
                      {RARITY_MAP[target].label}
                    </>
                  ) : (
                    <>
                      <Lock className="size-3" /> rang maximum
                    </>
                  )}
                </span>

                <Button
                  size="sm"
                  variant={ready ? "secondary" : "ghost"}
                  className="ml-auto h-7 text-[11px]"
                  disabled={!ready}
                  onClick={() => runFusion({ mode: "rarete", rarity })}
                >
                  <Combine className="size-3" />
                  {ready ? "Fusionner 3" : "3 requis"}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-muted-foreground border-t pt-3 text-[11px] leading-relaxed">
        Les doublons sacrifiés quittent la collection, jamais la fiche : votre progression dans
        l'album ne baisse pas. La fusion est gratuite, et le rang légendaire est sans suite.
        {CARDS.length > 0 && ` ${CARDS.length} fiches au catalogue.`}
      </p>

      {/* ——— Mise en scène de la fusion ——— */}
      {ritual.phase !== "idle" && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-md">
          <div className="relative flex w-full max-w-md flex-col items-center gap-5 text-center">
            {ritual.phase === "converge" ? (
              <>
                <p className="font-display text-sm font-semibold tracking-wide uppercase">
                  Fusion en cours…
                </p>
                <div className="relative flex items-center justify-center gap-2">
                  {ritual.consumed.map((card, index) => (
                    <div
                      key={`${card.id}-${index}`}
                      className="animate-fuse-converge w-20 overflow-hidden rounded-lg border"
                      style={{
                        animationDelay: `${index * 90}ms`,
                        borderColor: `color-mix(in oklch, ${RARITY_MAP[card.rarity].accent} 50%, transparent)`,
                      }}
                    >
                      <WikiPhoto card={card} className="h-28" glyphClassName="size-6" lazy={false} />
                    </div>
                  ))}
                  <span className="animate-fuse-burst pointer-events-none absolute size-32 rounded-full bg-[radial-gradient(circle,oklch(0.85_0.15_85/0.8),transparent_70%)]" />
                </div>
                <p className="text-muted-foreground text-xs">
                  {ritual.consumed.length} doublons sacrifiés
                </p>
              </>
            ) : (
              ritual.gained && (
                <>
                  <p className="font-display text-sm font-semibold tracking-wide uppercase">
                    Résultat
                  </p>
                  <div
                    className="animate-fuse-arrive animate-fuse-glow w-48 overflow-hidden rounded-xl border bg-card"
                    style={{
                      borderColor: `color-mix(in oklch, ${RARITY_MAP[ritual.gained.rarity].accent} 60%, transparent)`,
                    }}
                  >
                    <WikiPhoto
                      card={ritual.gained}
                      className="h-52"
                      glyphClassName="size-16"
                      lazy={false}
                    />
                    <div className="space-y-1 p-2.5">
                      <RarityBadge rarity={ritual.gained.rarity} withLabel />
                      <p className="truncate text-sm font-semibold">{ritual.gained.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setRitual(IDLE)}>
                      <X className="size-3.5" /> Continuer
                    </Button>
                    <Button asChild size="sm">
                      <Link to={`/carte/${ritual.gained.slug}`}>Voir la fiche</Link>
                    </Button>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
      <Combine className="text-muted-foreground size-8" />
      <p className="font-display font-semibold">Rien à fusionner pour l'instant</p>
      <p className="text-muted-foreground max-w-md text-sm">{text} Les doublons s'accumulent vite.</p>
      <Button asChild size="sm">
        <Link to="/paquets">
          <Sparkles className="size-3.5" /> Ouvrir un paquet
        </Link>
      </Button>
    </div>
  );
}
