/**
 * Génère le catalogue à partir de Wikipédia.
 *
 * Une carte = un article. Le script récupère, pour chaque titre :
 *   - le titre exact, le résumé d'introduction et la vignette (API Wikipédia) ;
 *   - le nombre de consultations mensuelles (API de fréquentation Wikimedia).
 *
 * La rareté n'est pas inventée : elle est déduite du rang de consultation de
 * l'article dans le catalogue généré (quantiles), ce qui garantit que la
 * répartition finale colle aux taux d'apparition affichés dans le jeu.
 *
 * Lancement : node scripts/generate-catalog.mjs
 * Sortie    : src/data/catalog.generated.json
 */
import { writeFileSync } from "node:fs";

const THEMES = {
  "Mondes vivants": [
    "Abeille", "Loup gris", "Chat", "Chien", "Renard roux", "Éléphant d'Afrique", "Girafe",
    "Manchot empereur", "Grand requin blanc", "Panda géant", "Tigre", "Aigle royal",
    "Tortue luth", "Baleine bleue", "Axolotl", "Corbeau freux", "Libellule", "Caméléon",
    "Koala", "Orque", "Hibou", "Dauphin", "Cheval", "Lion",
  ],
  "Lumière & métal": [
    "Gravitation", "Relativité générale", "Trou noir", "Acide désoxyribonucléique", "Évolution",
    "Atome", "Tableau périodique des éléments", "Photosynthèse", "Mécanique quantique",
    "Électricité", "Vaccin", "Antibiotique", "Système solaire", "Big Bang",
    "Intelligence artificielle", "Cellule", "Génétique", "Chimie", "Physique", "Mathématiques",
    "Énergie", "Bactérie", "Virus", "Neurosciences",
  ],
  "Pierres & empires": [
    "Cléopâtre VII", "Jules César", "Napoléon Ier", "Révolution française", "Empire romain",
    "Grande Muraille", "Route de la soie", "Pyramides d'Égypte", "Alexandre le Grand",
    "Charlemagne", "Louis XIV", "Seconde Guerre mondiale", "Première Guerre mondiale",
    "Guerre froide", "Empire ottoman", "Vikings", "Moyen Âge", "Renaissance", "Rome antique",
    "Grèce antique", "Égypte antique", "Impressionnisme", "Révolution industrielle",
    "Mongolie",
  ],
  "Ateliers & scènes": [
    "La Joconde", "Léonard de Vinci", "Vincent van Gogh", "Pablo Picasso", "Ludwig van Beethoven",
    "Frida Kahlo", "Wolfgang Amadeus Mozart", "La Nuit étoilée", "La Grande Vague de Kanagawa",
    "Guernica", "Musée du Louvre", "Claude Monet", "Johannes Vermeer", "Jazz", "Cinéma",
    "Théâtre", "Photographie", "Opéra", "Sculpture", "Bande dessinée", "Littérature",
    "Poésie", "Architecture", "Danse",
  ],
  "Cartes du monde": [
    "Tour Eiffel", "Machu Picchu", "Stonehenge", "Colisée", "Venise", "Sahara", "Amazonie",
    "Everest", "Grand Canyon", "Kilimandjaro", "Chutes du Niagara", "Mont Saint-Michel",
    "Statue de la Liberté", "Taj Mahal", "Pyramides de Gizeh", "Acropole d'Athènes",
    "Alhambra", "Pétra", "Angkor Vat", "Chichén Itzá", "Baïkal", "Groenland",
    "Méditerranée", "Alpes",
  ],
  "Machines & signaux": [
    "Machine à vapeur", "Transistor", "Boussole", "Télescope", "Imprimerie", "Internet",
    "Ordinateur", "Téléphone", "Avion", "Train", "Satellite artificiel", "Automobile",
    "Électricité (réseau)", "Pont suspendu", "Centrale nucléaire", "Robot",
    "Moteur à explosion", "Chemin de fer", "Barrage", "Éolienne", "Panneau solaire",
    "Fibre optique", "Radar", "Horloge",
  ],
  "Rêves & récits": [
    "Odyssée", "Iliade", "Les Mille et Une Nuits", "Dracula", "Frankenstein", "Le Seigneur des anneaux",
    "Harry Potter", "Star Wars", "Sherlock Holmes", "Yggdrasil", "Atlantide", "Graal",
    "Mythologie grecque", "Conte", "Jeu de rôle", "Astérix", "Tintin", "Le Petit Prince",
    "Don Quichotte", "Roméo et Juliette", "Hamlet", "Dragon", "Licorne", "Fantasy",
  ],
};

const MONTHS_BACK = 1;
const CONCURRENCY = 1;
const DELAY_MS = 320;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const failures = [];
const UA = "WikiTCG-prototype/0.2 (catalogue generation; contact: owner)";

