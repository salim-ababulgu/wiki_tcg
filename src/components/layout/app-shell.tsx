import * as React from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Compass,
  Flame,
  Home,
  LayoutGrid,
  Menu,
  Moon,
  Package,
  ScrollText,
  Search,
  Sun,
  Swords,
  Trophy,
  UserRound,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGame } from "@/lib/game-store";
import { cn, formatNumber } from "@/lib/utils";

const NAV = [
  {
    label: "Découvrir",
    items: [
      { to: "/", label: "Accueil", icon: Home, end: true },
      { to: "/explorer", label: "Explorer", icon: Compass },
    ],
  },
  {
    label: "Jouer",
    items: [
      { to: "/paquets", label: "Paquets", icon: Package },
      { to: "/duels", label: "Duels", icon: Swords },
      { to: "/collection", label: "Ma collection", icon: LayoutGrid },
    ],
  },
  {
    label: "Communauté",
    items: [
      { to: "/classement", label: "Classement", icon: Trophy },
      { to: "/profil", label: "Profil", icon: UserRound },
      { to: "/regles", label: "Règles", icon: ScrollText },
    ],
  },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <img
        src="/logo_wikitcg.png"
        alt=""
        width={32}
        height={32}
        className="size-8 rounded-lg object-cover shadow-[0_4px_14px_-4px_rgba(0,0,0,0.6)]"
      />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[15px] font-bold tracking-tight">WikiTCG</span>
          <span className="text-muted-foreground text-[10px] tracking-[0.14em] uppercase">
            savoirs de collection
          </span>
        </span>
      )}
    </Link>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-5">
      {NAV.map((group) => (
        <div key={group.label} className="space-y-1">
          <p className="text-muted-foreground/70 px-2 text-[10px] font-semibold tracking-[0.16em] uppercase">
            {group.label}
          </p>
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

function SearchBox() {
  const navigate = useNavigate();
  const [value, setValue] = React.useState("");

  return (
    <form
      className="relative hidden w-full max-w-sm md:block"
      onSubmit={(event) => {
        event.preventDefault();
        navigate(value.trim() ? `/explorer?q=${encodeURIComponent(value.trim())}` : "/explorer");
      }}
    >
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Rechercher une carte, une époque…"
        className="pl-9"
        aria-label="Rechercher dans le catalogue"
      />
    </form>
  );
}

export function AppShell() {
  const { profile, theme, toggleTheme, collection } = useGame();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-svh overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="bg-grid absolute inset-0 opacity-[0.35]" />
        <div className="absolute -top-40 left-1/3 size-[520px] rounded-full bg-[radial-gradient(circle,oklch(0.55_0.15_255/0.18),transparent_65%)] blur-2xl" />
        <div className="absolute right-0 bottom-0 size-[420px] rounded-full bg-[radial-gradient(circle,oklch(0.82_0.15_85/0.10),transparent_65%)] blur-2xl" />
      </div>

      {/* Barre latérale desktop */}
      <aside className="bg-sidebar/80 fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center border-b px-4">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavItems />
        </div>
        <div className="space-y-3 border-t p-3">
          <Link
            to="/profil"
            className="hover:bg-accent/60 flex items-center gap-2.5 rounded-lg p-2 transition-colors"
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                {profile.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm leading-tight font-medium">{profile.displayName}</p>
              <p className="text-muted-foreground text-[11px]">Niveau {profile.level}</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {collection.length}
            </Badge>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            {theme === "dark" ? "Thème sombre" : "Thème clair"}
          </Button>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        {/* Barre supérieure */}
        <header className="bg-background/70 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-xl sm:px-6">
          <div className="lg:hidden">
            <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Ouvrir le menu">
                  <Menu className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="top-0 left-0 h-svh max-w-[280px] translate-x-0 translate-y-0 rounded-none border-r sm:max-w-[280px]">
                <DialogTitle className="sr-only">Navigation</DialogTitle>
                <div className="pt-2">
                  <Brand />
                </div>
                <div className="mt-4">
                  <NavItems onNavigate={() => setMobileOpen(false)} />
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="lg:hidden">
            <Brand compact />
          </div>

          <SearchBox />

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border px-3 py-1.5">
              <Wallet className="size-3.5 text-[var(--gold)]" />
              <span className="text-sm font-semibold tabular-nums">
                {formatNumber(profile.credits)}
              </span>
              <span className="text-muted-foreground hidden text-[11px] sm:inline">crédits</span>
            </div>
            <div className="hidden items-center gap-1.5 rounded-full border px-3 py-1.5 sm:flex">
              <Flame className="size-3.5 text-orange-400" />
              <span className="text-sm font-semibold tabular-nums">7</span>
              <span className="text-muted-foreground text-[11px]">jours</span>
            </div>
            <Button variant="outline" size="icon" className="lg:hidden" onClick={toggleTheme}>
              {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </Button>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/paquets">
                <Package className="size-4" /> Ouvrir un paquet
              </Link>
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>

        <footer className="border-t px-4 py-6 sm:px-6">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              WikiTCG — projet de démonstration. Les fiches sont rédigées pour ce prototype et ne
              reprennent aucun contenu tiers.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/regles" className="hover:text-foreground">
                Règles
              </Link>
              <Link to="/explorer" className="hover:text-foreground">
                Catalogue
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
