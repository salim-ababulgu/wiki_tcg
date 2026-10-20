import * as React from "react";
import { forgetSummary, peekSummary, fetchSummary, type WikiSummary } from "@/lib/wikipedia";

type State = {
  data: WikiSummary | null;
  loading: boolean;
  /** true quand un essai s'est terminé sans résultat (réseau ou article absent). */
  failed: boolean;
};

/**
 * Résumé Wikipédia d'un article, avec cache.
 * `enabled` permet de ne déclencher l'appel que quand la carte devient visible.
 */
export function useWikiSummary(title: string | undefined, enabled = true) {
  const [state, setState] = React.useState<State>(() => {
    if (!title) return { data: null, loading: false, failed: false };
    const cached = peekSummary(title);
    return cached !== undefined
      ? { data: cached, loading: false, failed: cached === null }
      : { data: null, loading: enabled, failed: false };
  });

  React.useEffect(() => {
    if (!title || !enabled) return;

    const cached = peekSummary(title);
    if (cached !== undefined) {
      setState({ data: cached, loading: false, failed: cached === null });
      return;
    }

    let alive = true;
    setState({ data: null, loading: true, failed: false });
    fetchSummary(title).then((data) => {
      if (alive) {
        // On signale l'échec pour pouvoir proposer un nouvel essai : le cache
        // négatif (10 minutes) ne doit pas laisser l'écran vide sans recours.
        setState({ data, loading: false, failed: data === null });
      }
    });

    return () => {
      alive = false;
    };
  }, [title, enabled]);

  /** Force un nouvel appel, en ignorant le cache (y compris un échec mémorisé). */
  const retry = React.useCallback(() => {
    if (!title) return;
    forgetSummary(title);
    setState({ data: null, loading: true, failed: false });
    fetchSummary(title).then((data) => {
      setState({ data, loading: false, failed: data === null });
    });
  }, [title]);

  return { ...state, retry };
}

/** Détecte l'entrée d'un élément dans la fenêtre, pour ne charger qu'au besoin. */
export function useInView<T extends HTMLElement>(rootMargin = "200px") {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return { ref, inView };
}
