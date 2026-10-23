/**
 * Assainit le catalogue généré depuis Wikipédia.
 *
 * On retire ce qu'un jeu de collection grand public ne peut pas afficher :
 * pages pour adultes, faits divers, homonymies, actualité (cérémonies, saisons),
 * articles sans image, et accroches trop courtes pour dire quelque chose.
 *
 * Le script n'appelle aucune API : il filtre le fichier existant, et écrit un
 * rapport de ce qu'il a écarté, avec la raison. C'est relisible et réversible.
 *
 * Lancement : node scripts/filter-catalog.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const SOURCE = "src/data/catalog.generated.json";
const REPORT = "docs/catalogue-filtre.md";

/** Motifs de titre qui trahissent une page inadaptée ou sans intérêt de collection. */
const TITLE_RULES = [
  { reason: "homonymie", test: /\(homonymie\)/i },
  { reason: "liste", test: /^Liste (de|des|d'|du)/i },
  { reason: "actualité", test: /^(Championnat|Coupe du monde|Jeux olympiques|Élection|Cérémonie|Eurovision|Tournoi)/i },
  { reason: "actualité", test: /\b(cérémonie|oscars?|césars?|eurovision)\b/i },
  { reason: "série TV", test: /\b(saison \d+|épisode|série télévisée)\b/i },
  { reason: "titre numérique", test: /^[\d\s.,-]+$/ },
  { reason: "fait divers", test: /^(Affaire|Meurtre|Tueur|Attentat|Massacre|Génocide|Fusillade)/i },
];

/** Termes qui excluent d'office, dans le titre ou l'accroche. */
const BANNED_WORDS = [
  "pornograph", "pornographie", "xxx", "hentai", "érotique", "erotique",
  "nudité", "nudite", "sexe", "sexuel", "prostitu",
  "massacre", "génocide", "genocide", "attentat", "tuerie", "meurtre",
  "tueur en série", "serial killer", "cadavre", "décapitation", "torture",
  "suicide", "viol ", "viols", "pédophil", "pedophil",
];

/** Personnalités dont la fiche n'a pas sa place dans un jeu de collection. */
const BANNED_NAMES = [
  "epstein", "ed gein", "dutroux", "fourniret", "dupont de ligonnes",
  "hitler", "goebbels", "himler", "eichmann", "mussolini",
];

function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function rejectionReason(card) {
  for (const rule of TITLE_RULES) {
    if (rule.test.test(card.name)) return rule.reason;
  }

  const haystack = normalize(`${card.name} ${card.blurb ?? ""}`);
  for (const word of BANNED_WORDS) {
    if (haystack.includes(normalize(word))) return "contenu sensible";
  }
  for (const name of BANNED_NAMES) {
    if (haystack.includes(normalize(name))) return "contenu sensible";
  }

  if (!card.image) return "sans image";
  if (!card.blurb || card.blurb.length < 60) return "accroche trop courte";
  return null;
}

const cards = JSON.parse(readFileSync(SOURCE, "utf8"));
const kept = [];
const removed = [];

for (const card of cards) {
  const reason = rejectionReason(card);
  if (reason) removed.push({ ...card, reason });
  else kept.push(card);
}

writeFileSync(SOURCE, JSON.stringify(kept, null, 0));

const byReason = removed.reduce((acc, card) => {
  acc[card.reason] = (acc[card.reason] ?? 0) + 1;
  return acc;
}, {});

const lines = [
  "# Catalogue : ce qui a été écarté",
  "",
  `Passage du ${new Date().toLocaleDateString("fr-FR")} sur les cartes générées depuis Wikipédia.`,
  "",
  `- Cartes examinées : **${cards.length}**`,
  `- Cartes conservées : **${kept.length}**`,
  `- Cartes écartées : **${removed.length}**`,
  "",
  "## Par raison",
  "",
  "| Raison | Nombre |",
  "|---|---|",
  ...Object.entries(byReason)
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => `| ${reason} | ${count} |`),
  "",
  "## Détail des cartes écartées",
  "",
  "| Carte | Raison |",
  "|---|---|",
  ...removed
    .sort((a, b) => a.reason.localeCompare(b.reason))
    .map((card) => `| ${card.name} | ${card.reason} |`),
  "",
];

writeFileSync(REPORT, lines.join("\n"));

console.log(`${kept.length} conservées, ${removed.length} écartées.`);
console.log("par raison :", byReason);
console.log(`rapport : ${REPORT}`);
