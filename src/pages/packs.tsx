import * as React from "react";
import { Link } from "react-router-dom";
import {
  Coins,
  Crown,
  Gift,
  Package,
  PackageOpen,
  RotateCcw,
  Sparkles,
  Star,
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
  PACK_PRICE,
  PACK_RESERVE_MAX,
  formatCountdown,
  useGame,
  useNow,
  type PackMode,
} from "@/lib/game-store";
import { cn, formatNumber } from "@/lib/utils";

const PACK_TYPES = [
  {
    id: "standard",
    name: "Paquet Standard",
    price: 900,
    cards: 5,
    perks: ["5 fiches", "Taux de base", "1 garantie peu commune ou mieux"],
    accent: "oklch(0.72 0.13 250)",
    highlight: false,
  },
  {
    id: "augmente",
    name: "Paquet Augmenté",
    price: 2200,
    cards: 5,
    perks: ["5 fiches", "Rare garanti", "Chances doublées en super rare"],
    accent: "oklch(0.68 0.17 300)",
    highlight: true,
  },
  {
    id: "prestige",
    name: "Coffret Prestige",
    price: 5000,
    cards: 8,
    perks: ["8 fiches", "Super rare garanti", "1 carte en édition prestige"],
    accent: "oklch(0.82 0.15 85)",
    highlight: false,
  },
];

