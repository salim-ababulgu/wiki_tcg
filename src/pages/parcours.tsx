import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  Compass,
  Cpu,
  Landmark,
  Lock,
  Palette,
  PawPrint,
  Sparkles,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CardArt } from "@/components/card-art";
import { CardTile } from "@/components/card-tile";
import { PageHeader } from "@/components/page-header";
import { RarityBadge } from "@/components/rarity-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CARD_BY_SLUG } from "@/data/cards";
import mapping from "@/data/parcours.generated.json";
import { useGame } from "@/lib/game-store";
import type { Card } from "@/lib/types";
import { cn, plural } from "@/lib/utils";
import { NotFoundPage } from "@/pages/not-found";

type ParcoursDef = {
  key: keyof typeof mapping;
  title: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  accent: string;
};

export const PARCOURS: ParcoursDef[] = [
  {
    key: "vivant",
    title: "Le vivant",
    tagline: "Ce qui rampe, vole et nage",
    description:
      "Une traversée du monde animal, de l'insecte social au grand mammifère marin. Chaque fiche dit ce qui rend l'espèce singulière.",
    icon: PawPrint,
    accent: "oklch(0.75 0.14 165)",
  },
  {
    key: "batisseurs",
    title: "Les bâtisseurs",
    tagline: "Ce que les humains ont dressé pour durer",
    description:
      "Des pierres levées aux cathédrales, en passant par les cités d'altitude : ce que construire veut dire, et ce qui reste.",
    icon: Landmark,
    accent: "oklch(0.72 0.12 60)",
  },
  {
    key: "images",
    title: "Images et regards",
    tagline: "Ce que les artistes ont voulu montrer",
    description:
      "Peintres, sculpteurs et musiciens : non pas une histoire de l'art, mais des regards qui ont changé notre façon de voir.",
    icon: Palette,
    accent: "oklch(0.68 0.17 300)",
  },
  {
    key: "matiere",
    title: "Le ciel et la matière",
    tagline: "Les idées qui expliquent l'univers",
    description:
      "Gravitation, atome, relativité, vaccin : les notions qui ont déplacé notre compréhension du monde, expliquées par leurs articles.",
    icon: Atom,
    accent: "oklch(0.7 0.14 235)",
  },
  {
    key: "recits",
    title: "Récits fondateurs",
    tagline: "Les histoires qui nous précèdent",
    description:
      "Épopées, mythes et romans qui ont façonné l'imaginaire commun. On ne lit pas une civilisation : on lit ce qu'elle raconte.",
    icon: Compass,
    accent: "oklch(0.68 0.2 15)",
  },
  {
    key: "machines",
    title: "Machines et signaux",
    tagline: "Les inventions qui ont changé le quotidien",
    description:
      "De la boussole au transistor : chaque objet technique raconte une contrainte résolue, et souvent une société transformée.",
    icon: Cpu,
    accent: "oklch(0.82 0.15 85)",
  },
];

export type Parcours = ParcoursDef & { cards: Card[] };

export function getParcours(): Parcours[] {
  return PARCOURS.map((def) => ({
    ...def,
    cards: (mapping[def.key] ?? [])
      .map((slug) => CARD_BY_SLUG.get(slug))
      .filter((card): card is Card => Boolean(card)),
  })).filter((parcours) => parcours.cards.length > 0);
}

export function getParcoursByKey(key: string): Parcours | undefined {
  return getParcours().find((parcours) => parcours.key === key);
}

