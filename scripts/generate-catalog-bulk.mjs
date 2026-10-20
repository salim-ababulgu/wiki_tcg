/**
 * Génération du catalogue à partir des articles les plus consultés de Wikipédia.
 *
 * Pourquoi cette source plutôt que les catégories : sur la Wikipédia francophone,
 * les catégories sont surtout des tiroirs de sous-catégories — elles ne contiennent
 * presque pas d'articles. Les listes de pages les plus consultées, elles, sont
 * composées de vrais articles, et donnent directement le signal de rareté.
 *
 * Stratégie :
 *   1. douze mois de classements « top 1000 » (12 requêtes) ;
 *   2. agrégation des vues par article, sur l'année ;
 *   3. récupération des résumés et vignettes par lots de 24 ;
 *   4. rareté par quantiles, pour coller aux taux d'apparition du jeu.
 *
 * Lancement : node scripts/generate-catalog-bulk.mjs
 */
import { writeFileSync } from "node:fs";

const TARGET = 2000;
const MONTHS_BACK = 12;
const UA = "WikiTCG-prototype/0.4 (catalogue generation; contact: owner)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const IGNORED = new Set([
  "Wikipédia:Accueil principal",
  "Wikipédia",
  "Page d'accueil",
  "Spécial:Recherche",
]);

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

/** Douze mois de classements. */
async function collectTopArticles() {
  const totals = new Map();
  const now = new Date();

  for (let back = 1; back <= MONTHS_BACK; back += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/fr.wikipedia/all-access/${yyyy}/${mm}/all-days`;

    try {
      const res = await fetch(url, { headers: { "user-agent": UA } });
      if (!res.ok) {
        console.log(`${yyyy}-${mm} : refusé (${res.status})`);
        continue;
      }
      const json = await res.json();
      const articles = json?.items?.[0]?.articles ?? [];
      let counted = 0;
      for (const item of articles) {
        const raw = String(item.article ?? "").replace(/_/g, " ");
        if (!raw || IGNORED.has(raw)) continue;
        // On écarte les pages techniques (espaces de noms, fichiers, catégories…)
        if (raw.includes(":")) continue;
        if (/^(Main_Page|Sans_titre)$/i.test(raw)) continue;
        totals.set(raw, (totals.get(raw) ?? 0) + Number(item.views ?? 0));
        counted += 1;
      }
      console.log(`${yyyy}-${mm} : ${counted} articles pris en compte`);
    } catch {
      console.log(`${yyyy}-${mm} : erreur réseau`);
    }
    await sleep(250);
  }

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TARGET)
    .map(([title, views]) => ({ title, views }));
}

/** Résumés + vignettes, par lots, avec respect des limites de débit. */
async function fetchDetails(titles) {
  const details = new Map();
  const BATCH = 20;
  const DELAY = 1200;
  let throttled = 0;

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
          throttled += 1;
          // On respecte l'indication du serveur quand elle existe.
          const retryAfter = Number(res.headers.get("retry-after") ?? 0);
          const wait = retryAfter > 0 ? retryAfter * 1000 : Math.min(20000, 2000 * 2 ** attempt);
          console.log(`  429 — pause de ${Math.round(wait / 1000)} s`);
          await sleep(wait);
          attempt += 1;
          continue;
        }

        if (!res.ok) {
          done = true;
          break;
        }

        const json = await res.json();
        const pages = json?.query?.pages ?? {};
        for (const page of Object.values(pages)) {
          if (!page || page.missing !== undefined) continue;
          const extract = String(page.extract ?? "").trim();
          if (extract.length < 80) continue;
          details.set(page.title, {
            title: page.title,
            extract,
            image: page.thumbnail?.source ?? null,
          });
        }
        done = true;
      } catch {
        attempt += 1;
        await sleep(1500 * attempt);
      }
    }

    if (i % 200 === 0) console.log(`  détails ${Math.min(i + BATCH, titles.length)}/${titles.length}`);
    await sleep(DELAY);
  }

  if (throttled > 0) console.log(`${throttled} limitation(s) rencontrée(s) — le rythme a été réduit.`);
  return details;
}

function assignRarities(cards) {
  const sorted = [...cards].sort((a, b) => a.views - b.views);
  const total = sorted.length;
  const steps = [
    ["commun", 0.44],
    ["peu-commun", 0.27],
    ["rare", 0.16],
    ["super-rare", 0.085],
    ["ultra-rare", 0.035],
    ["legendaire", 0.01],
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
  console.log("Collecte des articles les plus consultés…");
  const top = await collectTopArticles();
  console.log(`${top.length} articles retenus (par vues cumulées sur ${MONTHS_BACK} mois).\n`);

  console.log("Récupération des résumés et des images…");
  const details = await fetchDetails(top.map((entry) => entry.title));
  console.log(`${details.size} articles avec un résumé exploitable.\n`);

  const cards = [];
  for (const entry of top) {
    const detail = details.get(entry.title);
    if (!detail) continue;
    cards.push({
      slug: slugify(detail.title),
      name: detail.title,
      sourceTitle: detail.title,
      rarity: "commun",
      blurb: firstSentence(detail.extract),
      image: detail.image,
      views: entry.views,
    });
  }

  assignRarities(cards);
  const unique = [];
  const seen = new Set();
  for (const card of cards.sort((a, b) => b.views - a.views)) {
    if (seen.has(card.slug)) continue;
    seen.add(card.slug);
    unique.push(card);
  }

  writeFileSync("src/data/catalog.generated.json", JSON.stringify(unique, null, 0));
  console.log(`${unique.length} cartes écrites dans src/data/catalog.generated.json`);
  const counts = unique.reduce((acc, c) => ((acc[c.rarity] = (acc[c.rarity] ?? 0) + 1), acc), {});
  console.log("répartition :", counts);
  console.log("poids du fichier :", (JSON.stringify(unique).length / 1024 / 1024).toFixed(2), "Mo");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
