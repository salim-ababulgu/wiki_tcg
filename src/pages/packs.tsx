import * as React from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Crown,
  Package,
  PackageOpen,
  RotateCcw,
  Sparkles,
  Timer,
  Wand2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { CardArt } from "@/components/card-art";
import { PageHeader } from "@/components/page-header";
import { RarityBadge } from "@/components/rarity-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { RARITIES, RARITY_MAP, type Card as CardType } from "@/lib/types";
import {
  FREE_INTERVAL_MS,
  PACK_RESERVE_MAX,
  formatCountdown,
  useGame,
  useNow,
} from "@/lib/game-store";
import { cn } from "@/lib/utils";

export function PacksPage() {
  const { openPack, collection, packsReady, nextPackAt, pro, interval, profile } = useGame();
  const now = useNow(true);

  const [opened, setOpened] = React.useState<CardType[]>([]);
  const [revealed, setRevealed] = React.useState(0);
  const [busy, setBusy] = React.useState(false);

  const full = packsReady >= PACK_RESERVE_MAX;
  const remaining = full ? 0 : Math.max(0, nextPackAt - now);

  const handleOpen = () => {
    if (packsReady <= 0) {
      toast.error("Aucun paquet en réserve — le prochain arrive bientôt.");
      return;
    }
    const cards = openPack();
    if (!cards) {
      toast.error("Aucun paquet en réserve.");
      return;
    }

    setBusy(true);
    setOpened(cards);
    setRevealed(0);

    cards.forEach((_, index) => {
      window.setTimeout(() => {
        setRevealed(index + 1);
        if (index === cards.length - 1) setBusy(false);
      }, 380 * (index + 1));
    });

    const best = cards.reduce((a, b) =>
      RARITIES.indexOf(b.rarity) > RARITIES.indexOf(a.rarity) ? b : a,
    );
    if (["ultra-rare", "legendaire"].includes(best.rarity)) {
      window.setTimeout(
        () => toast.success(`${RARITY_MAP[best.rarity].label} : ${best.name} !`),
        380 * cards.length + 200,
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Paquets"
        title="Ouvrir un paquet"
        description={`Un paquet gratuit toutes les ${Math.round(FREE_INTERVAL_MS / 60000)} minutes. Vous pouvez en garder jusqu'à ${PACK_RESERVE_MAX} : le minuteur continue de tourner tant que la réserve n'est pas pleine.`}
        actions={
          <Badge variant="secondary" className="h-8 gap-1.5 px-3">
            <Package className="size-3.5" /> {packsReady} / {PACK_RESERVE_MAX} en réserve
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Réserve */}
          <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "grid size-12 shrink-0 place-items-center rounded-xl",
                      full ? "bg-[oklch(0.82_0.15_85/0.18)] text-[var(--gold)]" : "bg-primary/15 text-primary",
                    )}
                  >
                    <Package className="size-6" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] tracking-[0.14em] uppercase">
                      Paquets en réserve
                    </p>
                    <p className="font-display text-3xl font-bold tabular-nums">
                      {packsReady}
                      <span className="text-muted-foreground text-lg"> / {PACK_RESERVE_MAX}</span>
                    </p>
                  </div>
                </div>

                {full ? (
                  <div className="flex items-center gap-2 rounded-lg border border-[oklch(0.82_0.15_85/0.4)] px-3 py-2 text-[var(--gold)]">
                    <CheckCircle2 className="size-4" />
                    <span className="text-xs font-medium">
                      Réserve pleine — le minuteur est à l'arrêt
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
                    <Timer className="text-muted-foreground size-4" />
                    <span className="text-muted-foreground text-xs">Prochain dans</span>
                    <span className="font-mono text-sm font-semibold tabular-nums">
                      {formatCountdown(remaining)}
                    </span>
                  </div>
                )}
              </div>

              {/* Dix emplacements */}
              <div className="flex flex-wrap items-center gap-1.5">
                {Array.from({ length: PACK_RESERVE_MAX }).map((_, index) => (
                  <span
                    key={index}
                    className={cn(
                      "grid size-6 place-items-center rounded-md border transition-colors",
                      index < packsReady
                        ? "border-[oklch(0.82_0.15_85/0.5)] bg-[oklch(0.82_0.15_85/0.18)] text-[var(--gold)]"
                        : "text-muted-foreground/40 border-dashed",
                    )}
                  >
                    <Package className="size-3" />
                  </span>
                ))}
              </div>

              {!full ? (
                <div className="space-y-1">
                  <Progress value={((interval - remaining) / interval) * 100} className="h-1.5" />
                  <p className="text-muted-foreground text-[11px]">
                    Un paquet toutes les {Math.round(interval / 60000)} minutes
                    {pro ? " (abonnement actif)" : ""} · prochain à {formatCountdown(remaining)}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-[11px]">
                  Ouvrez un paquet pour libérer une place : le compte à rebours repartira
                  immédiatement.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Zone d'ouverture */}
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[oklch(0.26_0.04_258)] via-[oklch(0.21_0.03_258)] to-[oklch(0.19_0.03_258)] p-6 sm:p-8">
            <div className="bg-grid absolute inset-0 opacity-20" />

            {opened.length === 0 ? (
              <div className="relative flex flex-col items-center gap-5 py-8 text-center">
                <div className="animate-float-slow relative grid size-28 place-items-center rounded-2xl border border-white/20 bg-gradient-to-br from-[oklch(0.82_0.15_85/0.25)] to-[oklch(0.6_0.15_45/0.15)] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]">
                  <Package className="size-12 text-[oklch(0.85_0.12_85)]" strokeWidth={1.3} />
                </div>

                <div className="space-y-1">
                  <h2 className="font-display text-xl font-bold">
                    {packsReady > 0
                      ? `${packsReady} paquet${packsReady > 1 ? "s" : ""} à ouvrir`
                      : "Aucun paquet pour l'instant"}
                  </h2>
                  <p className="text-muted-foreground mx-auto max-w-md text-sm">
                    {packsReady > 0
                      ? "Cinq fiches, révélées de la plus commune à la plus rare."
                      : `Le prochain arrive dans ${formatCountdown(remaining)}. Vous pouvez quitter la page, il vous attendra.`}
                  </p>
                </div>

                <Button size="lg" variant="gold" onClick={handleOpen} disabled={busy || packsReady <= 0}>
                  <PackageOpen className="size-4" /> Ouvrir un paquet
                </Button>

                <p className="text-muted-foreground mx-auto max-w-md rounded-lg border border-dashed px-3 py-2 text-[11px] leading-relaxed">
                  Démo : le minuteur et le tirage sont simulés dans votre navigateur, rien n'est
                  enregistré sur un serveur.
                </p>
              </div>
            ) : (
              <div className="relative space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-lg font-semibold">
                    {revealed < opened.length ? "Révélation…" : "Butin du paquet"}
                  </h2>
                  <div className="flex items-center gap-2">
                    {revealed < opened.length && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRevealed(opened.length);
                          setBusy(false);
                        }}
                      >
                        <Wand2 className="size-3.5" /> Tout révéler
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setOpened([]);
                        setRevealed(0);
                      }}
                    >
                      <RotateCcw className="size-3.5" /> Terminer
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {opened.map((card, index) => {
                    const isRevealed = index < revealed;
                    const accent = RARITY_MAP[card.rarity].accent;
                    return (
                      <div
                        key={`${card.id}-${index}`}
                        className={cn(
                          "relative overflow-hidden rounded-xl border transition-all duration-500",
                          isRevealed
                            ? "animate-rise-in opacity-100"
                            : "scale-95 border-dashed opacity-40",
                        )}
                        style={{
                          borderColor: isRevealed
                            ? `color-mix(in oklch, ${accent} 55%, transparent)`
                            : undefined,
                          boxShadow: isRevealed
                            ? `0 0 26px -8px color-mix(in oklch, ${accent} 65%, transparent)`
                            : undefined,
                        }}
                      >
                        {isRevealed ? (
                          <Link to={`/carte/${card.slug}`} className="block">
                            <CardArt card={card} className="h-28" glyphClassName="size-10" />
                            <div className="space-y-1 p-2">
                              <RarityBadge rarity={card.rarity} />
                              <p className="truncate text-xs font-semibold">{card.name}</p>
                              <p className="text-muted-foreground truncate text-[10px]">
                                {card.era}
                              </p>
                            </div>
                          </Link>
                        ) : (
                          <div className="grid h-full min-h-[168px] place-items-center">
                            <Sparkles className="text-muted-foreground/50 size-6 animate-pulse" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {revealed >= opened.length && (
                  <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                    <Button variant="gold" onClick={handleOpen} disabled={packsReady <= 0}>
                      <PackageOpen className="size-4" /> Ouvrir un autre ({packsReady})
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/collection">Voir la collection</Link>
                    </Button>
                    <span className="text-muted-foreground ml-auto text-xs">
                      {full
                        ? "Réserve pleine"
                        : packsReady === 0
                          ? `Prochain dans ${formatCountdown(remaining)}`
                          : `${packsReady} en réserve`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Colonne latérale */}
        <aside className="space-y-4">
          <Card className="bg-card/60">
            <CardHeader>
              <CardTitle className="font-display text-sm">Taux d'apparition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {RARITIES.map((rarity) => {
                const rate = RARITY_MAP[rarity].dropRate;
                return (
                  <div key={rarity} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <RarityBadge rarity={rarity} withLabel />
                      <span className="text-muted-foreground tabular-nums">
                        {(rate * 100).toFixed(1)} %
                      </span>
                    </div>
                    <Progress
                      value={rate * 100}
                      className="h-1"
                      indicatorStyle={{ backgroundColor: RARITY_MAP[rarity].accent }}
                    />
                    <p className="text-muted-foreground text-[10px]">
                      environ 1 paquet sur {Math.round(1 / rate)}
                    </p>
                  </div>
                );
              })}
              <Separator className="my-2" />
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Il n'existe qu'une seule façon d'ouvrir un paquet : attendre. Aucun paquet ne
                s'achète.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/60">
            <CardHeader>
              <CardTitle className="font-display text-sm">Comment ça marche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs leading-relaxed text-muted-foreground">
              <p>
                <span className="text-foreground font-medium">Un paquet toutes les 10 minutes.</span>{" "}
                Tant que la réserve n'est pas pleine, le minuteur tourne.
              </p>
              <p>
                <span className="text-foreground font-medium">Jusqu'à 10 en réserve.</span> Vous
                pouvez laisser passer une nuit : vous ne perdrez rien, mais vous n'aurez jamais plus
                de 10.
              </p>
              <p>
                <span className="text-foreground font-medium">Réserve pleine : plus de minuteur.</span>{" "}
                Ouvrez un paquet pour libérer une place et relancer le décompte.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/60">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2 text-sm">
                <Crown className="size-4 text-[var(--gold)]" /> Abonnement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground text-xs leading-relaxed">
                L'abonnement accélère le minuteur : un paquet toutes les 3 minutes. Il ne change
                jamais les chances de tirage.
              </p>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-muted-foreground text-xs">Statut</span>
                <Badge variant={pro ? "default" : "secondary"} className="text-[10px]">
                  {pro ? "Actif — 3 min" : "Inactif — 10 min"}
                </Badge>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/profil">
                  <Zap className="size-3.5" /> Gérer dans le profil
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/60">
            <CardHeader>
              <CardTitle className="font-display text-sm">Vos statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Paquets ouverts" value={String(profile.packsOpened)} />
              <Row label="Cartes possédées" value={String(collection.length)} />
              <Row label="Niveau" value={String(profile.level)} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
