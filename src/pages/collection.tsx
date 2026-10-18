import * as React from "react";
import { Link } from "react-router-dom";
import { Bookmark, Coins, LayoutGrid, Package, Sparkles, TrendingUp } from "lucide-react";
import { CardTile } from "@/components/card-tile";
import { PageHeader } from "@/components/page-header";
import { RarityBadge } from "@/components/rarity-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CARDS, CARD_BY_ID, RARITY_COUNTS } from "@/data/cards";
import { useGame } from "@/lib/game-store";
import { RARITIES, RARITY_MAP, type Card as CardType } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export function CollectionPage() {
  const { collection, wishlist, profile } = useGame();

  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    collection.forEach((owned) => map.set(owned.cardId, (map.get(owned.cardId) ?? 0) + 1));
    return map;
  }, [collection]);

  const ownedCards = React.useMemo(
    () =>
      Array.from(counts.keys())
        .map((id) => CARD_BY_ID.get(id))
        .filter((card): card is CardType => Boolean(card))
        .sort((a, b) => b.value - a.value),
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

  const completion = Math.round((ownedCards.length / CARDS.length) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ma collection"
        title="Votre encyclopédie"
        description={`${ownedCards.length} fiches distinctes sur ${CARDS.length}, ${collection.length} cartes au total. Valeur estimée de la collection : ${formatNumber(totalValue)} crédits.`}
        actions={
          <Button asChild>
            <Link to="/paquets">
              <Package className="size-4" /> Compléter
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/60 py-4">
          <CardContent className="space-y-1">
            <p className="text-muted-foreground text-[11px] tracking-wide uppercase">Progression</p>
            <p className="font-display text-2xl font-bold tabular-nums">{completion}%</p>
            <Progress value={completion} className="mt-1 h-1.5" />
          </CardContent>
        </Card>
        <Card className="bg-card/60 py-4">
          <CardContent className="space-y-1">
            <p className="text-muted-foreground text-[11px] tracking-wide uppercase">Valeur</p>
            <p className="font-display flex items-center gap-1.5 text-2xl font-bold tabular-nums">
              <Coins className="size-4 text-[var(--gold)]" />
              {formatNumber(totalValue)}
            </p>
            <p className="text-muted-foreground text-[11px] flex items-center gap-1">
              <TrendingUp className="size-3 text-emerald-400" /> +8,4 % cette semaine
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/60 py-4">
          <CardContent className="space-y-1">
            <p className="text-muted-foreground text-[11px] tracking-wide uppercase">Doublons</p>
            <p className="font-display text-2xl font-bold tabular-nums">{duplicates.length}</p>
            <p className="text-muted-foreground text-[11px]">fiches échangeables</p>
          </CardContent>
        </Card>
        <Card className="bg-card/60 py-4">
          <CardContent className="space-y-1">
            <p className="text-muted-foreground text-[11px] tracking-wide uppercase">Niveau</p>
            <p className="font-display text-2xl font-bold tabular-nums">{profile.level}</p>
            <p className="text-muted-foreground text-[11px]">{formatNumber(profile.xp)} XP</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="font-display text-base">Répartition par rareté</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {RARITIES.map((rarity) => {
            const total = RARITY_COUNTS[rarity];
            const owned = ownedCards.filter((card) => card.rarity === rarity).length;
            const percent = total === 0 ? 0 : Math.round((owned / total) * 100);
            return (
              <div key={rarity} className="flex items-center gap-3">
                <RarityBadge rarity={rarity} className="w-16 justify-center" />
                <Progress
                  value={percent}
                  className="h-1.5 flex-1"
                  indicatorStyle={{ backgroundColor: RARITY_MAP[rarity].accent }}
                />
                <span className="text-muted-foreground w-16 text-right text-xs tabular-nums">
                  {owned}/{total}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Tabs defaultValue="toutes">
        <TabsList>
          <TabsTrigger value="toutes">
            <LayoutGrid className="size-3.5" /> Toutes ({ownedCards.length})
          </TabsTrigger>
          <TabsTrigger value="doublons">
            <Sparkles className="size-3.5" /> Doublons ({duplicates.length})
          </TabsTrigger>
          <TabsTrigger value="envies">
            <Bookmark className="size-3.5" /> Envies ({wanted.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="toutes">
          {ownedCards.length === 0 ? (
            <EmptyCollection />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {ownedCards.map((card) => (
                <div key={card.id} className="relative">
                  <CardTile card={card} owned />
                  {(counts.get(card.id) ?? 0) > 1 && (
                    <Badge className="absolute right-2 bottom-2 z-10 text-[10px]">
                      ×{counts.get(card.id)}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="doublons">
          {duplicates.length === 0 ? (
            <p className="text-muted-foreground rounded-xl border border-dashed py-12 text-center text-sm">
              Aucun doublon pour l'instant. Ouvrez d'autres paquets pour commencer à échanger.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {duplicates.map((card) => (
                <CardTile key={card.id} card={card} owned />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="envies">
          {wanted.length === 0 ? (
            <p className="text-muted-foreground rounded-xl border border-dashed py-12 text-center text-sm">
              Votre liste d'envies est vide. Suivez une fiche depuis sa page pour la retrouver ici.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {wanted.map((card) => (
                <CardTile key={card.id} card={card} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyCollection() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
      <LayoutGrid className="text-muted-foreground size-8" />
      <p className="font-display font-semibold">Votre collection est vide</p>
      <p className="text-muted-foreground max-w-sm text-sm">
        Ouvrez votre premier paquet pour recevoir cinq fiches tirées au hasard.
      </p>
      <Button asChild size="sm">
        <Link to="/paquets">Ouvrir un paquet</Link>
      </Button>
    </div>
  );
}
