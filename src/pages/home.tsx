import { Link, Navigate } from "react-router-dom";
import { useGame } from "@/lib/game-store";
import { CardLink } from "@/components/card-link";
import {
  ArrowRight,
  BookOpen,
  Layers,
  PackageOpen,
  Sparkles,
  Star,
  Swords,
  Trophy,
} from "lucide-react";
import { CardArt } from "@/components/card-art";
import { CardTile } from "@/components/card-tile";
import { RarityBadge } from "@/components/rarity-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CARDS, SETS } from "@/data/cards";
import { RARITIES, RARITY_MAP, type Card as CardType } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

const RARE_FIRST = ["legendaire", "ultra-rare", "super-rare"] as const;
const FEATURED: CardType[] = RARE_FIRST.flatMap((rarity) =>
  CARDS.filter((card) => card.rarity === rarity).slice(0, 2),
);

const STEPS = [
  {
    icon: PackageOpen,
    title: "Ouvrez un paquet",
    text: "Un paquet gratuit toutes les 10 minutes, jusqu'à 10 en réserve. Cinq fiches par paquet.",
  },
  {
    icon: Layers,
    title: "Complétez vos séries",
    text: "Chaque fiche appartient à une série. Le site vous dit toujours ce qu'il vous manque.",
  },
  {
    icon: Star,
    title: "Tombez sur une rare",
    text: "Une légendaire apparaît une fois sur cent paquets. C'est là que le cœur s'accélère.",
  },
];


export function HomePage() {
  const { signedIn } = useGame();
  // Un joueur connecté n'a plus rien à faire sur une page de présentation.
  if (signedIn) return <Navigate to="/explorer" replace />;

  return (
    <div className="space-y-20">
      {/* ——— Héros ——— */}
      <section className="grid gap-10 pt-2 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/10 text-primary">
            <Sparkles className="size-3" />
            Saison 1 — Les Origines
          </Badge>

          <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl xl:text-[3.6rem]">
            Collectionnez les{" "}
            <span className="bg-gradient-to-r from-[oklch(0.82_0.15_85)] via-[oklch(0.78_0.16_60)] to-[oklch(0.7_0.14_40)] bg-clip-text text-transparent">
              savoirs du monde
            </span>
            , une fiche à la fois.
          </h1>

          <p className="text-muted-foreground max-w-xl text-[15px] leading-relaxed text-balance">
            Des cartes à collectionner dont chaque sujet est une fiche encyclopédique : un animal,
            un monument, une œuvre, une idée. Ouvrez des paquets, découvrez des raretés et complétez
            vos séries, {SETS.length} éditions à couvrir.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/inscription">
                Créer mon compte <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/explorer">
                <BookOpen className="size-4" /> Voir les cartes
              </Link>
            </Button>
          </div>

          <p className="text-muted-foreground text-xs">
            Gratuit · Un paquet toutes les 10 minutes, jusqu'à 10 en réserve · Prototype : rien
            n'est enregistré sur un serveur.
          </p>

          <dl className="grid max-w-lg grid-cols-3 gap-4 border-t pt-6">
            {[
              { label: "Fiches", value: String(CARDS.length) },
              { label: "Séries", value: String(SETS.length) },
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

        {/* Deck de démonstration */}
        <div className="relative mx-auto flex h-[380px] w-full max-w-md scale-[0.92] items-center justify-center sm:scale-100">
          {FEATURED.slice(0, 3).map((card, index) => (
            <CardLink
              key={card.id}
              slug={card.slug}
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
            </CardLink>
          ))}
        </div>
      </section>

      {/* ——— Comment ça marche ——— */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Comment ça marche</h2>
            <p className="text-muted-foreground text-sm">
              Une boucle simple : ouvrir, compléter, recommencer.
            </p>
          </div>
          <Badge variant="secondary" className="text-[11px]">
            <Trophy className="size-3" /> Les duels arrivent en bonus
          </Badge>
        </div>
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

      {/* ——— Raretés ——— */}
      <section className="space-y-5">
        <div>
          <h2 className="font-display text-xl font-semibold">Six niveaux de rareté</h2>
          <p className="text-muted-foreground text-sm">
            Les taux indiqués sont ceux d'un paquet standard de cinq cartes.
          </p>
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
                    {count} fiches · {(info.dropRate * 100).toFixed(1)} % des tirages
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

      {/* ——— Extraits ——— */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Quelques pièces maîtresses</h2>
            <p className="text-muted-foreground text-sm">
              Les fiches les plus recherchées de la saison. Cliquez pour la fiche complète.
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
            <CardTile key={card.id} card={card} />
          ))}
        </div>
      </section>

      {/* ——— Appel final ——— */}
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[oklch(0.3_0.06_258)] to-[oklch(0.22_0.04_258)] p-8 sm:p-10">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold">
              Votre première série commence maintenant
            </h2>
            <p className="text-muted-foreground max-w-lg text-sm">
              Créez un compte, ouvrez un paquet et regardez ce qu'il vous manque. Aucune carte
              bancaire, aucun engagement.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="gold" size="lg">
              <Link to="/inscription">
                <Sparkles className="size-4" /> Créer mon compte
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/connexion">
                <Swords className="size-4" /> J'ai déjà un compte
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
