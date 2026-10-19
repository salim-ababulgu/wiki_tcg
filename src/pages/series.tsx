import { Link } from "react-router-dom";
import { ArrowRight, Check, Layers, Package, Sparkles } from "lucide-react";
import { CardArt } from "@/components/card-art";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CARDS } from "@/data/cards";
import { SERIES } from "@/data/series";
import { useGame } from "@/lib/game-store";
import { RARITY_MAP } from "@/lib/types";
import { formatNumber, plural } from "@/lib/utils";

export function SeriesPage() {
  const { signedIn, ownedIds } = useGame();

  const rows = SERIES.map((series) => {
    const owned = signedIn
      ? series.cards.filter((card) => ownedIds.has(card.id)).length
      : 0;
    return {
      ...series,
      owned,
      missing: series.total - owned,
      percent: Math.round((owned / series.total) * 100),
      complete: owned === series.total,
    };
  });

  const totalOwned = rows.reduce((sum, row) => sum + row.owned, 0);
  const completedSeries = rows.filter((row) => row.complete).length;
  const globalPercent = Math.round((totalOwned / CARDS.length) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Séries"
        title="Compléter mes séries"
        description="Chaque fiche appartient à une série. Voici ce qu'il vous reste à réunir pour les terminer, série par série."
        actions={
          <Button asChild>
            <Link to="/paquets">
              <Package className="size-4" /> Ouvrir un paquet
            </Link>
          </Button>
        }
      />

      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/15 text-primary grid size-12 shrink-0 place-items-center rounded-xl">
              <Layers className="size-6" />
            </div>
            <div>
              <p className="font-display font-semibold">Votre progression globale</p>
              <p className="text-muted-foreground text-sm">
                {totalOwned} fiches sur {CARDS.length} · {completedSeries} série
                {completedSeries > 1 ? "s" : ""} terminée{completedSeries > 1 ? "s" : ""} sur{" "}
                {SERIES.length}
              </p>
            </div>
          </div>
          <div className="flex w-full max-w-sm items-center gap-3">
            <Progress value={globalPercent} className="h-2.5" />
            <span className="w-10 text-right text-sm font-semibold tabular-nums">
              {globalPercent}%
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((series) => (
          <Link
            key={series.slug}
            to={`/serie/${series.slug}`}
            className="group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_16px_36px_-20px_rgba(0,0,0,0.85)]"
          >
            <div className="flex items-center gap-3">
              <CardArt
                card={series.rarest}
                className="size-12 shrink-0 rounded-lg"
                glyphClassName="size-5"
              />
              <div className="min-w-0 flex-1">
                <p className="font-display truncate font-semibold">{series.name}</p>
                <p className="text-muted-foreground text-[11px]">
                  {plural(series.total, "fiche")} · jusqu'à{" "}
                  {RARITY_MAP[series.topRarity].label.toLowerCase()}
                </p>
              </div>
              <ArrowRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground tabular-nums">
                  {series.owned} / {series.total}
                </span>
                {series.complete ? (
                  <Badge className="gap-1 bg-emerald-500/15 text-[10px] text-emerald-300">
                    <Check className="size-3" /> terminée
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">
                    {series.missing === 1 ? "1 fiche manquante" : `${series.missing} fiches manquantes`}
                  </span>
                )}
              </div>
              <Progress
                value={series.percent}
                className="h-1.5"
                indicatorStyle={{
                  backgroundColor: series.complete
                    ? "oklch(0.75 0.15 160)"
                    : RARITY_MAP[series.topRarity].accent,
                }}
              />
            </div>

            {series.missing > 0 && (
              <p className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                <Sparkles className="size-3 shrink-0" />
                Pièce maîtresse : {series.rarest.name}
              </p>
            )}
          </Link>
        ))}
      </div>

      {!signedIn && (
        <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
          Vous consultez les séries en visiteur : la progression restera à zéro jusqu'à la création
          d'un compte.
        </p>
      )}

      <p className="text-muted-foreground text-xs">
        Progression totale : {formatNumber(totalOwned)} fiches réunies sur {formatNumber(CARDS.length)}.
      </p>
    </div>
  );
}
