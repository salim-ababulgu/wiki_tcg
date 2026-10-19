import * as React from "react";
import { Link } from "react-router-dom";
import { Coins, Swords, Trophy, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import { CardArt } from "@/components/card-art";
import { PageHeader } from "@/components/page-header";
import { RarityBadge } from "@/components/rarity-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CARDS, CARD_BY_ID } from "@/data/cards";
import { useGame } from "@/lib/game-store";
import { RARITIES, type Card as CardType } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

const ATTRIBUTES = [
  { key: "savoir", label: "Savoir" },
  { key: "influence", label: "Influence" },
  { key: "singularite", label: "Singularité" },
] as const;

type RoundResult = {
  mine: CardType;
  theirs: CardType;
  wins: number;
  losses: number;
  outcome: "victoire" | "défaite" | "égalité";
};

export function DuelPage() {
  const { collection, profile } = useGame();
  const [hand, setHand] = React.useState<string[]>([]);
  const [phase, setPhase] = React.useState<"select" | "battle" | "result">("select");
  const [rounds, setRounds] = React.useState<RoundResult[]>([]);
  const [visibleRounds, setVisibleRounds] = React.useState(0);

  const ownedCards = React.useMemo(() => {
    const ids = Array.from(new Set(collection.map((owned) => owned.cardId)));
    return ids
      .map((id) => CARD_BY_ID.get(id))
      .filter((card): card is CardType => Boolean(card))
      .sort((a, b) => b.value - a.value);
  }, [collection]);

  const toggle = (cardId: string) => {
    setHand((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : prev.length >= 3
          ? prev
          : [...prev, cardId],
    );
  };

  const play = () => {
    if (hand.length !== 3) {
      toast.error("Sélectionnez exactement trois cartes.");
      return;
    }

    const mine = hand.map((id) => CARD_BY_ID.get(id)!).filter(Boolean);
    const budget = mine.reduce((sum, card) => sum + card.value, 0) / 3;
    const pool = CARDS.filter(
      (card) => Math.abs(card.value - budget) < budget * 0.9 || RARITIES.indexOf(card.rarity) >= 3,
    );
    const theirs = Array.from({ length: 3 }, () => {
      const card = pool[Math.floor(Math.random() * pool.length)] ?? CARDS[0];
      return card;
    });

    const results: RoundResult[] = mine.map((card, index) => {
      const opponent = theirs[index];
      let wins = 0;
      let losses = 0;
      ATTRIBUTES.forEach((attribute) => {
        if (card.stats[attribute.key] > opponent.stats[attribute.key]) wins += 1;
        else if (card.stats[attribute.key] < opponent.stats[attribute.key]) losses += 1;
      });
      const outcome =
        wins > losses ? "victoire" : wins < losses ? "défaite" : "égalité";
      return { mine: card, theirs: opponent, wins, losses, outcome };
    });

    setRounds(results);
    setVisibleRounds(0);
    setPhase("battle");
    results.forEach((_, index) => {
      window.setTimeout(() => {
        setVisibleRounds(index + 1);
        if (index === results.length - 1) setPhase("result");
      }, 700 * (index + 1));
    });
  };

  const wins = rounds.filter((round) => round.outcome === "victoire").length;
  const victory = wins >= 2;
  const reward = victory ? 320 + wins * 140 : 60;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Duels"
        title="Défier un collectionneur"
        description="Choisissez trois cartes, affrontez une main adverse tirée à niveau comparable et dominez au moins deux attributs par manche pour l'emporter."
        actions={
          <Badge variant="secondary" className="h-8 gap-1.5 px-3">
            <Trophy className="size-3.5 text-[var(--gold)]" /> {profile.duelWins}V —{" "}
            {profile.duelLosses}D
          </Badge>
        }
      />

      {phase === "select" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Votre main</h2>
              <span className="text-muted-foreground text-sm tabular-nums">
                {hand.length} / 3 sélectionnées
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {ownedCards.map((card) => {
                const selected = hand.includes(card.id);
                const order = hand.indexOf(card.id) + 1;
                return (
                  <button
                    type="button"
                    key={card.id}
                    onClick={() => toggle(card.id)}
                    className={cn(
                      "relative overflow-hidden rounded-xl border text-left transition-all",
                      selected
                        ? "border-primary ring-primary/40 ring-2"
                        : "hover:border-primary/40 opacity-90 hover:opacity-100",
                    )}
                  >
                    <CardArt card={card} className="h-24" glyphClassName="size-8" />
                    <div className="space-y-1 p-2">
                      <p className="truncate text-xs font-semibold">{card.name}</p>
                      <RarityBadge rarity={card.rarity} />
                    </div>
                    {selected && (
                      <span className="bg-primary text-primary-foreground absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full text-[10px] font-bold">
                        {order}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {ownedCards.length < 3 && (
              <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
                Il vous faut au moins trois cartes.{" "}
                <Link to="/paquets" className="text-primary underline-offset-4 hover:underline">
                  Ouvrez un paquet
                </Link>{" "}
                pour compléter votre main.
              </p>
            )}
          </div>

          <aside className="space-y-4">
            <Card className="bg-card/60">
              <CardHeader>
                <CardTitle className="font-display text-sm">Main sélectionnée</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hand.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Aucune carte choisie. Les attributs s'additionnent pour estimer votre force.
                  </p>
                ) : (
                  hand.map((id, index) => {
                    const card = CARD_BY_ID.get(id);
                    if (!card) return null;
                    return (
                      <div key={id} className="flex items-center gap-2 text-sm">
                        <span className="bg-muted grid size-5 place-items-center rounded text-[10px] font-bold">
                          {index + 1}
                        </span>
                        <span className="flex-1 truncate">{card.name}</span>
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {card.stats.savoir}
                        </span>
                      </div>
                    );
                  })
                )}
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Force estimée</span>
                  <span className="font-semibold tabular-nums">
                    {hand.reduce((sum, id) => {
                      const card = CARD_BY_ID.get(id);
                      return sum + (card ? card.stats.savoir + card.stats.influence : 0);
                    }, 0)}
                  </span>
                </div>
                <Button className="w-full" onClick={play} disabled={hand.length !== 3}>
                  <Swords className="size-4" /> Lancer le duel
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/60">
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p className="text-foreground flex items-center gap-1.5 font-medium">
                  <Zap className="size-3.5" /> Règles express
                </p>
                <p>Chaque manche compare Savoir, Influence et Singularité.</p>
                <p>Deux attributs dominés = manche gagnée.</p>
                <p>Deux manches gagnées = duel remporté et WikiCrédits à la clé.</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}

      {(phase === "battle" || phase === "result") && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              {phase === "battle" ? "Duel en cours…" : victory ? "Duel remporté" : "Duel perdu"}
            </h2>
            <Badge variant={victory ? "default" : "secondary"}>
              {wins} manche{wins > 1 ? "s" : ""} sur {rounds.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {rounds.map((round, index) => {
              const visible = index < visibleRounds;
              return (
                <div
                  key={round.mine.id + index}
                  className={cn(
                    "grid items-center gap-3 rounded-xl border p-3 transition-all duration-500 sm:grid-cols-[1fr_auto_1fr]",
                    visible ? "animate-rise-in opacity-100" : "opacity-30",
                    round.outcome === "victoire" && visible && "border-emerald-500/40",
                    round.outcome === "défaite" && visible && "border-red-500/30",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <CardArt card={round.mine} className="h-16 w-12 shrink-0 rounded-md" showGlyph={false} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{round.mine.name}</p>
                      <RarityBadge rarity={round.mine.rarity} />
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={cn(
                        "text-[11px] font-semibold uppercase",
                        round.outcome === "victoire"
                          ? "text-emerald-400"
                          : round.outcome === "défaite"
                            ? "text-red-400"
                            : "text-muted-foreground",
                      )}
                    >
                      {visible ? round.outcome : "—"}
                    </span>
                    <div className="flex gap-2">
                      {ATTRIBUTES.map((attribute) => {
                        const my = round.mine.stats[attribute.key];
                        const their = round.theirs.stats[attribute.key];
                        return (
                          <span
                            key={attribute.key}
                            className={cn(
                              "rounded px-1.5 py-0.5 font-mono text-[10px] tabular-nums",
                              my > their
                                ? "bg-emerald-500/15 text-emerald-300"
                                : my < their
                                  ? "bg-red-500/15 text-red-300"
                                  : "bg-muted text-muted-foreground",
                            )}
                          >
                            {my}–{their}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <div className="min-w-0 text-right">
                      <p className="truncate text-sm font-medium">{round.theirs.name}</p>
                      <p className="text-muted-foreground text-[11px]">Adversaire</p>
                    </div>
                    <CardArt card={round.theirs} className="h-16 w-12 shrink-0 rounded-md" showGlyph={false} />
                  </div>
                </div>
              );
            })}
          </div>

          {phase === "result" && (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
              <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="font-display text-lg font-semibold">
                    {victory ? "Belle démonstration !" : "L'adversaire a mieux joué"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Récompense : {formatNumber(reward)} WikiCrédits · {victory ? "+140" : "+30"} XP
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPhase("select");
                      setHand([]);
                      setRounds([]);
                    }}
                  >
                    Nouvelle main
                  </Button>
                  <Button asChild>
                    <Link to="/classement">
                      <Users className="size-4" /> Voir le classement
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Coins className="size-3.5 text-[var(--gold)]" />
            Les WikiCrédits gagnés en duel servent à ouvrir d'autres paquets.
          </div>
        </div>
      )}
    </div>
  );
}
