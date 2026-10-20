import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Bookmark,
  CheckCircle2,
  Coins,
  LayoutGrid,
  Lock,
  Package,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { CardArt } from "@/components/card-art";
import { CardTile } from "@/components/card-tile";
import { PageHeader } from "@/components/page-header";
import { RarityBadge } from "@/components/rarity-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CARDS, CARD_BY_ID, RARITY_COUNTS } from "@/data/cards";
import { useGame } from "@/lib/game-store";
import { RARITIES, RARITY_MAP, type Card as CardType, type Rarity } from "@/lib/types";
import { cn, formatNumber, plural } from "@/lib/utils";

const PAGE_SIZE = 24;

type Tab = "possedees" | "manquantes" | "toutes" | "doublons" | "envies";

const TABS: { id: Tab; label: string }[] = [
  { id: "possedees", label: "Possédées" },
  { id: "manquantes", label: "Manquantes" },
  { id: "toutes", label: "Toutes" },
  { id: "doublons", label: "Doublons" },
  { id: "envies", label: "Envies" },
];

export function CollectionPage() {
  const { collection, wishlist, profile, ownedIds, minor, streamer } = useGame();

  const [tab, setTab] = React.useState<Tab>("toutes");
  const [params] = useSearchParams();
  const [query, setQuery] = React.useState(params.get("q") ?? "");
  const [rarity, setRarity] = React.useState<Rarity | null>(null);
  const [page, setPage] = React.useState(1);

  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    collection.forEach((owned) => map.set(owned.cardId, (map.get(owned.cardId) ?? 0) + 1));
    return map;
  }, [collection]);

  const ownedCards = React.useMemo(
    () => CARDS.filter((card) => counts.has(card.id)),
    [counts],
  );
  const duplicates = ownedCards.filter((card) => (counts.get(card.id) ?? 0) > 1);
  const wanted = wishlist
    .map((id) => CARD_BY_ID.get(id))
    .filter((card): card is CardType => Boolean(card));

  const totalValue = collection.reduce((sum, owned) => {
    const card = CARD_BY_ID.get(owned.cardId);
    return sum + (card?.value ?? 0);
  }, 0);

  const rawCompletion = (ownedCards.length / CARDS.length) * 100;
  // Sous 1 %, afficher 0 % donnerait l'impression que rien n'a été trouvé.
  const completion =
    rawCompletion < 1 && rawCompletion > 0
      ? rawCompletion.toFixed(1).replace(".", ",")
      : String(Math.round(rawCompletion));

  // Le contenu de l'onglet, avant recherche et filtres.
  const scope = React.useMemo(() => {
    switch (tab) {
      case "possedees":
        return ownedCards;
      case "manquantes":
        return CARDS.filter((card) => !counts.has(card.id));
      case "doublons":
        return duplicates;
      case "envies":
        return wanted;
      default:
        return CARDS;
    }
  }, [tab, ownedCards, counts, duplicates, wanted]);

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return scope.filter((card) => {
      if (rarity && card.rarity !== rarity) return false;
      if (!needle) return true;
      return `${card.name} ${card.blurb} ${card.category}`.toLowerCase().includes(needle);
    });
  }, [scope, query, rarity]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, [tab, query, rarity]);

  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(1, next), pageCount));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Collection"
        title="Collection"
        description={`${plural(ownedCards.length, "fiche trouvée", "fiches trouvées")} sur ${CARDS.length}. Les cartes que vous ne possédez pas encore restent visibles, en attente d'être découvertes.`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={tab === "possedees" ? "secondary" : "outline"}
              onClick={() => setTab("possedees")}
            >
              <CheckCircle2 className="size-4" /> Ma collection
            </Button>
            <Button asChild>
              <Link to="/paquets">
                <Package className="size-4" /> Ouvrir un paquet
              </Link>
            </Button>
          </div>
        }
      />

      {/* Synthèse compacte : une seule ligne, qui sert aussi de filtre */}
      <div className="rounded-xl border bg-card/60 p-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-xl font-bold tabular-nums">{completion}%</span>
            <span className="text-muted-foreground text-[11px]">
              {ownedCards.length} / {CARDS.length} fiches
            </span>
          </div>

          <div className="order-3 w-full sm:order-none sm:flex-1">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
              {RARITIES.map((rarityItem) => {
                const total = RARITY_COUNTS[rarityItem];
                const owned = ownedCards.filter((card) => card.rarity === rarityItem).length;
                const width = (total / CARDS.length) * 100;
                const fill = total === 0 ? 0 : (owned / total) * 100;
                return (
                  <div key={rarityItem} className="relative" style={{ width: `${width}%` }}>
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{ backgroundColor: RARITY_MAP[rarityItem].accent }}
                    />
                    <div
                      className="absolute inset-y-0 left-0"
                      style={{ width: `${fill}%`, backgroundColor: RARITY_MAP[rarityItem].accent }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
            <span className="flex items-center gap-1 tabular-nums">
              <Coins className="size-3 text-[var(--gold)]" />
              {formatNumber(totalValue)}
            </span>
            <span className="text-muted-foreground">
              {plural(duplicates.length, "doublon", "doublons")}
            </span>
            <span className="text-muted-foreground tabular-nums">
              Niv. {profile.level} · {formatNumber(profile.xp)} XP
            </span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-2">
          {RARITIES.map((rarityItem) => {
            const total = RARITY_COUNTS[rarityItem];
            const owned = ownedCards.filter((card) => card.rarity === rarityItem).length;
            const active = rarity === rarityItem;
            return (
              <button
                key={rarityItem}
                type="button"
                onClick={() => setRarity(active ? null : rarityItem)}
                className={cn(
                  "flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums transition-colors",
                  active ? "bg-accent text-accent-foreground" : "hover:bg-accent/40",
                )}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: RARITY_MAP[rarityItem].accent }}
                />
                <span className="text-muted-foreground">{RARITY_MAP[rarityItem].short}</span>
                <span className="font-medium">
                  {owned}/{total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-1">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                tab === item.id
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent/40",
              )}
            >
              {item.label}
              <span className="text-muted-foreground/70 ml-1 tabular-nums">
                {item.id === "possedees"
                  ? ownedCards.length
                  : item.id === "manquantes"
                    ? CARDS.length - ownedCards.length
                    : item.id === "toutes"
                      ? CARDS.length
                      : item.id === "doublons"
                        ? duplicates.length
                        : wanted.length}
              </span>
            </button>
          ))}
        </div>

        <div className="relative sm:ml-auto sm:w-64">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nom, sujet…"
            className="h-8 pl-8 text-xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
              aria-label="Effacer la recherche"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grille */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <LayoutGrid className="text-muted-foreground size-8" />
          <p className="font-display font-semibold">Rien à afficher</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            {tab === "possedees"
              ? "Ouvrez votre premier paquet : vos fiches apparaîtront ici."
              : tab === "envies"
                ? "Suivez une fiche depuis le catalogue pour la retrouver ici."
                : "Aucune carte ne correspond à cette recherche."}
          </p>
          <Button asChild size="sm">
            <Link to="/paquets">Ouvrir un paquet</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {paged.map((card) => {
            const owned = ownedIds.has(card.id);
            const copies = counts.get(card.id) ?? 0;

            if (owned) {
              return (
                <div key={card.id} className="relative">
                  <CardTile card={card} owned />
                  {copies > 1 && (
                    <Badge className="absolute right-2 bottom-2 z-10 text-[10px]">×{copies}</Badge>
                  )}
                </div>
              );
            }

            // Carte non possédée : visible, mais en attente.
            return (
              <div
                key={card.id}
                className="relative flex cursor-not-allowed flex-col overflow-hidden rounded-xl border border-dashed bg-card/30 opacity-70"
                aria-disabled="true"
                title="Fiche non découverte — ouvrez un paquet pour la trouver"
              >
                <div className="relative">
                  <CardArt
                    card={card}
                    className="h-44 opacity-40 grayscale"
                    glyphClassName="size-14"
                  />
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="grid size-9 place-items-center rounded-full bg-black/40 backdrop-blur-sm">
                      <Lock className="size-4 text-white/70" />
                    </span>
                  </div>
                  <div className="absolute top-2 left-2">
                    <RarityBadge rarity={card.rarity} className="opacity-80" />
                  </div>
                  {card.sensitive && (minor || streamer) && (
                    <span className="absolute top-2 right-2 rounded-full bg-black/50 px-1.5 py-0.5 text-[9px]">
                      sensible
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-3">
                  <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-medium tracking-wide uppercase">
                    <span>{card.category}</span>
                  </div>
                  <h3 className="font-display text-[15px] leading-tight font-semibold text-balance text-muted-foreground">
                    {card.name}
                  </h3>
                  <p className="text-muted-foreground/70 line-clamp-2 text-xs leading-snug">
                    {card.blurb}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
                      <Lock className="size-3" /> à découvrir
                    </span>
                    <span className="text-muted-foreground/70 flex items-center gap-1 text-xs tabular-nums">
                      <Coins className="size-3.5" /> {formatNumber(card.value)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-muted-foreground text-xs tabular-nums">
            {(currentPage - 1) * PAGE_SIZE + 1} à {Math.min(currentPage * PAGE_SIZE, filtered.length)}{" "}
            sur {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <span className="text-muted-foreground px-2 text-xs tabular-nums">
              {currentPage} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === pageCount}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      <div className="text-muted-foreground flex flex-wrap items-center gap-2 border-t pt-3 text-[11px]">
        <CheckCircle2 className="size-3.5 text-emerald-400" />
        {plural(ownedCards.length, "fiche trouvée", "fiches trouvées")}, dont{" "}
        {plural(duplicates.length, "doublon", "doublons")} conservés pour la fusion.
        <Link to="/paquets" className="text-primary flex items-center gap-1 hover:underline">
          <Sparkles className="size-3" /> Compléter
        </Link>
        {wanted.length > 0 && (
          <Link to="#" className="text-primary ml-auto flex items-center gap-1 hover:underline" onClick={(e) => e.preventDefault()}>
            <Bookmark className="size-3" /> {plural(wanted.length, "envie", "envies")}
          </Link>
        )}
      </div>
    </div>
  );
}
