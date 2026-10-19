import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Hash déterministe (djb2) : même entrée → même sortie. Utile pour générer un visuel stable. */
export function hash(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(h);
}

/** Nombre pseudo-aléatoire mais stable dans [0, 1) dérivé d'une chaîne. */
export function unit(input: string, salt = ""): number {
  return (hash(input + salt) % 10000) / 10000;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.round(value));
}

export function plural(count: number, singular: string, pluralForm?: string): string {
  return `${formatNumber(count)} ${count > 1 ? (pluralForm ?? `${singular}s`) : singular}`;
}

export function initials(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** « Pierres & empires » → « pierres-empires » (adresses sans accents, en minuscules). */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
