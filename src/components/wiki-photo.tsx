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
}: {
  card: Card;
  className?: string;
  glyphClassName?: string;
  lazy?: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const { data } = useWikiSummary(card.sourceTitle, lazy ? inView : true);
  const [broken, setBroken] = React.useState(false);

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
          className="size-full object-cover"
        />
      ) : (
        <CardArt card={card} className="size-full" glyphClassName={glyphClassName} />
      )}
    </div>
  );
}
