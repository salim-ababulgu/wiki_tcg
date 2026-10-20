import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  CalendarDays,
  Coins,
  ExternalLink,
  Flag,
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CARDS, CARD_BY_SLUG } from "@/data/cards";
import { useGame } from "@/lib/game-store";
import { useWikiSummary } from "@/lib/use-wikipedia";
import { RARITY_MAP, type Card as CardType } from "@/lib/types";
import { cn, formatNumber, unit } from "@/lib/utils";
import { NotFoundPage } from "@/pages/not-found";

/** Contenu de la fiche, partagé par la page et par la fenêtre modale. */
function CardDetailBody({ card }: { card: CardType }) {
  const { profile, owns, buyCard, wishlist, toggleWishlist, collection, signedIn } = useGame();
  const wiki = useWikiSummary(card.sourceTitle);

  const info = RARITY_MAP[card.rarity];
  const owned = owns(card.id);
  const copies = collection.filter((ownedCard) => ownedCard.cardId === card.id);
  const mine = copies[0];
  const wanted = wishlist.includes(card.id);
  const canAfford = profile.credits >= card.value;

  const related = CARDS.filter(
    (item) => item.id !== card.id && (item.set === card.set || item.category === card.category),
  ).slice(0, 4);

  // Historique de valeur simulé mais stable par carte.
  const history = Array.from({ length: 12 }, (_, index) => {
    const drift = (unit(card.slug, `h${index}`) - 0.45) * 0.22;
    return card.value * (1 + drift * (index / 11) + index * 0.006);
  });
  const max = Math.max(...history);
  const min = Math.min(...history);
  const trend = ((history[history.length - 1] - history[0]) / history[0]) * 100;

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
      {/* Colonne carte */}
      <div className="space-y-3">
        <div
          className="card-shine overflow-hidden rounded-2xl border bg-card shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9)]"
          style={{ borderColor: `color-mix(in oklch, ${info.accent} 40%, var(--border))` }}
        >
          <WikiPhoto card={card} className="h-56 sm:h-64" glyphClassName="size-24" lazy={false} />
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

        {/* Lien vers l'article source */}
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

        {/* Actions */}
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
                    : "WikiCrédits insuffisants — ouvrez un paquet ou gagnez un duel",
                );
              }}
              disabled={owned && copies.length > 0}
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

        {signedIn && mine && (
          <p className="text-muted-foreground text-center text-[11px]">
            {copies.length} exemplaire{copies.length > 1 ? "s" : ""} · obtenue le{" "}
            {new Date(mine.obtainedAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
        {signedIn && !canAfford && !owned && (
          <p className="text-muted-foreground text-center text-xs">
            Il vous manque {formatNumber(card.value - profile.credits)} WikiCrédits.
          </p>
        )}
      </div>

      {/* Colonne détails */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Card className="bg-card/60 py-3">
            <CardContent className="space-y-0.5 px-3">
              <p className="text-muted-foreground text-[10px] tracking-wide uppercase">Valeur</p>
              <p className="font-display flex items-center gap-1 text-lg font-bold tabular-nums">
                <Coins className="size-3.5 text-[var(--gold)]" />
                {formatNumber(card.value)}
              </p>
              <p
                className={
                  trend >= 0
                    ? "flex items-center gap-0.5 text-[10px] text-emerald-400"
                    : "flex items-center gap-0.5 text-[10px] text-red-400"
                }
              >
                <TrendingUp className="size-2.5" />
                {trend >= 0 ? "+" : ""}
                {trend.toFixed(1)} %
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/60 py-3">
            <CardContent className="space-y-0.5 px-3">
              <p className="text-muted-foreground text-[10px] tracking-wide uppercase">Tirage</p>
              <p className="font-display text-lg font-bold tabular-nums">
                {(info.dropRate * 100).toFixed(1)} %
              </p>
              <p className="text-muted-foreground text-[10px]">par paquet</p>
            </CardContent>
          </Card>
          <Card className="bg-card/60 py-3">
            <CardContent className="space-y-0.5 px-3">
              <p className="text-muted-foreground text-[10px] tracking-wide uppercase">
                Exemplaires
              </p>
              <p className="font-display text-lg font-bold tabular-nums">{copies.length}</p>
              <p className="text-muted-foreground text-[10px]">
                {owned ? "à vous" : "aucun"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm">Attributs de duel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatBar label="Savoir" value={card.stats.savoir} accent={info.accent} />
            <StatBar label="Influence" value={card.stats.influence} accent={info.accent} />
            <StatBar label="Singularité" value={card.stats.singularite} accent={info.accent} />
          </CardContent>
        </Card>

        <Card className="bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm">À retenir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground text-sm leading-relaxed">{card.lore}</p>
            <ul className="space-y-1.5">
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
            <div className="flex flex-wrap gap-1.5 border-t pt-2">
              {card.tags.map((tag) => (
                <Badge key={tag} variant="muted" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Source Wikipédia */}
        <Card className="bg-card/60">
          <CardHeader className="flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="font-display text-sm">Source : Wikipédia</CardTitle>
            <Badge variant="outline" className="text-[10px]">
              CC BY-SA 4.0
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {wiki.loading ? (
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-5/6" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>
            ) : wiki.data ? (
              <>
                <p className="text-muted-foreground text-sm leading-relaxed">{wiki.data.extract}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2">
                  <span className="text-muted-foreground text-[10px]">
                    Texte de l'article : CC BY-SA 4.0 — crédits sur la page Wikipédia.
                  </span>
                  <a
                    href={wiki.data.pageUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-primary text-[11px] underline-offset-4 hover:underline"
                  >
                    Voir l'article sur Wikipédia →
                  </a>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  Le résumé n'a pas pu être chargé — connexion coupée ou service indisponible. La
                  fiche reste utilisable avec son contenu d'origine.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={wiki.retry}>
                    Réessayer
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <a
                      href={`https://fr.wikipedia.org/wiki/${encodeURIComponent(card.sourceTitle)}`}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <ExternalLink className="size-3.5" /> Ouvrir Wikipédia
                    </a>
                  </Button>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-7 px-2 text-[11px]"
              onClick={() => toast.info("Signalement enregistré (démo, sans suite).")}
            >
              <Flag className="size-3" /> Signaler l'image
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/60">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="font-display text-sm">Cours simulé</CardTitle>
            <Badge variant="outline" className="text-[10px]">
              30 jours
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex h-24 items-end gap-1">
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
            <Progress value={((card.value - min) / (max - min || 1)) * 100} className="mt-3 h-1" />
          </CardContent>
        </Card>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Dans la même veine</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to={`/explorer?categorie=${card.category}`}>Tout voir</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.map((item) => (
              <CardTile key={item.id} card={item} compact owned={owns(item.id)} />
            ))}
          </div>
        </div>

        <div className="text-muted-foreground flex items-center gap-2 rounded-xl border bg-card/50 p-3 text-[11px]">
          <Package className="size-4 shrink-0" />
          Fiche de l'édition « {card.set} ». Les cartes sont virtuelles et n'ont aucune valeur
          monétaire réelle.
        </div>
      </div>
    </div>
  );
}

/** Version pleine page : utile pour un lien direct, un partage ou un moteur de recherche. */
export function CardDetailPage() {
  const { slug = "" } = useParams();
  const card = CARD_BY_SLUG.get(slug);
  if (!card) return <NotFoundPage />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/explorer">
            <ArrowLeft className="size-4" /> Catalogue
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-muted-foreground text-xs">
          {card.set} · Fiche {card.number}
        </span>
      </div>
      <CardDetailBody card={card} />
    </div>
  );
}

/**
 * Version modale : ouverte par-dessus la page en cours quand on clique une carte.
 * L'adresse change quand même, pour pouvoir partager ou recharger la fiche.
 */
export function CardDetailModal() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const card = CARD_BY_SLUG.get(slug);

  const close = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/explorer");
  };

  if (!card) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent
        className={cn(
          // La largeur par défaut de shadcn (sm:max-w-lg) doit être explicitement
          // remplacée, sinon elle gagne et le contenu déborde.
          "w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0",
          "sm:max-w-[1080px]",
          "max-h-[92svh]",
        )}
      >
        <DialogTitle className="sr-only">
          {card.name} — fiche {card.number}
        </DialogTitle>
        <div className="bg-background max-h-[92svh] overflow-y-auto overscroll-contain p-4 pt-10 sm:p-6 sm:pt-8">
          <div className="mb-3 flex flex-wrap items-center gap-2 pr-10">
            <Badge variant="outline" className="text-[10px]">
              {card.set}
            </Badge>
            <span className="text-muted-foreground text-[11px]">
              Fiche {card.number} · {card.era}
            </span>
          </div>
          <CardDetailBody card={card} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
