/**
 * Ajoute au catalogue un noyau « curaté » : des articles choisis à la main,
 * regroupés en parcours thématiques.
 *
 * Pourquoi : le corpus des articles les plus lus est dominé par le divertissement
 * et l'actualité. Il ne contient ni le tigre, ni la gravitation, ni l'imprimerie.
 * Un jeu de collection a besoin d'un cœur éditorial — c'est ce qui nous distingue.
 *
 * Sorties :
 *   - src/data/catalog.generated.json  (complété, sans doublons)
 *   - src/data/parcours.generated.json (parcours → slugs réellement présents)
 *
 * Lancement : node scripts/add-curated.mjs
 */
import { readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";

/** Windows verrouille parfois un fichier (antivirus) : on réessaie. */
function writeFileSafe(path, content) {
  const tmp = `${path}.tmp`;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      writeFileSync(tmp, content);
      renameSync(tmp, path);
      return;
    } catch (error) {
      if (attempt === 5) throw error;
      try { unlinkSync(tmp); } catch { /* rien */ }
      const until = Date.now() + 400 * attempt;
      while (Date.now() < until) { /* attente courte */ }
    }
  }
}

const CATALOG = "src/data/catalog.generated.json";
const PARCOURS_OUT = "src/data/parcours.generated.json";
const UA = "WikiTCG-prototype/0.5 (curated core; contact: owner)";
const BATCH = 20;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Le cœur éditorial, groupé en parcours. */
const PARCOURS = {
  vivant: [
    "Tigre", "Loup gris", "Abeille", "Baleine bleue", "Panda géant", "Axolotl",
    "Corbeau freux", "Grand requin blanc", "Éléphant d'Afrique", "Girafe",
    "Manchot empereur", "Caméléon", "Libellule", "Koala", "Orque", "Renard roux",
  ],
  batisseurs: [
    "Tour Eiffel", "Machu Picchu", "Stonehenge", "Colisée", "Grande Muraille",
    "Angkor Vat", "Taj Mahal", "Alhambra", "Pétra", "Mont Saint-Michel",
    "Pyramides de Gizeh", "Acropole d'Athènes", "Chichén Itzá", "Statue de la Liberté",
    "Pont du Gard", "Cathédrale Notre-Dame de Paris",
  ],
  images: [
    "La Joconde", "La Nuit étoilée", "La Grande Vague de Kanagawa", "Guernica",
    "Frida Kahlo", "Vincent van Gogh", "Claude Monet", "Johannes Vermeer",
    "Léonard de Vinci", "Pablo Picasso", "Ludwig van Beethoven",
    "Wolfgang Amadeus Mozart", "Auguste Rodin", "Henri Matisse", "Le Caravage",
    "Rembrandt",
  ],
  matiere: [
    "Gravitation", "Trou noir", "Relativité générale", "Big Bang", "Système solaire",
    "Atome", "Mécanique quantique", "Tableau périodique des éléments", "Électricité",
    "Vaccin", "Acide désoxyribonucléique", "Évolution", "Photosynthèse", "Cellule",
    "Théorème de Pythagore", "Pi",
  ],
  recits: [
    "Odyssée", "Iliade", "Les Mille et Une Nuits", "Yggdrasil", "Atlantide", "Graal",
    "Mythologie grecque", "Dracula", "Frankenstein", "Le Petit Prince",
    "Don Quichotte", "Roméo et Juliette", "Sherlock Holmes", "Le Seigneur des anneaux",
    "Alice au pays des merveilles", "Les Aventures de Tintin",
  ],
  machines: [
    "Machine à vapeur", "Imprimerie", "Boussole", "Transistor", "Internet",
    "Téléphone", "Avion", "Train", "Télescope", "Photographie", "Automobile",
    "Lampe à incandescence", "Satellite artificiel", "Fibre optique", "Ordinateur",
    "Barrage",
  ],
};

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

