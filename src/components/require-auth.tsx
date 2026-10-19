import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useGame } from "@/lib/game-store";

/**
 * La « porte » : un visiteur non connecté qui demande une page privée est
 * renvoyé vers la connexion, avec l'adresse demandée en mémoire pour l'y
 * ramener ensuite.
 */
export function RequireAuth() {
  const { signedIn, ready } = useGame();
  const location = useLocation();

  // On attend de savoir si une session existe déjà dans le navigateur,
  // sinon on redirigerait un utilisateur connecté au premier affichage.
  if (!ready) return null;

  if (!signedIn) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}
