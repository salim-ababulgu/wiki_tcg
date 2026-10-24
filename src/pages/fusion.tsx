import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Combine, Lock, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { WikiPhoto } from "@/components/wiki-photo";
import { PageHeader } from "@/components/page-header";
import { RarityBadge } from "@/components/rarity-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CARD_BY_ID, CARDS } from "@/data/cards";
import { FUSION_COST, useGame } from "@/lib/game-store";
import { RARITIES, RARITY_MAP, type Card as CardType } from "@/lib/types";
import { formatNumber, plural } from "@/lib/utils";

/** Le rang juste au-dessus, ou null pour les légendaires. */
function nextRarity(rarity: CardType["rarity"]): CardType["rarity"] | null {
  const index = RARITIES.indexOf(rarity);
  return RARITIES[index + 1] ?? null;
}

export function FusionPage() {
  const { collection, ownedIds, fuse } = useGame();
  const [gained, setGained] = React.useState<CardType | null>(null);

  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    collection.forEach((owned) => map.set(owned.cardId, (map.get(owned.cardId) ?? 0) + 1));
    return map;
  }, [collection]);

  // Uniquement les cartes qu'on peut sacrifier sans perdre la dernière.
  const candidates = React.useMemo(() => {
    return [...counts.entries()]
      .filter(([, copies]) => copies - 1 >= FUSION_COST)
      .map(([cardId, copies]) => ({ card: CARD_BY_ID.get(cardId), copies }))
      .filter((entry): entry is { card: CardType; copies: number } => Boolean(entry.card))
      .sort((a, b) => RARITIES.indexOf(b.card.rarity) - RARITIES.indexOf(a.card.rarity));
  }, [counts]);

  const handleFuse = (card: CardType) => {
    const result = fuse(card.id);
    if (!result.ok) {
      toast.error(
        result.reason === "rang-max"
          ? "Ce rang est le plus élevé : rien au-dessus à obtenir."
          : "Il faut davantage de doublons pour fusionner.",
      );
      return;
    }
    setGained(result.card);
  };

  const totalDoublons = [...counts.values()].reduce((sum, copies) => sum + Math.max(0, copies - 1), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Fusion"
        title="Transformer les doublons"
        description={`${plural(totalDoublons, "doublon disponible", "doublons disponibles")}. La fusion sacrifie des exemplaires en double — jamais la première carte, celle qui compte dans votre album.`}
      />

      <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/15 text-primary grid size-11 shrink-0 place-items-center rounded-xl">
              <Combine className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="font-display font-semibold">La règle</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {FUSION_COST} doublons identiques + la carte d'origine → <strong>1 carte du rang
                supérieur</strong>, tirée au hasard dans ce rang. Le rang légendaire est le sommet :
                il ne se fusionne pas.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            gratuit · aucun WikiCrédit
          </Badge>
        </CardContent>
      </Card>

      {candidates.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <Combine className="text-muted-foreground size-8" />
          <p className="font-display font-semibold">Rien à fusionner pour l'instant</p>
          <p className="text-muted-foreground max-w-md text-sm">
            Il vous faut {FUSION_COST + 1} exemplaires d'une même carte pour tenter une fusion.
            Ouvrez des paquets : les doublons s'accumulent vite.
          </p>
          <Button asChild size="sm">
            <Link to="/paquets">
              <Sparkles className="size-3.5" /> Ouvrir un paquet
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {candidates.map(({ card, copies }) => {
            const tier = nextRarity(card.rarity);
            const accent = RARITY_MAP[card.rarity].accent;

            return (
              <div
                key={card.id}
                className="flex gap-3 rounded-xl border bg-card p-3"
                style={{ borderColor: `color-mix(in oklch, ${accent} 28%, var(--border))` }}
              >
                <WikiPhoto
                  card={card}
                  className="h-28 w-20 shrink-0 rounded-lg"
                  glyphClassName="size-8"
                  lazy={false}
                />

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <RarityBadge rarity={card.rarity} />
                    <Badge variant="secondary" className="text-[10px] tabular-nums">
                      ×{copies}
                    </Badge>
                  </div>

                  <p className="truncate text-sm font-semibold">{card.name}</p>

                  <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                    <span className="tabular-nums">
                      {FUSION_COST} doublons
                    </span>
                    <ArrowRight className="size-3" />
                    {tier ? (
                      <span className="flex items-center gap-1">
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: RARITY_MAP[tier].accent }}
                        />
                        {RARITY_MAP[tier].label}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Lock className="size-3" /> rang maximum
                      </span>
                    )}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-2">
                    <span className="text-muted-foreground text-[10px] tabular-nums">
                      valeur {formatNumber(card.value)}
                    </span>
                    <Button
                      size="sm"
                      variant={tier ? "secondary" : "ghost"}
                      className="h-7 text-[11px]"
                      disabled={!tier}
                      onClick={() => handleFuse(card)}
                    >
                      <Combine className="size-3" /> Fusionner
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Résultat */}
      <Dialog open={gained !== null} onOpenChange={(open) => !open && setGained(null)}>
        <DialogContent className="max-w-sm text-center">
          <DialogTitle className="font-display text-base">Fusion réussie</DialogTitle>
          {gained && (
            <div className="space-y-3">
              <div
                className="mx-auto w-40 overflow-hidden rounded-xl border"
                style={{
                  borderColor: `color-mix(in oklch, ${RARITY_MAP[gained.rarity].accent} 55%, transparent)`,
                }}
              >
                <WikiPhoto card={gained} className="h-40" glyphClassName="size-12" lazy={false} />
                <div className="space-y-1 p-2">
                  <RarityBadge rarity={gained.rarity} withLabel />
                  <p className="truncate text-xs font-semibold">{gained.name}</p>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                Votre carte {RARITY_MAP[gained.rarity].label.toLowerCase()} est dans la collection.
              </p>
              <div className="flex justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setGained(null);
                  }}
                >
                  <X className="size-3.5" /> Fermer
                </Button>
                {ownedIds.has(gained.id) && (
                  <Button asChild size="sm">
                    <Link to={`/carte/${gained.slug}`}>Voir la fiche</Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <p className="text-muted-foreground border-t pt-3 text-[11px]">
        Les doublons sacrifiés disparaissent de la collection, mais la fiche reste dans votre album :
        c'est le nombre d'exemplaires qui baisse, pas votre progression.
        {CARDS.length > 0 && ` ${CARDS.length} fiches au catalogue.`}
      </p>
    </div>
  );
}
