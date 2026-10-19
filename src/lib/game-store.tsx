import * as React from "react";
import { CARDS, drawCard } from "@/data/cards";
import type { Card, OwnedCard, Profile } from "@/lib/types";
import { RARITY_MAP } from "@/lib/types";

const STORAGE_KEY = "wikitcg:state:v1";

export const PACK_PRICE = 900;
export const PACK_SIZE = 5;
/** Nombre de paquets gratuits qu'on peut mettre de côté. */
export const PACK_RESERVE_MAX = 10;
export const FREE_INTERVAL_MS = 10 * 60 * 1000;
export const PRO_INTERVAL_MS = 3 * 60 * 1000;

export type PackOpenResult =
  | { ok: true; cards: Card[]; mode: PackMode }
  | { ok: false; reason: "reserve" | "credits" };

export type PackMode = "gratuit" | "credits";

type GameState = {
  /** Y a-t-il quelqu'un de connecté ? Simulé : aucun mot de passe, aucun serveur. */
  signedIn: boolean;
  profile: Profile;
  collection: OwnedCard[];
  wishlist: string[];
  /** Paquets gratuits disponibles (0 à PACK_RESERVE_MAX). */
  packsReady: number;
  /** Date (ms) d'arrivée du prochain paquet gratuit. */
  nextPackAt: number;
  /** Abonnement « temps » : simulé, change seulement le rythme des paquets. */
  pro: boolean;
  ready: boolean;
};

type GameContextValue = GameState & {
  ownedIds: Set<string>;
  owns: (cardId: string) => boolean;
  openPack: (mode?: PackMode) => PackOpenResult;
  addCard: (card: Card, edition?: OwnedCard["edition"]) => void;
  buyCard: (card: Card) => boolean;
  toggleWishlist: (cardId: string) => void;
  signIn: (email: string, displayName?: string) => void;
  signOut: () => void;
  setPro: (value: boolean) => void;
  /** Rythme actuel, en millisecondes. */
  interval: number;
  theme: "dark" | "light";
  toggleTheme: () => void;
  resetProgress: () => void;
};

const GameContext = React.createContext<GameContextValue | null>(null);

function makeProfile(email: string, displayName: string): Profile {
  return {
    handle: displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20) || "collectionneur",
    displayName,
    email,
    joinedAt: new Date().toISOString(),
    bio: "Collectionneur de savoirs. Je complète la série « Pierres & empires ».",
    credits: 4200,
    xp: 1240,
    level: 7,
    duelWins: 23,
    duelLosses: 11,
    packsOpened: 14,
    guild: "Les Archivistes",
  };
}

/** Profil d'un visiteur non connecté : rien à afficher, rien à collectionner. */
function guestProfile(): Profile {
  return {
    handle: "visiteur",
    displayName: "Visiteur",
    email: "",
    joinedAt: new Date().toISOString(),
    bio: "",
    credits: 0,
    xp: 0,
    level: 1,
    duelWins: 0,
    duelLosses: 0,
    packsOpened: 0,
    guild: "—",
  };
}

function seedCollection(): OwnedCard[] {
  const picks = CARDS.filter((card) =>
    [
      "abeille",
      "gravitation",
      "stonehenge",
      "frida-kahlo",
      "boussole",
      "odyssee",
      "loup-gris",
      "telescope",
      "vitrail-gothique",
      "tableau-periodique",
      "machu-picchu",
      "beethoven",
    ].includes(card.slug),
  );
  return picks.map((card, index) => ({
    id: `own_seed_${index}`,
    cardId: card.id,
    obtainedAt: new Date(Date.now() - index * 86_400_000).toISOString(),
    edition: index % 7 === 0 ? "holo" : "standard",
  }));
}

const SEED_WISHLIST = ["card_grande-vague", "card-trou-noir"];

function createInitialState(): GameState {
  return {
    signedIn: false,
    profile: guestProfile(),
    collection: [],
    wishlist: [],
    packsReady: 0,
    nextPackAt: 0,
    pro: false,
    ready: false,
  };
}

