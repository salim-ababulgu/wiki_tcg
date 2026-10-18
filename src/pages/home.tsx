import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookMarked,
  Library,
  PackageOpen,
  Sparkles,
  Swords,
  Trophy,
} from "lucide-react";
import { CardTile } from "@/components/card-tile";
import { CardArt } from "@/components/card-art";
import { RarityBadge } from "@/components/rarity-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CARDS, SETS } from "@/data/cards";
import { useGame } from "@/lib/game-store";
import { RARITIES, RARITY_MAP } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

const FEATURED = ["legendaire", "ultra-rare", "super-rare"].flatMap((rarity) =>
  CARDS.filter((card) => card.rarity === rarity).slice(0, 2),
);

const STEPS = [
  {
    icon: PackageOpen,
    title: "Ouvrez des paquets",
    text: "Chaque paquet contient cinq fiches tirées selon des taux d'apparition publics.",
  },
  {
    icon: Library,
    title: "Complétez votre encyclopédie",
    text: "Rangez vos cartes par édition, époque et catégorie, puis suivez votre progression.",
  },
  {
    icon: Swords,
    title: "Affrontez d'autres curieux",
    text: "Posez trois cartes, comparez Savoir, Influence et Singularité, remportez la manche.",
  },
];

export function HomePage() {
  const { collection, ownedIds, profile } = useGame();
  const progress = Math.round((ownedIds.size / CARDS.length) * 100);

  return (
    <div className="space-y-16">
      {/* ——— Héros ——— */}
      <section className="relative grid gap-10 overflow-x-clip pt-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/10 text-primary">
            <Sparkles className="size-3" />
            Saison 1 — Les Origines
          </Badge>

          <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl xl:text-6xl">
            Collectionnez les{" "}
            <span className="bg-gradient-to-r from-[oklch(0.82_0.15_85)] via-[oklch(0.78_0.16_60)] to-[oklch(0.7_0.14_40)] bg-clip-text text-transparent">
              savoirs du monde
            </span>
            , une fiche à la fois.
          </h1>

          <p className="text-muted-foreground max-w-xl text-[15px] leading-relaxed text-balance">
            WikiTCG transforme les grandes idées, les lieux et les récits en cartes à collectionner.
            Ouvrez des paquets, complétez {SETS.length} éditions et défiez d'autres collectionneurs
            dans des duels de connaissances.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/explorer">
                Explorer le catalogue <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/paquets">
                <PackageOpen className="size-4" /> Ouvrir un paquet
              </Link>
            </Button>
          </div>

          <dl className="grid max-w-lg grid-cols-3 gap-4 border-t pt-6">
            {[
              { label: "Fiches", value: String(CARDS.length) },
              { label: "Éditions", value: String(SETS.length) },
              { label: "Raretés", value: String(RARITIES.length) },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-muted-foreground text-[11px] tracking-[0.14em] uppercase">
                  {stat.label}
                </dt>
                <dd className="font-display text-2xl font-bold tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Empilement de cartes */}
        <div className="relative mx-auto flex h-[380px] w-full max-w-md scale-[0.92] items-center justify-center sm:scale-100">
          {FEATURED.slice(0, 3).map((card, index) => (
            <Link
              key={card.id}
              to={`/carte/${card.slug}`}
              className="group absolute transition-[filter] duration-500 hover:z-30 hover:drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)]"
              style={{
                transform: `rotate(${(index - 1) * 9}deg) translateX(${(index - 1) * 72}px)`,
                zIndex: 10 - index,
              }}
            >
              <div className="animate-float-slow" style={{ animationDelay: `${index * 0.6}s` }}>
                <div
                  className="w-[210px] overflow-hidden rounded-xl border bg-card shadow-[0_28px_60px_-24px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:scale-[1.04] sm:w-[230px]"
                  style={{
                    borderColor: `color-mix(in oklch, ${RARITY_MAP[card.rarity].accent} 45%, var(--border))`,
                  }}
                >
                  <CardArt card={card} className="h-52" glyphClassName="size-16" />
                  <div className="space-y-1 p-3">
                    <div className="flex items-center justify-between">
                      <RarityBadge rarity={card.rarity} withLabel />
                      <span className="text-muted-foreground text-[10px]">{card.number}</span>
                    </div>
                    <p className="font-display truncate text-sm font-semibold">{card.name}</p>
                    <p className="text-muted-foreground truncate text-[11px]">{card.origin}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ——— Progression ——— */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
        <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/15 text-primary grid size-12 shrink-0 place-items-center rounded-xl">
              <BookMarked className="size-6" />
            </div>
            <div>
              <p className="font-display font-semibold">Votre encyclopédie</p>
              <p className="text-muted-foreground text-sm">
                {ownedIds.size} fiches sur {CARDS.length} — niveau {profile.level} ·{" "}
                {formatNumber(profile.xp)} XP
              </p>
            </div>
          </div>
          <div className="flex w-full max-w-sm items-center gap-3">
            <Progress value={progress} className="h-2.5" />
            <span className="w-10 text-right text-sm font-semibold tabular-nums">{progress}%</span>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/collection">
              Voir ma collection <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* ——— Échelle des raretés ——— */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">L'échelle des raretés</h2>
            <p className="text-muted-foreground text-sm">
              Les taux indiqués sont ceux d'un paquet standard de cinq cartes.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RARITIES.map((rarity) => {
            const info = RARITY_MAP[rarity];
            const count = CARDS.filter((card) => card.rarity === rarity).length;
            return (
              <div
                key={rarity}
                className="flex items-center gap-3 rounded-xl border bg-card/60 p-3"
                style={{ borderColor: `color-mix(in oklch, ${info.accent} 28%, var(--border))` }}
              >
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-xs font-bold"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${info.accent} 16%, transparent)`,
                    color: info.accent,
                  }}
                >
                  {info.short}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{info.label}</p>
                  <p className="text-muted-foreground text-[11px]">
                    {count} fiches · {Math.round(info.dropRate * 1000) / 10} % des tirages
                  </p>
                </div>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {formatNumber(info.baseValue)} cr.
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ——— Sélection ——— */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Pièces maîtresses</h2>
            <p className="text-muted-foreground text-sm">
              Quelques fiches parmi les plus recherchées de la saison.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/explorer?tri=valeur">
              Tout le catalogue <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {FEATURED.slice(0, 8).map((card) => (
            <CardTile key={card.id} card={card} owned={ownedIds.has(card.id)} />
          ))}
        </div>
      </section>

      {/* ——— Comment jouer ——— */}
      <section className="space-y-6">
        <h2 className="font-display text-xl font-semibold">Comment jouer</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Card key={step.title} className="bg-card/60">
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="bg-accent text-accent-foreground grid size-10 place-items-center rounded-lg">
                    <step.icon className="size-5" />
                  </div>
                  <span className="font-display text-muted-foreground/40 text-3xl font-bold">
                    0{index + 1}
                  </span>
                </div>
                <p className="font-display font-semibold">{step.title}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[oklch(0.3_0.06_258)] to-[oklch(0.22_0.04_258)] p-8 sm:p-10">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold">Prêt à compléter votre première édition ?</h2>
            <p className="text-muted-foreground max-w-lg text-sm">
              Votre compte de démonstration contient déjà {collection.length} cartes et 4 200
              crédits. De quoi ouvrir quelques paquets et tester un duel.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="gold" size="lg">
              <Link to="/paquets">
                <PackageOpen className="size-4" /> Ouvrir un paquet
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/classement">
                <Trophy className="size-4" /> Classement
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
