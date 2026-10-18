import * as React from "react";
import { CARDS, drawCard } from "@/data/cards";
import type { Card, OwnedCard, Profile } from "@/lib/types";
import { RARITY_MAP } from "@/lib/types";

const STORAGE_KEY = "wikitcg:state:v1";

export const PACK_PRICE = 900;
export const PACK_SIZE = 5;

type GameState = {
  profile: Profile;
  collection: OwnedCard[];
  wishlist: string[];
  ready: boolean;
};

type GameContextValue = GameState & {
  ownedIds: Set<string>;
  owns: (cardId: string) => boolean;
  openPack: () => Card[] | null;
  addCard: (card: Card, edition?: OwnedCard["edition"]) => void;
  buyCard: (card: Card) => boolean;
  toggleWishlist: (cardId: string) => void;
  login: (email: string, displayName?: string) => void;
  logout: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  resetProgress: () => void;
};

const GameContext = React.createContext<GameContextValue | null>(null);

function defaultProfile(email: string, displayName: string): Profile {
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

function createInitialState(): GameState {
  return {
    profile: defaultProfile("salim@wikitcg.app", "Salim"),
    collection: seedCollection(),
    wishlist: ["card_grande-vague", "card_trou-noir"],
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

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<GameState>(createInitialState);
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");

  React.useEffect(() => {
    const stored = readStored();
    setState((prev) => ({ ...prev, ...(stored ?? {}), ready: true }));
    const storedTheme = localStorage.getItem("wikitcg:theme");
    const nextTheme = storedTheme === "light" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  React.useEffect(() => {
    if (!state.ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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

  const openPack = React.useCallback((): Card[] | null => {
    let success = false;
    let drawn: Card[] = [];
    setState((prev) => {
      if (prev.profile.credits < PACK_PRICE) return prev;
      success = true;
      drawn = Array.from({ length: PACK_SIZE }, () => drawCard());
      const owned: OwnedCard[] = drawn.map((card, index) => ({
        id: `own_${card.id}_${Date.now()}_${index}`,
        cardId: card.id,
        obtainedAt: new Date().toISOString(),
        edition: card.rarity === "legendaire" || card.rarity === "ultra-rare" ? "prestige" : "standard",
      }));
      const xpGain = drawn.reduce((sum, card) => sum + Math.round(RARITY_MAP[card.rarity].baseValue / 20), 0);
      return {
        ...prev,
        collection: [...prev.collection, ...owned],
        profile: {
          ...prev.profile,
          credits: prev.profile.credits - PACK_PRICE,
          xp: prev.profile.xp + xpGain,
          packsOpened: prev.profile.packsOpened + 1,
        },
      };
    });
    return success ? drawn : null;
  }, []);

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
      } as GameState;
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

  const login = React.useCallback((email: string, displayName = "Collectionneur") => {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, email, displayName } }));
  }, []);

  const logout = React.useCallback(() => {
    setState(createInitialState());
  }, []);

  const resetProgress = React.useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ ...createInitialState(), ready: true });
  }, []);

  const value: GameContextValue = {
    ...state,
    ownedIds,
    owns: (cardId) => ownedIds.has(cardId),
    openPack,
    addCard,
    buyCard,
    toggleWishlist,
    login,
    logout,
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
