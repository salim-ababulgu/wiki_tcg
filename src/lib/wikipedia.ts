/**
 * Récupération des résumés d'articles Wikipédia.
 *
 * Trois précautions, parce qu'on utilise le service de quelqu'un d'autre :
 * 1. Un cache local (7 jours) : on ne redemande pas deux fois la même fiche.
 * 2. Deux requêtes simultanées au maximum : on ne martèle pas leurs serveurs.
 * 3. Délai maximum de 7 secondes, et échec silencieux : le site reste utilisable
 *    sans connexion.
 *
 * Le texte et les images appartiennent à Wikipédia et à Wikimedia Commons, sous
 * licence libre : l'interface doit toujours afficher l'attribution et le lien.
 */

export type WikiSummary = {
  title: string;
  /** Résumé d'introduction, tel que fourni par l'API. */
  extract: string;
  /** Vignette officielle, servie par Wikimedia. */
  image: string | null;
  pageUrl: string;
  /** Mention à afficher obligatoirement à côté du contenu. */
  credit: string;
};

const STORE_KEY = "wikitcg:wiki:v1";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;
/** Un échec n'est retenu que 10 minutes : le joueur peut réessayer rapidement. */
const NEGATIVE_TTL_MS = 10 * 60 * 1000;
const MAX_CONCURRENT = 2;
const TIMEOUT_MS = 7000;

type Entry = { at: number; data: WikiSummary | null };

const memory = new Map<string, Entry>();
let storeLoaded = false;

function loadStore() {
  if (storeLoaded || typeof localStorage === "undefined") return;
  storeLoaded = true;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, Entry>;
    for (const [key, value] of Object.entries(parsed)) memory.set(key, value);
  } catch {
    /* cache illisible : on repart à zéro */
  }
}

function persist() {
  if (typeof localStorage === "undefined") return;
  try {
    const out: Record<string, Entry> = {};
    let count = 0;
    // On ne garde que les 120 entrées les plus récentes.
    for (const [key, value] of [...memory.entries()].sort((a, b) => b[1].at - a[1].at)) {
      if (count++ >= 120) break;
      out[key] = value;
    }
    localStorage.setItem(STORE_KEY, JSON.stringify(out));
  } catch {
    /* quota dépassé : sans gravité, le cache mémoire suffit */
  }
}

let active = 0;
const waiting: Array<() => void> = [];

function acquire(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active += 1;
    return Promise.resolve();
  }
  return new Promise((resolve) => waiting.push(resolve));
}

function release() {
  active -= 1;
  const next = waiting.shift();
  if (next) {
    active += 1;
    next();
  }
}

function cacheKey(title: string) {
  return title.trim().toLowerCase();
}

/**
 * Résumé en cache, sans appel réseau (utile pour un affichage instantané).
 *
 * Note : on n'altère jamais l'URL de vignette renvoyée par l'API. Demander une
 * autre largeur à la main se solde par une erreur 400 chez Wikimedia.
 */
export function peekSummary(title: string): WikiSummary | null | undefined {
  loadStore();
  const entry = memory.get(cacheKey(title));
  if (!entry) return undefined;
  const ttl = entry.data ? TTL_MS : NEGATIVE_TTL_MS;
  if (Date.now() - entry.at > ttl) return undefined;
  return entry.data;
}

/** Oublie une entrée du cache, pour forcer un nouvel essai. */
export function forgetSummary(title: string) {
  loadStore();
  memory.delete(cacheKey(title));
  persist();
}

/**
 * Récupère le résumé d'un article. Renvoie null si l'article n'existe pas ou si
 * le réseau est indisponible.
 */
export async function fetchSummary(title: string): Promise<WikiSummary | null> {
  loadStore();
  const key = cacheKey(title);
  const cached = peekSummary(title);
  if (cached !== undefined) return cached;

  await acquire();
  try {
    const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

    let data: WikiSummary | null = null;
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { accept: "application/json" },
      });
      if (response.ok) {
        const json = (await response.json()) as {
          title?: string;
          extract?: string;
          thumbnail?: { source?: string };
          content_urls?: { desktop?: { page?: string } };
        };
        if (json.title && json.extract) {
          data = {
            title: json.title,
            extract: json.extract,
            image: json.thumbnail?.source ?? null,
            pageUrl:
              json.content_urls?.desktop?.page ??
              `https://fr.wikipedia.org/wiki/${encodeURIComponent(json.title)}`,
            credit: "Wikipédia, licence CC BY-SA",
          };
        }
      }
    } catch {
      data = null; // coupure réseau ou délai dépassé
    } finally {
      window.clearTimeout(timer);
    }

    memory.set(key, { at: Date.now(), data });
    persist();
    return data;
  } finally {
    release();
  }
}
