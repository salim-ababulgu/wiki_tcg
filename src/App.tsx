import * as React from "react";
import { BrowserRouter, Route, Routes, useLocation, type Location } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { PublicShell } from "@/components/layout/public-shell";
import { RequireAuth } from "@/components/require-auth";
import { useGame } from "@/lib/game-store";
import { GameProvider } from "@/lib/game-store";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HomePage } from "@/pages/home";
import { ExplorePage } from "@/pages/explore";
import { CardDetailModal, CardDetailPage } from "@/pages/card-detail";
import { CollectionPage } from "@/pages/collection";
import { PacksPage } from "@/pages/packs";
import { DuelPage } from "@/pages/duel";
import { LeaderboardPage } from "@/pages/leaderboard";
import { ProfilePage } from "@/pages/profile";
import { RulesPage } from "@/pages/rules";
import { AuthPage } from "@/pages/auth";
import { NotFoundPage } from "@/pages/not-found";

type BackgroundState = { backgroundLocation?: Location } | null;

function ScrollToTop({ enabled }: { enabled: boolean }) {
  const { pathname } = useLocation();
  React.useEffect(() => {
    if (!enabled) return;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, enabled]);
  return null;
}

/** Le catalogue s'affiche dans la barre latérale pour un joueur, en public sinon. */
function AdaptiveShell() {
  const { signedIn } = useGame();
  return signedIn ? <AppShell /> : <PublicShell />;
}

function AppRoutes() {
  const location = useLocation();
  const background = (location.state as BackgroundState)?.backgroundLocation;

  return (
    <>
      {/* Quand une fiche est ouverte en fenêtre, la page d'origine reste affichée dessous. */}
      <ScrollToTop enabled={!background} />
      <Routes location={background ?? location}>
        {/* Public : on peut regarder sans compte. */}
        <Route element={<PublicShell />}>
          <Route index element={<HomePage />} />
          <Route path="/carte/:slug" element={<CardDetailPage />} />
          <Route path="/regles" element={<RulesPage />} />
        </Route>

        {/* Le catalogue suit le statut : barre latérale si connecté. */}
        <Route element={<AdaptiveShell />}>
          <Route path="/explorer" element={<ExplorePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/connexion" element={<AuthPage mode="login" />} />
        <Route path="/inscription" element={<AuthPage mode="signup" />} />

        {/* Privé : accessible une fois connecté. */}
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/paquets" element={<PacksPage />} />
            <Route path="/duels" element={<DuelPage />} />
            <Route path="/classement" element={<LeaderboardPage />} />
            <Route path="/profil" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>

      {background && (
        <Routes>
          <Route path="/carte/:slug" element={<CardDetailModal />} />
        </Routes>
      )}
    </>
  );
}

export function App() {
  return (
    <GameProvider>
      <TooltipProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </GameProvider>
  );
}
