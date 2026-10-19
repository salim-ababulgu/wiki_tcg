import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Coins,
  Eye,
  Lock,
  Package,
  Sparkles,
  Trophy,
} from "lucide-react";
import { CardArt } from "@/components/card-art";
import { RarityBadge } from "@/components/rarity-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { seriesBySlug } from "@/data/series";
import { useGame } from "@/lib/game-store";
import { RARITY_MAP } from "@/lib/types";
import { cn, formatNumber, plural } from "@/lib/utils";
import { NotFoundPage } from "@/pages/not-found";

export function SeriesDetailPage() {
  const { slug = "" } = useParams();
  const series = seriesBySlug(slug);
  const { signedIn, ownedIds, owns } = useGame();

  if (!series) return <NotFoundPage />;

  const ownedCards = signedIn ? series.cards.filter((card) => owns(card.id)) : [];
  const missing = series.cards.filter((card) => !ownedCards.includes(card));
  const percent = Math.round((ownedCards.length / series.total) * 100);
  const complete = ownedCards.length === series.total;
  const topAccent = RARITY_MAP[series.topRarity].accent;
  const missingRares = missing
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/series">
            <ArrowLeft className="size-4" /> Toutes les séries
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-muted-foreground text-xs">
          Série · {plural(series.total, "fiche")}
        </span>
      </div>

      {/* Bandeau de série */}
      <div
        className="relative overflow-hidden rounded-2xl border p-6 sm:p-8"
        style={{
          borderColor: `color-mix(in oklch, ${topAccent} 30%, var(--border))`,
          background: `linear-gradient(135deg, color-mix(in oklch, ${topAccent} 12%, transparent), transparent 60%)`,
        }}
      >
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-15" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <RarityBadge rarity={series.topRarity} withLabel />
              {complete && (
                <Badge className="gap-1 bg-emerald-500/15 text-[10px] text-emerald-300">
                  <Check className="size-3" /> série terminée
                </Badge>
              )}
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-balance">
              {series.name}
            </h1>
            <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
              {complete
                ? "Vous avez réuni toutes les fiches de cette série. Bravo."
                : `Il vous manque ${plural(missing.length, "fiche")} pour terminer cette série. Les cases vides indiquent ce qu'il reste à découvrir.`}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <p className="font-display text-4xl font-bold tabular-nums">
              {ownedCards.length}
              <span className="text-muted-foreground text-xl"> / {series.total}</span>
            </p>
            <Progress value={percent} className="h-2 w-48" indicatorStyle={{ backgroundColor: topAccent }} />
            <p className="text-muted-foreground text-xs tabular-nums">{percent} % complété</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Grille de la série */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Les fiches de la série</h2>
            <span className="text-muted-foreground text-xs">
              {ownedCards.length} possédées · {missing.length} manquantes
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {series.cards.map((card) => {
              const owned = signedIn && ownedIds.has(card.id);
              const accent = RARITY_MAP[card.rarity].accent;

              return (
                <Link
                  key={card.id}
                  to={`/carte/${card.slug}`}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-xl border transition-all",
                    owned
                      ? "bg-card hover:-translate-y-0.5"
                      : "border-dashed bg-card/30 hover:border-primary/40",
                  )}
                  style={{
                    borderColor: owned
                      ? `color-mix(in oklch, ${accent} 32%, var(--border))`
                      : undefined,
                  }}
                >
                  <div className="relative">
                    <CardArt
                      card={card}
                      className={cn("h-32 transition-all", !owned && "opacity-25 grayscale")}
                      glyphClassName="size-10"
                    />
                    {!owned && (
                      <div className="absolute inset-0 grid place-items-center">
                        <span className="grid size-9 place-items-center rounded-full bg-black/40 backdrop-blur-sm">
                          <Lock className="size-4 text-white/70" />
                        </span>
                      </div>
                    )}
                    {owned && (
                      <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300 ring-1 ring-emerald-500/40 backdrop-blur-sm">
                        <Check className="size-2.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-1 p-2.5">
                    <div className="flex items-center justify-between gap-1">
                      <RarityBadge rarity={card.rarity} />
                      <span className="text-muted-foreground font-mono text-[9px]">
                        {card.number.split("/")[0].trim()}
                      </span>
                    </div>
                    <p className={cn("truncate text-xs font-semibold", !owned && "text-muted-foreground")}>
                      {card.name}
                    </p>
                    {owned ? (
                      <p className="text-muted-foreground flex items-center gap-1 text-[10px] tabular-nums">
                        <Coins className="size-2.5" /> {formatNumber(card.value)}
                      </p>
                    ) : (
                      <p className="text-muted-foreground flex items-center gap-1 text-[10px]">
                        <Eye className="size-2.5" /> à découvrir
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Panneau latéral */}
        <aside className="space-y-4">
          {!complete && (
            <Card className="border-primary/25 bg-gradient-to-br from-primary/10 to-transparent">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2 text-sm">
                  <Package className="size-4" /> Combler les trous
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {missing.length === 1
                    ? "Une seule fiche manque : elle peut tomber dans le prochain paquet."
                    : `${plural(missing.length, "fiche")} manquantes. Les paquets restent le moyen le plus direct de les obtenir.`}
                </p>
                <Button asChild className="w-full" size="sm">
                  <Link to="/paquets">
                    <Package className="size-3.5" /> Ouvrir un paquet
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {complete && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2 text-sm">
                  <Trophy className="size-4 text-emerald-400" /> Série complétée
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Toutes les fiches de « {series.name} » sont dans votre collection.
                </p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/collection">Voir ma collection</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {missingRares.length > 0 && (
            <Card className="bg-card/60">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2 text-sm">
                  <Sparkles className="size-4" /> Les plus précieuses à trouver
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {missingRares.map((card) => (
                  <Link
                    key={card.id}
                    to={`/carte/${card.slug}`}
                    className="hover:bg-accent/40 flex items-center gap-2 rounded-md p-1.5"
                  >
                    <CardArt card={card} className="size-8 shrink-0 rounded" showGlyph={false} />
                    <span className="min-w-0 flex-1 truncate text-xs">{card.name}</span>
                    <span className="text-muted-foreground text-[10px] tabular-nums">
                      {formatNumber(card.value)}
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="bg-card/60">
            <CardContent className="space-y-2 pt-6 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fiches</span>
                <span className="font-medium tabular-nums">{series.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rareté maximale</span>
                <span className="font-medium">{RARITY_MAP[series.topRarity].label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Valeur de la série</span>
                <span className="font-medium tabular-nums">
                  {formatNumber(series.cards.reduce((sum, card) => sum + card.value, 0))} cr.
                </span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