function readStored(): Partial<GameState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<GameState>) : null;
  } catch {
    return null;
  }
}

/**
 * Fait avancer la réserve de paquets gratuits au rythme écoulé.
 *
 * ATTENTION : dans cette maquette, le minuteur est simulé dans le navigateur.
 * Ce n'est pas un mécanisme sûr — un joueur peut modifier son horloge. Le vrai
 * minuteur doit vivre sur le serveur (voir docs/ouverture-paquet.md).
 */
function catchUpPacks(state: GameState, now: number): GameState {
  if (!state.signedIn) return state;

  const interval = state.pro ? PRO_INTERVAL_MS : FREE_INTERVAL_MS;
  if (state.packsReady >= PACK_RESERVE_MAX) {
    // Réserve pleine : le compte à rebours reste figé, rien ne s'accumule au-delà.
    return state.nextPackAt === now ? state : { ...state, nextPackAt: now };
  }

  let packsReady = state.packsReady;
  let nextPackAt = state.nextPackAt || now + interval;

  if (now < nextPackAt) return state;

  while (now >= nextPackAt && packsReady < PACK_RESERVE_MAX) {
    packsReady += 1;
    nextPackAt += interval;
  }

  if (packsReady >= PACK_RESERVE_MAX) nextPackAt = now;

  return { ...state, packsReady, nextPackAt };
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<GameState>(createInitialState);
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");

  React.useEffect(() => {
    const stored = readStored();
    setState((prev) => {
      const merged = { ...prev, ...(stored ?? {}), ready: true };
      return catchUpPacks(merged, Date.now());
    });
    const storedTheme = localStorage.getItem("wikitcg:theme");
    const nextTheme = storedTheme === "light" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  React.useEffect(() => {
    if (!state.ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Le minuteur n'est vérifié qu'une fois par seconde : léger, et suffisant.
  React.useEffect(() => {
    if (!state.signedIn) return;
    const timer = window.setInterval(() => {
      setState((prev) => catchUpPacks(prev, Date.now()));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [state.signedIn]);

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      localStorage.setItem("wikitcg:theme", next);
      return next;
    });
  }, []);

  const ownedIds = React.useMemo(
    () => new Set(state.collection.map((owned) => owned.cardId)),
    [state.collection],
  );

  const addCard = React.useCallback((card: Card, edition: OwnedCard["edition"] = "standard") => {
    setState((prev) => {
      const xpGain = Math.round(RARITY_MAP[card.rarity].baseValue / 20);
      return {
        ...prev,
        collection: [
          ...prev.collection,
          {
            id: `own_${card.id}_${Date.now()}_${Math.round(Math.random() * 1e6)}`,
            cardId: card.id,
            obtainedAt: new Date().toISOString(),
            edition,
          },
        ],
        profile: { ...prev.profile, xp: prev.profile.xp + xpGain },
      };
    });
  }, []);

  const openPack = React.useCallback(
    (mode: PackMode = "gratuit"): PackOpenResult => {
      let result: PackOpenResult = { ok: false, reason: "reserve" };

      setState((prev) => {
        if (mode === "gratuit" && prev.packsReady <= 0) {
          result = { ok: false, reason: "reserve" };
          return prev;
        }
        if (mode === "credits" && prev.profile.credits < PACK_PRICE) {
          result = { ok: false, reason: "credits" };
          return prev;
        }

        const interval = prev.pro ? PRO_INTERVAL_MS : FREE_INTERVAL_MS;
        const drawn = Array.from({ length: PACK_SIZE }, () => drawCard());
        result = { ok: true, cards: drawn, mode };

        const owned: OwnedCard[] = drawn.map((card, index) => ({
          id: `own_${card.id}_${Date.now()}_${index}`,
          cardId: card.id,
          obtainedAt: new Date().toISOString(),
          edition:
            card.rarity === "legendaire" || card.rarity === "ultra-rare" ? "prestige" : "standard",
        }));
        const xpGain = drawn.reduce(
          (sum, card) => sum + Math.round(RARITY_MAP[card.rarity].baseValue / 20),
          0,
        );

        // Le paquet gratuit consomme une place de la réserve ; le payant non.
        let packsReady = prev.packsReady;
        let nextPackAt = prev.nextPackAt;
        if (mode === "gratuit") {
          const wasFull = prev.packsReady >= PACK_RESERVE_MAX;
          packsReady = prev.packsReady - 1;
          // Si la réserve était pleine, le décompte repart de maintenant.
          nextPackAt = wasFull ? Date.now() + interval : prev.nextPackAt;
        }

        return {
          ...prev,
          packsReady,
          nextPackAt,
          collection: [...prev.collection, ...owned],
          profile: {
            ...prev.profile,
            credits: mode === "credits" ? prev.profile.credits - PACK_PRICE : prev.profile.credits,
            xp: prev.profile.xp + xpGain,
            packsOpened: prev.profile.packsOpened + 1,
          },
        };
      });

      return result;
    },
    [],
  );

  const buyCard = React.useCallback((card: Card): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.profile.credits < card.value) return prev;
      success = true;
      return {
        ...prev,
        collection: [
          ...prev.collection,
          {
            id: `own_${card.id}_${Date.now()}`,
            cardId: card.id,
            obtainedAt: new Date().toISOString(),
            edition: "standard",
          },
        ],
        profile: { ...prev.profile, credits: prev.profile.credits - card.value },
      };
    });
    return success;
  }, []);

  const toggleWishlist = React.useCallback((cardId: string) => {
    setState((prev) => ({
      ...prev,
      wishlist: prev.wishlist.includes(cardId)
        ? prev.wishlist.filter((id) => id !== cardId)
        : [...prev.wishlist, cardId],
    }));
  }, []);

  /**
   * Connexion simulée : on ne vérifie aucun mot de passe et rien ne quitte le
   * navigateur. Sert uniquement à distinguer « visiteur » de « connecté ».
   */
  const signIn = React.useCallback((email: string, displayName = "Collectionneur") => {
    setState((prev) => {
      const now = Date.now();
      return {
        ...prev,
        signedIn: true,
        profile: { ...makeProfile(email, displayName), xp: prev.profile.xp, credits: 4200 },
        collection: prev.collection.length > 0 ? prev.collection : seedCollection(),
        wishlist: prev.wishlist.length > 0 ? prev.wishlist : SEED_WISHLIST,
        // Petite réserve de départ pour ne pas arriver devant un écran vide.
        packsReady: prev.packsReady > 0 ? prev.packsReady : 3,
        nextPackAt: prev.nextPackAt > now ? prev.nextPackAt : now + FREE_INTERVAL_MS,
      };
    });
  }, []);

  const signOut = React.useCallback(() => {
    setState((prev) => ({ ...prev, signedIn: false }));
  }, []);

  /** Abonnement « temps » : simulé, aucun paiement. */
  const setPro = React.useCallback((value: boolean) => {
    setState((prev) => {
      const now = Date.now();
      const interval = value ? PRO_INTERVAL_MS : FREE_INTERVAL_MS;
      return {
        ...prev,
        pro: value,
        nextPackAt: prev.packsReady >= PACK_RESERVE_MAX ? now : now + interval,
      };
    });
  }, []);

  const resetProgress = React.useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ ...createInitialState(), ready: true });
  }, []);

  const value: GameContextValue = {
    ...state,
    interval: state.pro ? PRO_INTERVAL_MS : FREE_INTERVAL_MS,
    ownedIds,
    owns: (cardId) => state.signedIn && ownedIds.has(cardId),
    openPack,
    addCard,
    buyCard,
    toggleWishlist,
    signIn,
    signOut,
    setPro,
    theme,
    toggleTheme,
    resetProgress,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = React.useContext(GameContext);
  if (!ctx) throw new Error("useGame doit être utilisé dans <GameProvider>");
  return ctx;
}

/** Petite horloge locale, pour afficher un compte à rebours seconde par seconde. */
export function useNow(active = true, stepMs = 1000) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setNow(Date.now()), stepMs);
    return () => window.clearInterval(timer);
  }, [active, stepMs]);
  return now;
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
