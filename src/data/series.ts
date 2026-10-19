import { CARDS, SETS } from "@/data/cards";
import { RARITIES, type Card, type Rarity } from "@/lib/types";
import { slugify } from "@/lib/utils";

export type Series = {
  name: string;
  slug: string;
  cards: Card[];
  total: number;
  rarest: Card;
  /** Rareté la plus haute présente dans la série. */
  topRarity: Rarity;
};

/**
 * Une « série » est une édition du catalogue. Les adresses suivent la règle
 * du projet : français, sans accents, en minuscules, tirets si besoin.
 */
export const SERIES: Series[] = SETS.map((set) => {
  const cards = CARDS.filter((card) => card.set === set).sort((a, b) =>
    a.number.localeCompare(b.number),
  );
  const rarest = [...cards].sort(
    (a, b) => RARITIES.indexOf(b.rarity) - RARITIES.indexOf(a.rarity),
  )[0];

  return {
    name: set,
    slug: slugify(set),
    cards,
    total: cards.length,
    rarest,
    topRarity: rarest.rarity,
  };
});

export const SERIES_BY_SLUG = new Map(SERIES.map((series) => [series.slug, series]));

export function seriesBySlug(slug: string): Series | undefined {
  return SERIES_BY_SLUG.get(slug);
}