async function fetchSummaries(titles) {
  const out = new Map();
  for (let i = 0; i < titles.length; i += BATCH) {
    const batch = titles.slice(i, i + BATCH);
    const url =
      "https://fr.wikipedia.org/w/api.php?action=query&format=json&origin=*" +
      "&prop=extracts|pageimages&exintro=1&explaintext=1&piprop=thumbnail&pithumbsize=400" +
      "&redirects=1&titles=" + encodeURIComponent(batch.join("|"));

    let attempt = 0;
    let done = false;
    while (!done && attempt <= 5) {
      try {
        const res = await fetch(url, { headers: { "user-agent": UA } });
        if (res.status === 429) {
          const retryAfter = Number(res.headers.get("retry-after") ?? 0);
          await sleep(retryAfter > 0 ? retryAfter * 1000 : 3000 * 2 ** attempt);
          attempt += 1;
          continue;
        }
        if (!res.ok) { done = true; break; }
        const json = await res.json();
        for (const page of Object.values(json?.query?.pages ?? {})) {
          if (!page || page.missing !== undefined) continue;
          const extract = String(page.extract ?? "").trim();
          if (extract.length < 80) continue;
          out.set(page.title, {
            title: page.title,
            extract,
            image: page.thumbnail?.source ?? null,
          });
        }
        done = true;
      } catch {
        attempt += 1;
        await sleep(2000 * attempt);
      }
    }
    await sleep(1200);
  }
  return out;
}

async function fetchViews(title, start, end, attempt = 1) {
  const url =
    "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/" +
    `${encodeURIComponent(title.replace(/ /g, "_"))}/monthly/${start}/${end}`;
  try {
    const res = await fetch(url, { headers: { "user-agent": UA } });
    if (res.status === 429 || res.status >= 500) {
      if (attempt <= 4) {
        await sleep(1500 * attempt);
        return fetchViews(title, start, end, attempt + 1);
      }
      return 0;
    }
    if (!res.ok) return 0;
    const json = await res.json();
    return (json.items ?? []).reduce((sum, item) => sum + item.views, 0);
  } catch {
    if (attempt <= 4) {
      await sleep(1000 * attempt);
      return fetchViews(title, start, end, attempt + 1);
    }
    return 0;
  }
}

function assignRarities(cards) {
  const sorted = [...cards].sort((a, b) => a.views - b.views);
  const total = sorted.length;
  const steps = [
    ["commun", 0.44], ["peu-commun", 0.27], ["rare", 0.16],
    ["super-rare", 0.085], ["ultra-rare", 0.035], ["legendaire", 0.01],
  ];
  let index = 0;
  let cumulative = 0;
  for (const [rarity, share] of steps) {
    cumulative += share;
    const limit = Math.round(cumulative * total);
    for (; index < Math.min(limit, total); index += 1) sorted[index].rarity = rarity;
  }
  for (; index < total; index += 1) sorted[index].rarity = "legendaire";
}

async function main() {
  const catalog = JSON.parse(readFileSync(CATALOG, "utf8"));
  const known = new Set(catalog.map((card) => card.name));
  const knownSlugs = new Set(catalog.map((card) => card.slug));

  const wanted = [...new Set(Object.values(PARCOURS).flat())].filter((title) => !known.has(title));
  console.log(`${wanted.length} articles curatés à récupérer (${known.size} déjà présents).`);

  const summaries = await fetchSummaries(wanted);
  console.log(`${summaries.size} articles récupérés.`);

  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const start = new Date(end.getFullYear(), end.getMonth() - 2, 1);
  const fmt = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}01`;

  const added = [];
  let i = 0;
  for (const [title, detail] of summaries) {
    const slug = slugify(title);
    if (knownSlugs.has(slug)) continue;
    const views = await fetchViews(title, fmt(start), fmt(end));
    i += 1;
    if (i % 20 === 0) console.log(`  vues ${i}/${summaries.size}`);
    await sleep(320);
    added.push({
      slug,
      name: title,
      sourceTitle: title,
      rarity: "commun",
      blurb: firstSentence(detail.extract),
      image: detail.image,
      views: views > 0 ? views : 1,
      curated: true,
    });
  }

  console.log(`${added.length} cartes curatées ajoutées.`);

  const merged = [...catalog, ...added];
  assignRarities(merged);
  writeFileSafe(CATALOG, JSON.stringify(merged, null, 0));

  // Parcours : on ne garde que les articles réellement présents.
  const allSlugs = new Set(merged.map((card) => card.slug));
  const mapping = {};
  for (const [key, titles] of Object.entries(PARCOURS)) {
    mapping[key] = titles
      .map((title) => slugify(title))
      .filter((slug) => allSlugs.has(slug));
  }
  writeFileSafe(PARCOURS_OUT, JSON.stringify(mapping, null, 2));

  console.log(`Catalogue : ${merged.length} cartes.`);
  for (const [key, slugs] of Object.entries(mapping)) {
    console.log(`  ${key} : ${slugs.length} cartes`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
