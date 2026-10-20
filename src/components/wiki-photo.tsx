import * as React from "react";
import { CardArt } from "@/components/card-art";
import { useInView, useWikiSummary } from "@/lib/use-wikipedia";
import type { Card } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Illustration d'une carte : la photo de l'article Wikipédia quand elle existe,
 * sinon l'illustration générée.
 *
 * Trois précautions :
 * 1. chargement différé tant que la carte n'est pas à l'écran ;
 * 2. on utilise l'URL de vignette **telle que fournie** par l'API — les tailles
 *    réécrites à la main sont refusées par Wikimedia (erreur 400) ;
 * 3. si l'image échoue, on retombe sur l'illustration générée : jamais de
 *    carré cassé dans l'interface.
 */
export function WikiPhoto({
  card,
  className,
  glyphClassName,
  lazy = true,
  blurred = false,
  revealable = true,
}: {
  card: Card;
  className?: string;
  glyphClassName?: string;
  lazy?: boolean;
  /** Image masquée pour les profils protégés (mineur, mode streamer). */
  blurred?: boolean;
  /** false = le masque ne peut pas être levé (compte mineur). */
  revealable?: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const { data } = useWikiSummary(card.sourceTitle, lazy ? inView : true);
  const [broken, setBroken] = React.useState(false);
  const [revealed, setRevealed] = React.useState(false);
  const hide = blurred && !revealed;

  const showPhoto = Boolean(data?.image) && !broken;

  return (
    <div ref={ref} className={cn("relative overflow-hidden bg-muted", className)}>
      {showPhoto ? (
        <img
          src={data!.image!}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
          className={cn("size-full object-cover", hide && "blur-2xl scale-110")}
        />
      ) : (
        <CardArt card={card} className="size-full" glyphClassName={glyphClassName} />
      )}
      {hide && revealable && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setRevealed(true);
          }}
          className="absolute inset-0 grid place-items-center bg-background/40 backdrop-blur-xl"
          title="Image masquée — cliquez pour l'afficher"
        >
          <span className="rounded-full border bg-background/70 px-2 py-1 text-[10px] font-medium">
            Image masquée
          </span>
        </button>
      )}
      {hide && !revealable && (
        <div className="absolute inset-0 grid place-items-center bg-background/40 backdrop-blur-xl">
          <span className="rounded-full border bg-background/70 px-2 py-1 text-[10px] font-medium">
            Image masquée
          </span>
        </div>
      )}
    </div>
  );
}
