import * as React from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { GameProvider } from "@/lib/game-store";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HomePage } from "@/pages/home";
import { ExplorePage } from "@/pages/explore";
import { CardDetailPage } from "@/pages/card-detail";
import { CollectionPage } from "@/pages/collection";
import { PacksPage } from "@/pages/packs";
import { DuelPage } from "@/pages/duel";
import { LeaderboardPage } from "@/pages/leaderboard";
import { ProfilePage } from "@/pages/profile";
import { RulesPage } from "@/pages/rules";
import { AuthPage } from "@/pages/auth";
import { NotFoundPage } from "@/pages/not-found";

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <GameProvider>
      <TooltipProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/connexion" element={<AuthPage mode="login" />} />
            <Route path="/inscription" element={<AuthPage mode="signup" />} />
            <Route element={<AppShell />}>
              <Route index element={<HomePage />} />
              <Route path="/explorer" element={<ExplorePage />} />
              <Route path="/carte/:slug" element={<CardDetailPage />} />
              <Route path="/collection" element={<CollectionPage />} />
              <Route path="/paquets" element={<PacksPage />} />
              <Route path="/duels" element={<DuelPage />} />
              <Route path="/classement" element={<LeaderboardPage />} />
              <Route path="/profil" element={<ProfilePage />} />
              <Route path="/regles" element={<RulesPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </GameProvider>
  );
}
