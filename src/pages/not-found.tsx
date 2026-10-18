import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center gap-5 text-center">
      <p className="font-display text-7xl font-bold tracking-tight opacity-20">404</p>
      <div className="space-y-2">
        <h1 className="font-display text-xl font-semibold">Cette fiche n'existe pas</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          La page demandée a peut-être été renommée, ou la carte n'appartient pas encore au
          catalogue.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild>
          <Link to="/explorer">
            <Compass className="size-4" /> Explorer
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">
            <Home className="size-4" /> Accueil
          </Link>
        </Button>
      </div>
    </div>
  );
}