/** Résumés par lots (API classique, 24 titres par requête). */
async function fetchSummaries(titles) {
  const out = new Map();
  for (let i = 0; i < titles.length; i += 24) {
    const batch = titles.slice(i, i + 24);
    const url =
      "https://fr.wikipedia.org/w/api.php?action=query&format=json&origin=*" +
      "&prop=extracts|pageimages&exintro=1&explaintext=1&piprop=thumbnail&pithumbsize=400" +
      "&redirects=1&titles=" + encodeURIComponent(batch.join("|"));
    const res = await fetch(url, { headers: { "user-agent": UA } });
    if (!res.ok) {
      console.error("lot en échec :", res.status);
      continue;
    }
    const json = await res.json();
    const pages = json?.query?.pages ?? {};
    const normalized = json?.query?.normalized ?? [];
    const redirects = json?.query?.redirects ?? [];
    const toCanonical = new Map();
    for (const n of normalized) toCanonical.set(n.from, n.to);
    for (const r of redirects) toCanonical.set(r.from, r.to);

    for (const [, page] of Object.entries(pages)) {
      if (!page || page.missing !== undefined) continue;
      const extract = (page.extract ?? "").trim();
      if (!extract) continue;
      out.set(page.title, {
        title: page.title,
        extract,
        image: page.thumbnail?.source ?? null,
      });
    }
    // On rattache les titres demandés aux titres canoniques.
    for (const t of batch) {
      const canonical = toCanonical.get(t) ?? t;
      const found = out.get(canonical);
      if (found && !found.requested) found.requested = t;
    }
    await sleep(200);
  }
  return out;
}

/** Vues mensuelles d'un article. */
async function fetchViews(title, start, end, attempt = 1) {
  const url =
    "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/" +
    `${encodeURIComponent(title.replace(/ /g, "_"))}/monthly/${start}/${end}`;
  try {
    const res = await fetch(url, { headers: { "user-agent": UA } });
    if (res.status === 429 || res.status >= 500) {
      // Limitation de débit : on attend et on réessaie (jusqu'à 4 essais).
      if (attempt <= 3) {
        await sleep(1200 * attempt);
        return fetchViews(title, start, end, attempt + 1);
      }
      failures.push(title);
      return 0;
    }
    if (!res.ok) return 0;
    const json = await res.json();
    return (json.items ?? []).reduce((sum, item) => sum + item.views, 0);
  } catch {
    if (attempt <= 3) {
      await sleep(900 * attempt);
      return fetchViews(title, start, end, attempt + 1);
    }
    failures.push(title);
    return 0;
  }
}

function slugify(input) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function firstSentence(text, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  const cut = clean.match(/^.{40,}?[.!?](\s|$)/);
  const sentence = cut ? cut[0] : clean;
  return sentence.length > max ? `${sentence.slice(0, max).trimEnd()}…` : sentence;
}

/** Rareté par quantiles : la répartition obtenue colle aux taux du jeu. */
function assignRarities(cards) {
  const sorted = [...cards].sort((a, b) => a.views - b.views);
  const total = sorted.length;
  const thresholds = [
    ["commun", 0.44],
    ["peu-commun", 0.27],
    ["rare", 0.16],
    ["super-rare", 0.085],
    ["ultra-rare", 0.035],
    ["legendaire", 0.01],
  ];
  let index = 0;
  let cumulative = 0;
  for (const [rarity, share] of thresholds) {
    cumulative += share;
    const limit = Math.round(cumulative * total);
    for (; index < Math.min(limit, total); index += 1) {
      sorted[index].rarity = rarity;
    }
  }
  for (; index < total; index += 1) sorted[index].rarity = "legendaire";
}

async function main() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const start = new Date(end.getFullYear(), end.getMonth() - MONTHS_BACK, 1);
  const fmt = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}01`;

  const allTitles = Object.values(THEMES).flat();
  console.log(`${allTitles.length} titres demandés…`);

  const summaries = await fetchSummaries(allTitles);
  console.log(`${summaries.size} articles trouvés.`);

  const cards = [];
  for (const [set, titles] of Object.entries(THEMES)) {
    for (const requested of titles) {
      const match =
        summaries.get(requested) ??
        [...summaries.values()].find((s) => s.requested === requested);
      if (!match) continue;
      cards.push({ set, requested, ...match, views: 0 });
    }
  }

  // Vues, avec un peu de politesse entre les appels.
  let done = 0;
  const queue = [...cards];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const card = queue.shift();
      card.views = await fetchViews(card.title, fmt(start), fmt(end));
      done += 1;
      if (done % 20 === 0) console.log(`  ${done}/${cards.length} vues récupérées`);
      await sleep(DELAY_MS);
    }
  });
  await Promise.all(workers);

  const kept = cards.filter((c) => c.views > 0);
  console.log(`${kept.length} articles avec des vues exploitables.`);
  if (failures.length) console.log(`${failures.length} échecs réseau :`, failures.slice(0, 5).join(", "));

  assignRarities(kept);

  const output = kept
    .sort((a, b) => b.views - a.views)
    .map((card) => ({
      slug: slugify(card.title),
      name: card.title,
      sourceTitle: card.title,
      set: card.set,
      rarity: card.rarity,
      blurb: firstSentence(card.extract),
      lore: card.extract.slice(0, 700),
      image: card.image,
      views: card.views,
    }));

  writeFileSync("src/data/catalog.generated.json", JSON.stringify(output, null, 2));
  const counts = output.reduce((acc, c) => ((acc[c.rarity] = (acc[c.rarity] ?? 0) + 1), acc), {});
  console.log(`\n${output.length} cartes écrites dans src/data/catalog.generated.json`);
  console.log("répartition :", counts);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
