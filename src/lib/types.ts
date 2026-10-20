export const RARITIES = [
  "commun",
  "peu-commun",
  "rare",
  "super-rare",
  "ultra-rare",
  "legendaire",
] as const;

export type Rarity = (typeof RARITIES)[number];

export const CATEGORIES = [
  "Animaux",
  "Sciences",
  "Histoire",
  "Arts",
  "Lieux",
  "Techniques",
  "Recits",
  "Divers",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type RarityInfo = {
  id: Rarity;
  label: string;
  short: string;
  /** Couleur d'accent (oklch) utilisée pour les bordures et halos. */
  accent: string;
  /** Probabilité d'apparition dans un paquet standard. */
  dropRate: number;
  /** Valeur de base en crédits. */
  baseValue: number;
};

export const RARITY_MAP: Record<Rarity, RarityInfo> = {
  commun: {
    id: "commun",
    label: "Commun",
    short: "C",
    accent: "oklch(0.72 0.02 255)",
    dropRate: 0.44,
    baseValue: 320,
  },
  "peu-commun": {
    id: "peu-commun",
    label: "Peu commun",
    short: "PC",
    accent: "oklch(0.75 0.14 165)",
    dropRate: 0.27,
    baseValue: 780,
  },
  rare: {
    id: "rare",
    label: "Rare",
    short: "R",
    accent: "oklch(0.7 0.14 235)",
    dropRate: 0.16,
    baseValue: 1850,
  },
  "super-rare": {
    id: "super-rare",
    label: "Super rare",
    short: "SR",
    accent: "oklch(0.68 0.17 300)",
    dropRate: 0.085,
    baseValue: 4200,
  },
  "ultra-rare": {
    id: "ultra-rare",
    label: "Ultra rare",
    short: "UR",
    accent: "oklch(0.68 0.2 15)",
    dropRate: 0.035,
    baseValue: 9800,
  },
  legendaire: {
    id: "legendaire",
    label: "Légendaire",
    short: "L",
    accent: "oklch(0.82 0.15 85)",
    dropRate: 0.01,
    baseValue: 24000,
  },
};

export type Card = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  rarity: Rarity;
  set: string;
  era: string;
  origin: string;
  blurb: string;
  lore: string;
  /** Attributs de duel, sur 100. */
  stats: {
    savoir: number;
    influence: number;
    singularite: number;
  };
  value: number;
  /** Numéro de la carte dans son édition, ex. « 014 / 120 ». */
  number: string;
  tags: string[];
  /** Citations / renvois affichés dans la fiche. */
  facts: string[];
  /** Titre de l'article Wikipédia correspondant (source de l'image et du résumé). */
  sourceTitle: string;
};

export type OwnedCard = {
  id: string;
  cardId: string;
  obtainedAt: string;
  edition: "standard" | "holo" | "prestige";
};

export type Profile = {
  handle: string;
  displayName: string;
  email: string;
  joinedAt: string;
  bio: string;
  credits: number;
  xp: number;
  level: number;
  duelWins: number;
  duelLosses: number;
  packsOpened: number;
  guild: string;
};
