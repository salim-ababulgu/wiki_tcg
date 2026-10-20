import * as React from "react";
import { peekSummary, fetchSummary, type WikiSummary } from "@/lib/wikipedia";

type State = {
  data: WikiSummary | null;
  loading: boolean;
};

/**
 * Résumé Wikipédia d'un article, avec cache.
 * `enabled` permet de ne déclencher l'appel que quand la carte devient visible.
 */
export function useWikiSummary(title: string | undefined, enabled = true): State {
  const [state, setState] = React.useState<State>(() => {
    if (!title) return { data: null, loading: false };
    const cached = peekSummary(title);
    return cached !== undefined
      ? { data: cached, loading: false }
      : { data: null, loading: enabled };
  });

  React.useEffect(() => {
    if (!title || !enabled) return;

    const cached = peekSummary(title);
    if (cached !== undefined) {
      setState({ data: cached, loading: false });
      return;
    }

    let alive = true;
    setState((prev) => ({ ...prev, loading: true }));
    fetchSummary(title).then((data) => {
      if (alive) setState({ data, loading: false });
    });

    return () => {
      alive = false;
    };
  }, [title, enabled]);

  return state;
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
