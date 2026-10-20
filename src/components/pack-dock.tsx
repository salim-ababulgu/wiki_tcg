import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Package, PackageOpen, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FREE_INTERVAL_MS, PACK_RESERVE_MAX, formatCountdown, useGame, useNow } from "@/lib/game-store";
import { cn } from "@/lib/utils";

/**
 * Mini-deck flottant : la réserve de paquets visible depuis n'importe quelle
 * page du jeu. Un clic sur un emplacement plein ouvre l'écran des paquets après
 * un bref flou sur la page, pour marquer le passage.
 */
export function PackDock() {
  const { signedIn, packsReady, nextPackAt, pro } = useGame();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const now = useNow(true);

  const [expanded, setExpanded] = React.useState(true);
  const [flashing, setFlashing] = React.useState(false);

  // Inutile sur l'écran des paquets, et réservé aux joueurs connectés.
  if (!signedIn || pathname === "/paquets") return null;

  const full = packsReady >= PACK_RESERVE_MAX;
  const remaining = full ? 0 : Math.max(0, nextPackAt - now);
  const interval = pro ? 3 * 60 * 1000 : FREE_INTERVAL_MS;

  const openPacks = () => {
    setFlashing(true);
    window.setTimeout(() => {
      setFlashing(false);
      navigate("/paquets");
    }, 420);
  };

  return (
    <>
      {/* Le faux flou de transition */}
      {flashing && (
        <div className="fixed inset-0 z-50 bg-background/40 backdrop-blur-md transition-opacity duration-300" />
      )}

      <div className="fixed right-3 bottom-3 z-40 sm:right-5 sm:bottom-5">
        <div
          className={cn(
            "border bg-card/95 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.85)] backdrop-blur-md transition-all duration-300",
            expanded ? "w-[240px] rounded-xl p-3" : "rounded-full p-2",
          )}
        >
          {expanded ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Package className="size-3.5 text-[var(--gold)]" />
                  <span className="text-[11px] font-semibold tracking-wide uppercase">
                    Ma réserve
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  aria-label="Réduire la réserve"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>

              {/* Dix emplacements cliquables */}
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: PACK_RESERVE_MAX }).map((_, index) => {
                  const filled = index < packsReady;
                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={!filled}
                      onClick={openPacks}
                      aria-label={
                        filled ? `Ouvrir un paquet (${index + 1} disponible)` : "Emplacement vide"
                      }
                      className={cn(
                        "grid h-8 place-items-center rounded-md border transition-all",
                        filled
                          ? "border-[oklch(0.82_0.15_85/0.55)] bg-[oklch(0.82_0.15_85/0.2)] text-[var(--gold)] hover:scale-105 hover:bg-[oklch(0.82_0.15_85/0.35)]"
                          : "text-muted-foreground/30 border-dashed",
                      )}
                    >
                      <Package className="size-3" />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground tabular-nums">
                  {packsReady} / {PACK_RESERVE_MAX}
                </span>
                <span className="text-muted-foreground flex items-center gap-1 tabular-nums">
                  <Timer className="size-2.5" />
                  {full ? "pleine" : formatCountdown(remaining)}
                </span>
              </div>

              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="gold"
                  className="h-7 flex-1 text-[11px]"
                  onClick={openPacks}
                  disabled={packsReady <= 0}
                >
                  <PackageOpen className="size-3" /> Ouvrir
                </Button>
                <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-[11px]">
                  <Link to="/paquets">Détails</Link>
                </Button>
              </div>

              {!full && (
                <div className="h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-1000"
                    style={{ width: `${Math.min(100, ((interval - remaining) / interval) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex items-center gap-2 px-1"
              aria-label="Afficher la réserve de paquets"
            >
              <span className="relative grid size-9 place-items-center rounded-full bg-[oklch(0.82_0.15_85/0.2)] text-[var(--gold)]">
                <Package className="size-4" />
                <Badge className="absolute -top-1 -right-1 size-4 justify-center rounded-full p-0 text-[9px]">
                  {packsReady}
                </Badge>
              </span>
              {!full && (
                <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                  {formatCountdown(remaining)}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
