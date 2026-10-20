import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Crown,
  ExternalLink,
  PackageOpen,
  RotateCcw,
  Timer,
  Wand2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { WikiPhoto } from "@/components/wiki-photo";
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

const FLIP_STAGGER_MS = 150;
const TEAR_MS = 620;

export function PacksPage() {
  const {
    openPack,
    collection,
    packsReady,
    nextPackAt,
    pro,
    interval,
    profile,
    minor,
    streamer,
  } = useGame();
  const now = useNow(true);
  const navigate = useNavigate();
  const location = useLocation();

  const [opened, setOpened] = React.useState<CardType[]>([]);
  const [flipped, setFlipped] = React.useState<Set<number>>(new Set());
  const [tearing, setTearing] = React.useState(false);

  const full = packsReady >= PACK_RESERVE_MAX;
  const remaining = full ? 0 : Math.max(0, nextPackAt - now);
  const allFlipped = opened.length > 0 && flipped.size === opened.length;

  /** Le paquet est un objet : on le déchire avant de révéler quoi que ce soit. */
  const handleOpen = () => {
    if (tearing) return;
    if (packsReady <= 0) {
      toast.error("Aucun paquet en réserve — le prochain arrive bientôt.");
      return;
    }

    setTearing(true);
    window.setTimeout(() => {
      const cards = openPack();
      setTearing(false);
      if (!cards) {
        toast.error("Aucun paquet en réserve.");
        return;
      }
      setOpened(cards);
      setFlipped(new Set());
    }, TEAR_MS);
  };

  const flip = (index: number) => {
    setFlipped((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const flipAll = () => {
    opened.forEach((_, index) => {
      window.setTimeout(() => flip(index), index * FLIP_STAGGER_MS);
    });
  };

  const reset = () => {
    setOpened([]);
    setFlipped(new Set());
  };

  const openCard = (card: CardType) => {
    const existing = (location.state as { backgroundLocation?: unknown } | null)?.backgroundLocation;
    navigate(`/carte/${card.slug}`, { state: { backgroundLocation: existing ?? location } });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Paquets"
        title="Ouvrir un paquet"
        description={`Un paquet gratuit toutes les ${Math.round(FREE_INTERVAL_MS / 60000)} minutes, jusqu'à ${PACK_RESERVE_MAX} en réserve. Le minuteur tourne tant que la réserve n'est pas pleine.`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* Scène : paquet scellé, déchirure, cartes */}
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[oklch(0.26_0.04_258)] via-[oklch(0.21_0.03_258)] to-[oklch(0.19_0.03_258)] p-5 sm:p-8">
            <div className="bg-grid absolute inset-0 opacity-20" />

            {opened.length === 0 ? (
              <div className="relative flex flex-col items-center gap-5 py-6 text-center">
                {/* Le paquet lui-même, cliquable */}
                <button
                  type="button"
                  onClick={handleOpen}
                  disabled={packsReady <= 0 || tearing}
                  aria-label="Déchirer le paquet"
                  className={cn(
                    "group relative h-[230px] w-[160px] rounded-lg border-2 border-[oklch(0.82_0.15_85/0.45)] bg-gradient-to-b from-[oklch(0.32_0.05_70)] to-[oklch(0.2_0.03_60)] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.9)] transition-all duration-500",
                    packsReady > 0
                      ? "hover:-translate-y-1 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.95)]"
                      : "opacity-60",
                    tearing && "animate-[float-slow_0.6s_ease-in-out]",
                  )}
                >
                  {/* Perforation */}
                  <span className="absolute inset-x-2 top-3 flex justify-between">
                    {Array.from({ length: 14 }).map((_, index) => (
                      <span key={index} className="h-2 w-px bg-white/25" />
                    ))}
                  </span>
                  <span className="text-muted-foreground absolute top-6 right-2 text-[8px] tracking-[0.18em] uppercase">
                    déchirer ici
                  </span>

                  <span className="flex h-full flex-col items-center justify-center gap-3">
                    <img
                      src="/logo_wikitcg_back-card.png"
                      alt=""
                      width={64}
                      height={64}
                      className="size-16 rounded-lg"
                    />
                    <span className="font-display text-sm font-bold tracking-wide">WikiTCG</span>
                    <span className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase">
                      paquet de 5
                    </span>
                  </span>
                </button>

                <div className="space-y-1">
                  <h2 className="font-display text-lg font-bold">
                    {packsReady > 0
                      ? tearing
                        ? "Ouverture…"
                        : "Un paquet vous attend"
                      : "Aucun paquet pour l'instant"}
                  </h2>
                  <p className="text-muted-foreground mx-auto max-w-sm text-xs">
                    {packsReady > 0
                      ? "Cliquez sur le paquet pour le déchirer."
                      : `Le prochain arrive dans ${formatCountdown(remaining)}.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-lg font-semibold">
                      {allFlipped ? "Paquet ouvert" : "Retourne tes cartes"}
                    </h2>
                    <p className="text-muted-foreground text-[11px]">
                      {allFlipped
                        ? "Clique sur une carte pour voir sa fiche."
                        : `${flipped.size} / ${opened.length} retournée${flipped.size > 1 ? "s" : ""} — clique sur chaque carte.`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!allFlipped && (
                      <Button variant="outline" size="sm" onClick={flipAll}>
                        <Wand2 className="size-3.5" /> Tout retourner
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={reset}>
                      <RotateCcw className="size-3.5" /> Fermer
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {opened.map((card, index) => {
                    const isFlipped = flipped.has(index);
                    const accent = RARITY_MAP[card.rarity].accent;

                    return (
                      <div
                        key={`${card.id}-${index}`}
                        className="[perspective:1200px]"
                        style={{ aspectRatio: "3 / 4.3" }}
                      >
                        <button
                          type="button"
                          onClick={() => (isFlipped ? openCard(card) : flip(index))}
                          aria-label={
                            isFlipped ? `Ouvrir la fiche ${card.name}` : "Retourner cette carte"
                          }
                          className="relative size-full rounded-xl border transition-transform duration-700 ease-out [transform-style:preserve-3d] focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
                          style={{
                            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                            borderColor: isFlipped
                              ? `color-mix(in oklch, ${accent} 55%, transparent)`
                              : "color-mix(in oklch, var(--border) 80%, transparent)",
                            boxShadow: isFlipped
                              ? `0 0 30px -10px color-mix(in oklch, ${accent} 70%, transparent)`
                              : undefined,
                          }}
                        >
                          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-[oklch(0.3_0.03_258)] to-[oklch(0.2_0.03_258)] [backface-visibility:hidden]">
                            <span className="bg-grid pointer-events-none absolute inset-0 opacity-25" />
                            <img
                              src="/logo_wikitcg_back-card.png"
                              alt=""
                              width={48}
                              height={48}
                              className="size-12 rounded-lg opacity-70"
                            />
                            <span className="text-muted-foreground font-display text-[9px] tracking-[0.2em] uppercase">
                              WikiTCG
                            </span>
                          </span>

                          <span className="absolute inset-0 flex flex-col overflow-hidden rounded-xl bg-card [backface-visibility:hidden] [transform:rotateY(180deg)]">
                            <WikiPhoto
                              card={card}
                              blurred={card.sensitive && (minor || streamer)}
                              revealable={!minor}
                              className="h-[60%] w-full"
                              glyphClassName="size-10"
                              lazy={false}
                            />
                            <span className="flex flex-1 flex-col gap-1 p-2">
                              <RarityBadge rarity={card.rarity} />
                              <span className="line-clamp-2 text-xs leading-tight font-semibold">
                                {card.name}
                              </span>
                              <span className="text-muted-foreground mt-auto flex items-center gap-1 text-[9px]">
                                <ExternalLink className="size-2.5" /> voir la fiche
                              </span>
                            </span>
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                  <Button
                    variant="gold"
                    onClick={handleOpen}
                    disabled={!allFlipped || packsReady <= 0}
                    title={
                      allFlipped ? undefined : "Retournez toutes les cartes pour continuer"
                    }
                  >
                    <PackageOpen className="size-4" /> Paquet suivant ({packsReady})
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/collection">
                      <CheckCircle2 className="size-4" /> Ranger dans ma collection
                    </Link>
                  </Button>
                  <span className="text-muted-foreground ml-auto text-[11px]">
                    {allFlipped
                      ? "Les cinq cartes sont déjà dans votre collection."
                      : "Retournez les cartes pour débloquer la suite."}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Les deux compteurs, resserrés sous le paquet */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-card/60 px-4 py-3 text-center">
              <p className="font-display text-2xl font-bold tabular-nums">
                {packsReady}
                <span className="text-muted-foreground text-sm"> / {PACK_RESERVE_MAX}</span>
              </p>
              <p className="text-muted-foreground text-[11px]">paquets en réserve</p>
            </div>
            <div className="rounded-xl border bg-card/60 px-4 py-3 text-center">
              <p className="font-display flex items-center justify-center gap-1.5 text-2xl font-bold tabular-nums">
                <Timer className="text-muted-foreground size-4" />
                {full ? "—" : formatCountdown(remaining)}
              </p>
              <p className="text-muted-foreground text-[11px]">
                {full ? "réserve pleine" : "avant le prochain paquet"}
              </p>
            </div>
          </div>

          {!full && (
            <Progress value={((interval - remaining) / interval) * 100} className="h-1" />
          )}
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
