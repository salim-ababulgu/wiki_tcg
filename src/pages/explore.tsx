import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Filter, LayoutGrid, Rows3, Search, SlidersHorizontal, X } from "lucide-react";
import { CardTile } from "@/components/card-tile";
import { PageHeader } from "@/components/page-header";
import { RarityBadge } from "@/components/rarity-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CARDS, SETS } from "@/data/cards";
import { useGame } from "@/lib/game-store";
import { CATEGORIES, RARITIES, RARITY_MAP, type Category, type Rarity } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

const SORTS = [
  { id: "pertinence", label: "Pertinence" },
  { id: "valeur", label: "Valeur" },
  { id: "rarete", label: "Rareté" },
  { id: "nom", label: "Nom (A→Z)" },
  { id: "savoir", label: "Savoir" },
] as const;

const RARITY_ORDER = Object.fromEntries(RARITIES.map((rarity, index) => [rarity, index]));

export function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const { ownedIds } = useGame();
  const [query, setQuery] = React.useState(params.get("q") ?? "");
  const [dense, setDense] = React.useState(false);

  const selectedRarities = (params.get("rarete")?.split(",").filter(Boolean) ?? []) as Rarity[];
  const category = (params.get("categorie") ?? "toutes") as Category | "toutes";
  const setFilter = params.get("edition") ?? "toutes";
  const sort = (params.get("tri") ?? "pertinence") as (typeof SORTS)[number]["id"];
  const ownedOnly = params.get("possedees") === "1";

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null || value === "" || value === "toutes" || value === "0") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const toggleRarity = (rarity: Rarity) => {
    const next = selectedRarities.includes(rarity)
      ? selectedRarities.filter((item) => item !== rarity)
      : [...selectedRarities, rarity];
    update("rarete", next.join(","));
  };

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    let list = CARDS.filter((card) => {
      if (selectedRarities.length > 0 && !selectedRarities.includes(card.rarity)) return false;
      if (category !== "toutes" && card.category !== category) return false;
      if (setFilter !== "toutes" && card.set !== setFilter) return false;
      if (ownedOnly && !ownedIds.has(card.id)) return false;
      if (!needle) return true;
      return [card.name, card.blurb, card.category, card.era, card.origin, ...card.tags]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "valeur":
          return b.value - a.value;
        case "rarete":
          return RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity] || b.value - a.value;
        case "nom":
          return a.name.localeCompare(b.name, "fr");
        case "savoir":
          return b.stats.savoir - a.stats.savoir;
        default:
          return a.name.localeCompare(b.name, "fr");
      }
    });

    return list;
  }, [query, selectedRarities, category, setFilter, ownedOnly, sort, ownedIds]);

  const activeFilters = selectedRarities.length + (category !== "toutes" ? 1 : 0) +
    (setFilter !== "toutes" ? 1 : 0) + (ownedOnly ? 1 : 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalogue"
        title="Explorer les fiches"
        description={`${CARDS.length} cartes réparties en ${SETS.length} éditions. Filtrez par rareté, catégorie ou édition, puis triez selon votre objectif de collection.`}
        actions={
          <Badge variant="secondary" className="h-8 gap-1.5 px-3 text-xs">
            <LayoutGrid className="size-3.5" /> {formatNumber(filtered.length)} résultat
            {filtered.length > 1 ? "s" : ""}
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Filtres */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-xs tracking-wide uppercase">
              Recherche
            </Label>
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  update("q", event.target.value || null);
                }}
                placeholder="Nom, époque, origine…"
                className="pl-9"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2.5">
            <p className="text-xs font-semibold tracking-wide uppercase">Rareté</p>
            <div className="space-y-1">
              {RARITIES.map((rarity) => {
                const info = RARITY_MAP[rarity];
                const active = selectedRarities.includes(rarity);
                return (
                  <button
                    key={rarity}
                    type="button"
                    onClick={() => toggleRarity(rarity)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      active ? "bg-accent text-accent-foreground" : "hover:bg-accent/40",
                    )}
                  >
                    <span
                      className="grid size-5 place-items-center rounded border text-[9px] font-bold"
                      style={{
                        borderColor: `color-mix(in oklch, ${info.accent} 50%, transparent)`,
                        color: info.accent,
                        backgroundColor: active
                          ? `color-mix(in oklch, ${info.accent} 18%, transparent)`
                          : "transparent",
                      }}
                    >
                      {active ? <Check className="size-3" /> : info.short}
                    </span>
                    <span className="flex-1 text-left">{info.label}</span>
                    <span className="text-muted-foreground text-[11px] tabular-nums">
                      {CARDS.filter((card) => card.rarity === rarity).length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="space-y-2.5">
            <p className="text-xs font-semibold tracking-wide uppercase">Catégorie</p>
            <div className="flex flex-wrap gap-1.5">
              {(["toutes", ...CATEGORIES] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => update("categorie", item)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    category === item
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-accent/40",
                  )}
                >
                  {item === "toutes" ? "Toutes" : item}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide uppercase">Édition</p>
            <Select value={setFilter} onValueChange={(value) => update("edition", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toutes">Toutes les éditions</SelectItem>
                {SETS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="owned-only" className="text-sm font-normal">
              Seulement mes cartes
            </Label>
            <Switch
              id="owned-only"
              checked={ownedOnly}
              onCheckedChange={(checked) => update("possedees", checked ? "1" : null)}
            />
          </div>

          {activeFilters > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setParams(new URLSearchParams(), { replace: true })}
            >
              <X className="size-3.5" /> Réinitialiser ({activeFilters})
            </Button>
          )}
        </aside>

        {/* Résultats */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <SlidersHorizontal className="size-3.5" />
              Trier par
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {SORTS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => update("tri", option.id === "pertinence" ? null : option.id)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    sort === option.id
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-accent/40",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant={dense ? "ghost" : "secondary"}
                size="icon-sm"
                onClick={() => setDense(false)}
                aria-label="Vue confortable"
              >
                <LayoutGrid className="size-3.5" />
              </Button>
              <Button
                variant={dense ? "secondary" : "ghost"}
                size="icon-sm"
                onClick={() => setDense(true)}
                aria-label="Vue compacte"
              >
                <Rows3 className="size-3.5" />
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
              <Filter className="text-muted-foreground size-8" />
              <p className="font-display font-semibold">Aucune carte ne correspond</p>
              <p className="text-muted-foreground max-w-sm text-sm">
                Essayez un autre terme, ou retirez quelques filtres.
              </p>
              <Button variant="outline" size="sm" onClick={() => setParams(new URLSearchParams())}>
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-4",
                dense
                  ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4",
              )}
            >
              {filtered.map((card) => (
                <CardTile
                  key={card.id}
                  card={card}
                  compact={dense}
                  owned={ownedIds.has(card.id)}
                />
              ))}
            </div>
          )}

          {selectedRarities.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 border-t pt-3">
              <span className="text-muted-foreground text-xs">Filtres actifs :</span>
              {selectedRarities.map((rarity) => (
                <button key={rarity} type="button" onClick={() => toggleRarity(rarity)}>
                  <RarityBadge rarity={rarity} withLabel className="hover:opacity-80" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
