import { Link, NavLink, Outlet } from "react-router-dom";
import { ArrowRight, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/explorer", label: "Catalogue" },
  { to: "/regles", label: "Règles" },
];

/**
 * Coquille des pages publiques : pas de barre latérale, pas de solde de crédits,
 * seulement de quoi comprendre le produit et créer un compte.
 */
export function PublicShell() {
  return (
    <div className="min-h-svh overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="bg-grid absolute inset-0 opacity-30" />
        <div className="absolute -top-40 left-1/3 size-[560px] rounded-full bg-[radial-gradient(circle,oklch(0.55_0.15_255/0.16),transparent_65%)] blur-2xl" />
        <div className="absolute right-0 bottom-0 size-[440px] rounded-full bg-[radial-gradient(circle,oklch(0.82_0.15_85/0.10),transparent_65%)] blur-2xl" />
      </div>

      <header className="bg-background/70 sticky top-0 z-30 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2.5">
            <img
              src="/logo_wikitcg.png"
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-lg object-cover shadow-[0_4px_14px_-4px_rgba(0,0,0,0.6)]"
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[15px] font-bold tracking-tight">WikiTCG</span>
              <span className="text-muted-foreground text-[10px] tracking-[0.14em] uppercase">
                savoirs de collection
              </span>
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 sm:flex">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/connexion">Se connecter</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/inscription">
                Créer un compte <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo_wikitcg.png" alt="" width={24} height={24} className="size-6 rounded" />
            <div>
              <p className="text-sm font-medium">WikiTCG</p>
              <p className="text-muted-foreground text-[11px]">
                Prototype — aucune donnée n'est envoyée à un serveur.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Badge variant="outline" className="gap-1 text-[10px]">
              <ScrollText className="size-3" /> Contenu original
            </Badge>
            <Link to="/regles" className="text-muted-foreground hover:text-foreground">
              Règles
            </Link>
            <Link to="/explorer" className="text-muted-foreground hover:text-foreground">
              Catalogue
            </Link>
            <Link to="/connexion" className="text-muted-foreground hover:text-foreground">
              Connexion
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
