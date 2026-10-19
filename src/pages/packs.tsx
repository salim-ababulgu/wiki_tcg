import * as React from "react";
import { Link } from "react-router-dom";
import { Coins, Gift, Package, PackageOpen, RotateCcw, Sparkles, Star, Wand2 } from "lucide-react";
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
import { PACK_PRICE, useGame } from "@/lib/game-store";
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
  const { profile, openPack, collection } = useGame();
  const [opened, setOpened] = React.useState<CardType[]>([]);
  const [revealed, setRevealed] = React.useState(0);
  const [busy, setBusy] = React.useState(false);

  const handleOpen = () => {
    if (profile.credits < PACK_PRICE) {
      toast.error("Crédits insuffisants — gagnez-en en duel ou revenez demain.");
      return;
    }
    const drawn = openPack();
    if (!drawn) {
      toast.error("Crédits insuffisants.");
      return;
    }
    setBusy(true);
    setOpened(drawn);
    setRevealed(0);

    drawn.forEach((_, index) => {
      window.setTimeout(() => {
        setRevealed(index + 1);
        if (index === drawn.length - 1) setBusy(false);
      }, 380 * (index + 1));
    });

    const best = drawn.reduce((a, b) =>
      RARITIES.indexOf(b.rarity) > RARITIES.indexOf(a.rarity) ? b : a,
    );
    if (["ultra-rare", "legendaire"].includes(best.rarity)) {
      window.setTimeout(
        () => toast.success(`${RARITY_MAP[best.rarity].label} : ${best.name} !`),
        380 * drawn.length + 200,
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
        description="Chaque paquet réserve cinq fiches tirées selon les taux d'apparition affichés. Les crédits se gagnent en duel, en complétant une édition ou avec la récompense quotidienne."
        actions={
          <Badge variant="secondary" className="h-8 gap-1.5 px-3">
            <Coins className="size-3.5 text-[var(--gold)]" /> {formatNumber(profile.credits)} crédits
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Zone d'ouverture */}
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[oklch(0.26_0.04_258)] via-[oklch(0.21_0.03_258)] to-[oklch(0.19_0.03_258)] p-6 sm:p-8">
            <div className="bg-grid absolute inset-0 opacity-20" />

            {opened.length === 0 ? (
              <div className="relative flex flex-col items-center gap-5 py-10 text-center">
                <div className="animate-float-slow relative grid size-28 place-items-center rounded-2xl border border-white/20 bg-gradient-to-br from-[oklch(0.82_0.15_85/0.25)] to-[oklch(0.6_0.15_45/0.15)] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]">
                  <Package className="size-12 text-[oklch(0.85_0.12_85)]" strokeWidth={1.3} />
                </div>
                <div className="space-y-1">
                  <h2 className="font-display text-xl font-bold">Prêt à découvrir vos fiches ?</h2>
                  <p className="text-muted-foreground mx-auto max-w-sm text-sm">
                    Un paquet standard contient {PACK_TYPES[0].cards} cartes pour{" "}
                    {formatNumber(PACK_PRICE)} crédits.
                  </p>
                </div>
                <p className="mx-auto max-w-md rounded-lg border border-dashed px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                  Démo : le tirage a lieu dans votre navigateur et la collection n'est pas
                  enregistrée sur un serveur. Les crédits sont décoratifs.
                </p>
                <Button size="lg" variant="gold" onClick={handleOpen} disabled={busy}>
                  <PackageOpen className="size-4" /> Ouvrir pour {formatNumber(PACK_PRICE)} crédits
                </Button>
              </div>
            ) : (
              <div className="relative space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-lg font-semibold">
                    {revealed < opened.length ? "Révélation…" : "Butin du paquet"}
                  </h2>
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
                    <Button variant="gold" onClick={handleOpen}>
                      <PackageOpen className="size-4" /> Ouvrir à nouveau
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/collection">Voir la collection</Link>
                    </Button>
                    <span className="text-muted-foreground ml-auto text-xs">
                      {opened.filter((card) => ["ultra-rare", "legendaire"].includes(card.rarity)).length >
                      0
                        ? "Tirage exceptionnel !"
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
                    <span className="text-muted-foreground text-xs font-normal">crédits</span>
                  </p>
                  <ul className="space-y-1.5">
                    {pack.perks.map((perk) => (
                      <li key={perk} className="text-muted-foreground flex items-center gap-1.5 text-xs">
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
              {RARITIES.map((rarity) => (
                <div key={rarity} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <RarityBadge rarity={rarity} withLabel />
                    <span className="text-muted-foreground tabular-nums">
                      {(RARITY_MAP[rarity].dropRate * 100).toFixed(1)} %
                    </span>
                  </div>
                  <Progress
                    value={RARITY_MAP[rarity].dropRate * 100}
                    className="h-1"
                    indicatorStyle={{ backgroundColor: RARITY_MAP[rarity].accent }}
                  />
                </div>
              ))}
              <Separator className="my-2" />
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Les taux sont indépendants par carte. Un paquet contient toujours cinq fiches.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/60">
            <CardHeader>
              <CardTitle className="font-display text-sm">Vos statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Paquets ouverts" value={formatNumber(profile.packsOpened)} />
              <Row label="Cartes possédées" value={formatNumber(collection.length)} />
              <Row label="Crédits restants" value={formatNumber(profile.credits)} />
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
