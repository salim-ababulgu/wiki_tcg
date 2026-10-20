import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  CalendarDays,
  Coins,
  ExternalLink,
  Globe2,
  Hash,
  Package,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { WikiPhoto } from "@/components/wiki-photo";
import { CardTile } from "@/components/card-tile";
import { RarityBadge } from "@/components/rarity-badge";
import { StatBar } from "@/components/stat-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { CARDS, CARD_BY_SLUG } from "@/data/cards";
import { useGame } from "@/lib/game-store";
import { useWikiSummary } from "@/lib/use-wikipedia";
import { Skeleton } from "@/components/ui/skeleton";
import { RARITY_MAP } from "@/lib/types";
import { formatNumber, unit } from "@/lib/utils";
import { NotFoundPage } from "@/pages/not-found";

export function CardDetailPage() {
  const { slug = "" } = useParams();
  const card = CARD_BY_SLUG.get(slug);
  const { profile, owns, buyCard, wishlist, toggleWishlist, collection, signedIn } = useGame();
  // Appelé avant le retour anticipé : un hook ne peut pas être conditionnel.
  const wiki = useWikiSummary(card?.sourceTitle);

  if (!card) return <NotFoundPage />;

  const info = RARITY_MAP[card.rarity];
  const owned = owns(card.id);
  const copies = collection.filter((ownedCard) => ownedCard.cardId === card.id).length;
  const wanted = wishlist.includes(card.id);
  const related = CARDS.filter(
    (item) => item.id !== card.id && (item.set === card.set || item.category === card.category),
  ).slice(0, 4);

  const canAfford = profile.credits >= card.value;

  // Historique de valeur simulé mais stable par carte.
  const history = Array.from({ length: 12 }, (_, index) => {
    const drift = (unit(card.slug, `h${index}`) - 0.45) * 0.22;
    return card.value * (1 + drift * (index / 11) + index * 0.006);
  });
  const max = Math.max(...history);
  const min = Math.min(...history);
  const trend = ((history[history.length - 1] - history[0]) / history[0]) * 100;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/explorer">
            <ArrowLeft className="size-4" /> Catalogue
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-muted-foreground text-xs">
          {card.set} · Fiche {card.number}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[340px_1fr] xl:grid-cols-[380px_1fr]">
        {/* Carte */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div
            className="card-shine overflow-hidden rounded-2xl border bg-card shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9)]"
            style={{ borderColor: `color-mix(in oklch, ${info.accent} 40%, var(--border))` }}
          >
            <WikiPhoto card={card} className="h-64" glyphClassName="size-24" lazy={false} />
            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <RarityBadge rarity={card.rarity} withLabel />
                <span className="text-muted-foreground font-mono text-[11px]">{card.number}</span>
              </div>
              <div>
                <h1 className="font-display text-xl leading-tight font-bold text-balance">
                  {card.name}
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">{card.blurb}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t pt-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <Globe2 className="text-muted-foreground size-3.5" />
                  <span className="truncate">{card.origin}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="text-muted-foreground size-3.5" />
                  <span className="truncate">{card.era}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Hash className="text-muted-foreground size-3.5" />
                  <span className="truncate">{card.category}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="text-muted-foreground size-3.5" />
                  <span className="truncate">{info.label}</span>
                </div>
              </div>
            </div>
          </div>

          {wiki.data?.pageUrl && (
            <Button asChild variant="outline" className="w-full justify-between">
              <a href={wiki.data.pageUrl} target="_blank" rel="noreferrer noopener">
                <span className="flex items-center gap-2">
                  <BookOpen className="size-4" /> Fiche Wikipédia
                </span>
                <ExternalLink className="size-3.5 opacity-60" />
              </a>
            </Button>
          )}

          {signedIn ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="default"
                onClick={() => {
                  if (owned) {
                    toast.info("Vous possédez déjà cette fiche.");
                    return;
                  }
                  const ok = buyCard(card);
                  toast[ok ? "success" : "error"](
                    ok
                      ? `${card.name} ajoutée à votre collection`
                      : "Crédits insuffisants — ouvrez un paquet ou gagnez un duel",
                  );
                }}
                disabled={owned && copies > 0}
              >
                <Coins className="size-4" />
                {owned ? "Déjà possédée" : `Acheter · ${formatNumber(card.value)}`}
              </Button>
              <Button variant="outline" onClick={() => toggleWishlist(card.id)}>
                {wanted ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                {wanted ? "Suivie" : "Suivre"}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/inscription">
                  <Coins className="size-4" /> Créer un compte pour la collectionner
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/connexion">J'ai déjà un compte</Link>
              </Button>
            </div>
          )}
          {signedIn && !canAfford && !owned && (
            <p className="text-muted-foreground text-center text-xs">
              Il vous manque {formatNumber(card.value - profile.credits)} WikiCrédits.
            </p>
          )}
        </div>

        {/* Détails */}
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="bg-card/60 py-4">
              <CardContent className="space-y-1">
                <p className="text-muted-foreground text-[11px] tracking-wide uppercase">Valeur</p>
                <p className="font-display flex items-baseline gap-1.5 text-2xl font-bold">
                  <Coins className="size-4 text-[var(--gold)]" />
                  {formatNumber(card.value)}
                </p>
                <p
                  className={
                    trend >= 0
                      ? "flex items-center gap-1 text-[11px] text-emerald-400"
                      : "flex items-center gap-1 text-[11px] text-red-400"
                  }
                >
                  <TrendingUp className="size-3" />
                  {trend >= 0 ? "+" : ""}
                  {trend.toFixed(1)} % sur 30 jours
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/60 py-4">
              <CardContent className="space-y-1">
                <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
                  Taux de tirage
                </p>
                <p className="font-display text-2xl font-bold tabular-nums">
                  {(info.dropRate * 100).toFixed(1)} %
                </p>
                <p className="text-muted-foreground text-[11px]">par paquet standard</p>
              </CardContent>
            </Card>
            <Card className="bg-card/60 py-4">
              <CardContent className="space-y-1">
                <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
                  Exemplaires
                </p>
                <p className="font-display text-2xl font-bold tabular-nums">{copies}</p>
                <p className="text-muted-foreground text-[11px]">
                  {owned ? "dans votre collection" : "à collectionner"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Attributs de duel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatBar label="Savoir" value={card.stats.savoir} accent={info.accent} />
              <StatBar label="Influence" value={card.stats.influence} accent={info.accent} />
              <StatBar label="Singularité" value={card.stats.singularite} accent={info.accent} />
              <p className="text-muted-foreground border-t pt-3 text-xs leading-relaxed">
                Total {card.stats.savoir + card.stats.influence + card.stats.singularite} points.
                Une carte remporte un duel lorsqu'elle domine l'adversaire sur au moins deux
                attributs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">À retenir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm leading-relaxed">{card.lore}</p>
              <ul className="space-y-2">
                {card.facts.map((fact) => (
                  <li key={fact} className="flex gap-2 text-sm">
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: info.accent }}
                    />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
              <Separator />
              <div className="flex flex-wrap gap-1.5">
                {card.tags.map((tag) => (
                  <Badge key={tag} variant="muted" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2">
              <CardTitle className="font-display">Source : Wikipédia</CardTitle>
              <Badge variant="outline" className="text-[10px]">
                CC BY-SA
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {wiki.loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : wiki.data ? (
                <>
                  <p className="text-muted-foreground text-sm leading-relaxed">{wiki.data.extract}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2">
                    <span className="text-muted-foreground text-[11px]">
                      Texte et image : Wikipédia, licence CC BY-SA
                    </span>
                    <a
                      href={wiki.data.pageUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-primary text-[11px] underline-offset-4 hover:underline"
                    >
                      Lire l'article ↗
                    </a>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Résumé indisponible : article introuvable ou connexion coupée. La fiche reste
                  utilisable avec son contenu d'origine.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="font-display">Cours simulé</CardTitle>
              <Badge variant="outline" className="text-[10px]">
                30 derniers jours
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-end gap-1">
                {history.map((value, index) => (
                  <div key={index} className="group relative flex h-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-sm transition-all duration-500 group-hover:opacity-80"
                      style={{
                        height: `${((value - min) / (max - min || 1)) * 90 + 10}%`,
                        backgroundColor: `color-mix(in oklch, ${info.accent} ${50 + index * 4}%, transparent)`,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="text-muted-foreground mt-2 flex justify-between text-[10px]">
                <span>J-30</span>
                <span>J-15</span>
                <span>Aujourd'hui</span>
              </div>
              <Progress value={((card.value - min) / (max - min || 1)) * 100} className="mt-4 h-1" />
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Dans la même veine</h2>
              <Button asChild variant="ghost" size="sm">
                <Link to={`/explorer?categorie=${card.category}`}>Tout voir</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((item) => (
                <CardTile key={item.id} card={item} compact owned={owns(item.id)} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border bg-card/50 p-3 text-xs text-muted-foreground">
            <Package className="size-4 shrink-0" />
            Cette fiche appartient à l'édition « {card.set} ». Les cartes de collection sont
            virtuelles et n'ont pas de valeur monétaire réelle.
          </div>
        </div>
      </div>
    </div>
  );
}