/** Liste des parcours. */
export function ParcoursPage() {
  const { ownedIds } = useGame();
  const list = getParcours();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parcours"
        title="Des collections dans la collection"
        description="Six chemins à travers le catalogue. Chaque parcours réunit une quinzaine de fiches choisies pour raconter quelque chose — pas pour remplir un thème."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((parcours) => {
          const found = parcours.cards.filter((card) => ownedIds.has(card.id)).length;
          const percent = Math.round((found / parcours.cards.length) * 100);
          const Icon = parcours.icon;
          const done = found === parcours.cards.length;

          return (
            <Link
              key={parcours.key}
              to={`/parcours/${parcours.key}`}
              className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-20px_rgba(0,0,0,0.85)]"
              style={{ borderColor: `color-mix(in oklch, ${parcours.accent} 30%, var(--border))` }}
            >
              <div className="relative flex items-center gap-3 p-4">
                <div
                  className="grid size-10 shrink-0 place-items-center rounded-lg"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${parcours.accent} 16%, transparent)`,
                    color: parcours.accent,
                  }}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display truncate font-semibold">{parcours.title}</p>
                  <p className="text-muted-foreground truncate text-[11px]">{parcours.tagline}</p>
                </div>
                {done ? (
                  <Badge className="gap-1 bg-emerald-500/15 text-[10px] text-emerald-300">
                    <Trophy className="size-3" /> terminé
                  </Badge>
                ) : (
                  <ArrowRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                )}
              </div>

              {/* Aperçu : trois vignettes */}
              <div className="flex gap-1 px-4">
                {parcours.cards.slice(0, 4).map((card) => (
                  <CardArt key={card.id} card={card} className="h-12 flex-1 rounded" />
                ))}
              </div>

              <div className="space-y-1.5 p-4">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground tabular-nums">
                    {found} / {parcours.cards.length}
                  </span>
                  <span className="text-muted-foreground">{percent} %</span>
                </div>
                <Progress
                  value={percent}
                  className="h-1.5"
                  indicatorStyle={{ backgroundColor: parcours.accent }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** Détail d'un parcours. */
export function ParcoursDetailPage() {
  const { key = "" } = useParams();
  const parcours = getParcoursByKey(key);
  const { ownedIds } = useGame();

  if (!parcours) return <NotFoundPage />;

  const found = parcours.cards.filter((card) => ownedIds.has(card.id)).length;
  const percent = Math.round((found / parcours.cards.length) * 100);
  const Icon = parcours.icon;

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/parcours">
          <ArrowLeft className="size-4" /> Tous les parcours
        </Link>
      </Button>

      <div
        className="relative overflow-hidden rounded-2xl border p-6"
        style={{
          borderColor: `color-mix(in oklch, ${parcours.accent} 30%, var(--border))`,
          background: `linear-gradient(135deg, color-mix(in oklch, ${parcours.accent} 12%, transparent), transparent 60%)`,
        }}
      >
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-15" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="grid size-9 place-items-center rounded-lg"
                style={{
                  backgroundColor: `color-mix(in oklch, ${parcours.accent} 18%, transparent)`,
                  color: parcours.accent,
                }}
              >
                <Icon className="size-4.5" />
              </span>
              <Badge variant="outline" className="text-[10px]">
                {plural(parcours.cards.length, "fiche")}
              </Badge>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight">{parcours.title}</h1>
            <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
              {parcours.description}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <p className="font-display text-3xl font-bold tabular-nums">
              {found}
              <span className="text-muted-foreground text-lg"> / {parcours.cards.length}</span>
            </p>
            <Progress
              value={percent}
              className="h-2 w-40"
              indicatorStyle={{ backgroundColor: parcours.accent }}
            />
            <span className="text-muted-foreground text-[11px]">{percent} % complété</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {parcours.cards.map((card) => {
          if (ownedIds.has(card.id)) return <CardTile key={card.id} card={card} owned />;

          return (
            <div
              key={card.id}
              className="relative flex cursor-not-allowed flex-col overflow-hidden rounded-xl border border-dashed bg-card/30 opacity-70"
              title="Fiche non découverte"
            >
              <div className="relative">
                <CardArt card={card} className="h-44 opacity-40 grayscale" glyphClassName="size-14" />
                <div className="absolute inset-0 grid place-items-center">
                  <span className="grid size-9 place-items-center rounded-full bg-black/40 backdrop-blur-sm">
                    <Lock className="size-4 text-white/70" />
                  </span>
                </div>
                <div className="absolute top-2 left-2">
                  <RarityBadge rarity={card.rarity} className="opacity-80" />
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-3">
                <p className="text-muted-foreground text-[10px] tracking-wide uppercase">
                  {card.category}
                </p>
                <h3 className="font-display text-[15px] leading-tight font-semibold text-muted-foreground">
                  {card.name}
                </h3>
                <p className="text-muted-foreground/70 line-clamp-2 text-xs leading-snug">
                  {card.blurb}
                </p>
                <span className="text-muted-foreground mt-auto flex items-center gap-1 pt-2 text-[10px]">
                  <Lock className="size-3" /> à découvrir
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        <Button asChild variant="gold">
          <Link to="/paquets">
            <Sparkles className="size-4" /> Ouvrir un paquet
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/collection">Voir ma collection</Link>
        </Button>
        <span
          className={cn("text-muted-foreground ml-auto text-[11px]")}
        >
          Les fiches non trouvées restent visibles, sans pouvoir être ouvertes.
        </span>
      </div>
    </div>
  );
}
