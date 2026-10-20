/**
 * Repérage des fiches sensibles.
 *
 * Ce n'est pas un classifieur : c'est une liste de mots, appliquée au titre et à
 * l'accroche. C'est imparfait — ça rate des sujets et ça en sur-signale — mais
 * c'est transparent, instantané, et sans service externe. À remplacer par une
 * vrai classification quand un serveur existera.
 */

const SENSITIVE_WORDS = [
  "guerre",
  "massacre",
  "génocide",
  "attentat",
  "meurtre",
  "tuerie",
  "viol ",
  "viols",
  "cadavre",
  "suicide",
  "nazi",
  "nazisme",
  "esclavage",
  "pornograph",
  "nudité",
  "sexuel",
  "torture",
  "terroris",
  "crime",
  "décapitation",
  "famine",
  "épidémie",
  "catastrophe",
  "assassinat",
  "guerre civile",
  "génocide",
];

export function isSensitive(...texts: (string | undefined)[]): boolean {
  const haystack = texts
    .filter(Boolean)
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return SENSITIVE_WORDS.some((word) =>
    haystack.includes(word.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()),
  );
}

/** Âge révolu à partir d'une année de naissance. */
export function ageFromYear(year: number): number {
  return new Date().getFullYear() - year;
}
