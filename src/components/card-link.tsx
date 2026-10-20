import { Link, useLocation, type LinkProps } from "react-router-dom";

type CardLinkProps = Omit<LinkProps, "to" | "state"> & { slug: string };

/**
 * Lien vers une fiche carte qui ouvre la **fenêtre modale** par-dessus la page
 * courante, au lieu de la remplacer.
 *
 * C'est ce qui évite de perdre l'état de la page d'origine — une révélation de
 * paquet, par exemple. Si on est déjà dans une fiche, on conserve la page de
 * fond d'origine au lieu d'empiler les fenêtres.
 */
export function CardLink({ slug, children, ...rest }: CardLinkProps) {
  const location = useLocation();
  const existing = (location.state as { backgroundLocation?: unknown } | null)?.backgroundLocation;
  const backgroundLocation = existing ?? location;

  return (
    <Link to={`/carte/${slug}`} state={{ backgroundLocation }} {...rest}>
      {children}
    </Link>
  );
}