export function PacksPage() {
  const { profile, openPack, collection, packsReady, nextPackAt, pro, interval } = useGame();
  const [opened, setOpened] = React.useState<CardType[]>([]);
  const [revealed, setRevealed] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [lastMode, setLastMode] = React.useState<PackMode>("gratuit");

  const now = useNow(true);
  const remaining = Math.max(0, nextPackAt - now);
  const full = packsReady >= PACK_RESERVE_MAX;

  const handleOpen = (mode: PackMode) => {
    const result = openPack(mode);
    if (!result.ok) {
      toast.error(
        result.reason === "reserve"
          ? "Aucun paquet gratuit disponible — patientez ou utilisez vos WikiCrédits."
          : "WikiCrédits insuffisants.",
      );
      return;
    }

    setLastMode(mode);
    setBusy(true);
    setOpened(result.cards);
    setRevealed(0);

    result.cards.forEach((_, index) => {
      window.setTimeout(() => {
        setRevealed(index + 1);
        if (index === result.cards.length - 1) setBusy(false);
      }, 380 * (index + 1));
    });

    const best = result.cards.reduce((a, b) =>
      RARITIES.indexOf(b.rarity) > RARITIES.indexOf(a.rarity) ? b : a,
    );
    if (["ultra-rare", "legendaire"].includes(best.rarity)) {
      window.setTimeout(
        () => toast.success(`${RARITY_MAP[best.rarity].label} : ${best.name} !`),
        380 * result.cards.length + 200,
      );
    }
  };

  const revealAll = () => {
    setRevealed(opened.length);
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Paquets"
        title="Ouvrir un paquet"
        description="Un paquet gratuit arrive toutes les 10 minutes, et vous pouvez en garder jusqu'à 10. Pressé ? Ouvrez-en un tout de suite avec vos WikiCrédits — le contenu et les taux sont identiques."
        actions={
          <Badge variant="secondary" className="h-8 gap-1.5 px-3">
            <Coins className="size-3.5 text-[var(--gold)]" /> {formatNumber(profile.credits)}{" "}
            WikiCrédits
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Réserve de paquets gratuits */}
          <Card className="overflow-hidden border-primary/25 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/15 text-primary grid size-12 shrink-0 place-items-center rounded-xl">
                    <Package className="size-6" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] tracking-[0.14em] uppercase">
                      Paquets gratuits en réserve
                    </p>
                    <p className="font-display text-3xl font-bold tabular-nums">
                      {packsReady}
                      <span className="text-muted-foreground text-lg"> / {PACK_RESERVE_MAX}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
                  <Timer className="text-muted-foreground size-4" />
                  <span className="text-muted-foreground text-xs">
                    {full ? "Réserve pleine" : "Prochain dans"}
                  </span>
                  <span className="font-mono text-sm font-semibold tabular-nums">
                    {full ? "—" : formatCountdown(remaining)}
                  </span>
                </div>
              </div>

              {/* Dix emplacements, remplis de gauche à droite */}
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

              {!full && (
                <div className="space-y-1">
                  <Progress
                    value={((interval - remaining) / interval) * 100}
                    className="h-1.5"
                  />
                  <p className="text-muted-foreground text-[11px]">
                    Rythme actuel : un paquet toutes les {Math.round(interval / 60000)} minutes
                    {pro ? " (abonnement actif)" : ""}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zone d'ouverture / révélation */}
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
                      ? `Vous avez ${packsReady} paquet${packsReady > 1 ? "s" : ""} en réserve`
                      : "Patience, ça pousse…"}
                  </h2>
                  <p className="text-muted-foreground mx-auto max-w-md text-sm">
                    {packsReady > 0
                      ? "Chaque paquet contient cinq fiches, révélées de la plus commune à la plus rare."
                      : "Aucun paquet disponible pour l'instant. Vous pouvez en ouvrir un tout de suite avec vos WikiCrédits."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    size="lg"
                    variant="gold"
                    onClick={() => handleOpen("gratuit")}
                    disabled={busy || packsReady <= 0}
                  >
                    <PackageOpen className="size-4" /> Ouvrir le paquet gratuit
                    {packsReady > 0 ? ` (${packsReady})` : ""}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleOpen("credits")}
                    disabled={busy || profile.credits < PACK_PRICE}
                  >
                    <Coins className="size-4" /> Ouvrir maintenant · {formatNumber(PACK_PRICE)}
                  </Button>
                </div>

                <p className="text-muted-foreground mx-auto max-w-md rounded-lg border border-dashed px-3 py-2 text-[11px] leading-relaxed">
                  Démo : le minuteur et le tirage sont simulés dans votre navigateur, rien n'est
                  enregistré sur un serveur. Les WikiCrédits sont décoratifs.
                </p>
              </div>
            ) : (
              <div className="relative space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-semibold">
                      {revealed < opened.length ? "Révélation…" : "Butin du paquet"}
                    </h2>
                    <Badge variant="outline" className="text-[10px]">
                      {lastMode === "gratuit" ? "Paquet gratuit" : "WikiCrédits"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {revealed < opened.length && (
                      <Button variant="outline" size="sm" onClick={revealAll}>
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
                    {packsReady > 0 && (
                      <Button variant="gold" onClick={() => handleOpen("gratuit")}>
                        <PackageOpen className="size-4" /> Ouvrir un autre gratuit ({packsReady})
                      </Button>
                    )}
                    <Button
                      variant={packsReady > 0 ? "outline" : "gold"}
                      onClick={() => handleOpen("credits")}
                      disabled={profile.credits < PACK_PRICE}
                    >
                      <Coins className="size-4" /> Ouvrir · {formatNumber(PACK_PRICE)} WikiCrédits
                    </Button>
                    <span className="text-muted-foreground ml-auto text-xs">
                      {packsReady === 0 && !full
                        ? `Prochain gratuit dans ${formatCountdown(remaining)}`
                        : "Nouveau tirage disponible"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Formules */}
          <div className="grid gap-4 md:grid-cols-3">
            {PACK_TYPES.map((pack) => (
              <Card
                key={pack.id}
                className={cn("relative overflow-hidden bg-card/60", pack.highlight && "ring-1")}
                style={{
                  borderColor: `color-mix(in oklch, ${pack.accent} 30%, var(--border))`,
                  boxShadow: pack.highlight
                    ? `0 0 0 1px color-mix(in oklch, ${pack.accent} 40%, transparent)`
                    : undefined,
                }}
              >
                {pack.highlight && (
                  <Badge
                    className="absolute top-3 right-3 text-[10px]"
                    style={{ backgroundColor: pack.accent, color: "oklch(0.2 0.02 260)" }}
                  >
                    Populaire
                  </Badge>
                )}
                <CardHeader>
                  <div
                    className="grid size-9 place-items-center rounded-lg"
                    style={{
                      backgroundColor: `color-mix(in oklch, ${pack.accent} 16%, transparent)`,
                      color: pack.accent,
                    }}
                  >
                    <Gift className="size-4.5" />
                  </div>
                  <CardTitle className="font-display mt-2 text-base">{pack.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="font-display flex items-baseline gap-1 text-2xl font-bold">
                    {formatNumber(pack.price)}
                    <span className="text-muted-foreground text-xs font-normal">WikiCrédits</span>
                  </p>
                  <ul className="space-y-1.5">
                    {pack.perks.map((perk) => (
                      <li
                        key={perk}
                        className="text-muted-foreground flex items-center gap-1.5 text-xs"
                      >
                        <Star className="size-3" style={{ color: pack.accent }} /> {perk}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={pack.highlight ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => toast.info("Formule disponible dans la version complète.")}
                  >
                    Choisir
                  </Button>
                </CardContent>
              </Card>
            ))}
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
                Les taux sont identiques pour le paquet gratuit et le paquet payant : on paie le
                temps, jamais la chance.
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
                L'abonnement accélère seulement les paquets gratuits — il ne change jamais les
                chances. Réglable dans le profil (démo).
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
              <Row label="Paquets ouverts" value={formatNumber(profile.packsOpened)} />
              <Row label="Cartes possédées" value={formatNumber(collection.length)} />
              <Row label="WikiCrédits" value={formatNumber(profile.credits)} />
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
