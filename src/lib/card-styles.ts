import { type Rarity } from "./types";

/**
 * Retourne le box-shadow approprié pour chaque niveau de rareté
 * avec profondeur et halo distinctifs.
 */
export function getCardShadow(rarity: Rarity): string {
  const shadows: Record<Rarity, string> = {
    commun:
      "0 12px 24px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.1)",
    "peu-commun":
      "0 14px 28px -10px rgba(100,200,100,0.3), 0 0 20px -10px rgba(100,200,100,0.1)",
    rare:
      "0 16px 32px -12px rgba(80,120,200,0.35), 0 0 24px -12px rgba(80,120,200,0.15)",
    "super-rare":
      "0 18px 36px -14px rgba(180,100,220,0.4), 0 0 28px -12px rgba(180,100,220,0.2)",
    "ultra-rare":
      "0 20px 40px -16px rgba(220,80,100,0.45), 0 0 32px -14px rgba(220,150,50,0.25)",
    legendaire:
      "0 24px 48px -18px rgba(255,200,50,0.5), 0 0 40px -16px rgba(255,200,50,0.35)",
  };

  return shadows[rarity] || shadows.commun;
}

/**
 * Retourne les propriétés de border pour chaque rareté.
 */
export function getCardBorder(rarity: Rarity): { width: string; opacity: number } {
  const borders: Record<Rarity, { width: string; opacity: number }> = {
    commun: { width: "border-2", opacity: 0.5 },
    "peu-commun": { width: "border-2", opacity: 0.7 },
    rare: { width: "border-2", opacity: 0.8 },
    "super-rare": { width: "border-[2.5px]", opacity: 0.9 },
    "ultra-rare": { width: "border-[3px]", opacity: 0.95 },
    legendaire: { width: "border-[3px]", opacity: 1 },
  };

  return borders[rarity] || borders.commun;
}

/**
 * Retourne l'opacité du numéro de carte selon la rareté.
 */
export function getCardNumberOpacity(rarity: Rarity): string {
  const opacities: Record<Rarity, string> = {
    commun: "opacity-40",
    "peu-commun": "opacity-50",
    rare: "opacity-60",
    "super-rare": "opacity-75",
    "ultra-rare": "opacity-85",
    legendaire: "opacity-100",
  };

  return opacities[rarity] || opacities.commun;
}
