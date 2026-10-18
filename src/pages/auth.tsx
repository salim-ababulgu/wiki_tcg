import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RarityBadge } from "@/components/rarity-badge";
import { CardArt } from "@/components/card-art";
import { CARDS } from "@/data/cards";
import { useGame } from "@/lib/game-store";
import { RARITY_MAP } from "@/lib/types";

function Showcase() {
  const cards = CARDS.filter((card) =>
    ["grande-vague", "mille-et-une-nuits", "panda-geant"].includes(card.slug),
  );

  return (
    <div className="hidden flex-col justify-between gap-8 rounded-2xl border bg-gradient-to-br from-[oklch(0.28_0.05_258)] to-[oklch(0.19_0.03_258)] p-8 lg:flex">
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-[oklch(0.82_0.15_85)] to-[oklch(0.66_0.15_45)]">
            <BookOpen className="size-4.5 text-[oklch(0.2_0.03_70)]" />
          </span>
          <span className="font-display text-lg font-bold">WikiTCG</span>
        </div>
        <p className="text-muted-foreground text-sm">
          Collectionnez les savoirs du monde, une fiche à la fois.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={index === 0 ? "col-span-2 overflow-hidden rounded-lg border bg-card" : "overflow-hidden rounded-lg border bg-card"}
            style={{
              borderColor: `color-mix(in oklch, ${RARITY_MAP[card.rarity].accent} 40%, var(--border))`,
            }}
          >
            <CardArt card={card} className={index === 0 ? "h-24" : "h-20"} glyphClassName="size-7" />
            <div className="space-y-0.5 p-2">
              <RarityBadge rarity={card.rarity} />
              <p className="truncate text-[11px] font-medium">{card.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {[`Catalogue de ${CARDS.length} fiches`, "Paquets et duels", "Collection sauvegardée localement"].map(
          (item) => (
            <p key={item} className="text-muted-foreground flex items-center gap-2 text-xs">
              <Check className="size-3.5 text-emerald-400" /> {item}
            </p>
          ),
        )}
      </div>
    </div>
  );
}

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, profile, collection } = useGame();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pseudo, setPseudo] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? "/collection";

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.includes("@")) {
      setError("Entrez une adresse courriel valide.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setError(null);
    login(email, mode === "signup" ? pseudo || "Collectionneur" : "Salim");
    toast.success(mode === "signup" ? "Compte créé — bonne collection !" : "Bon retour parmi nous.");
    navigate(from, { replace: true });
  };

  return (
    <div className="mx-auto grid min-h-svh max-w-6xl items-center gap-8 px-4 py-10 lg:grid-cols-2">
      <Showcase />

      <div className="w-full max-w-md justify-self-center space-y-6">
        <div className="space-y-1.5 text-center lg:text-left">
          <Badge variant="outline" className="mb-2 gap-1">
            <Sparkles className="size-3" /> Démonstration locale
          </Badge>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {mode === "login" ? "Connexion" : "Créer un compte"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === "login"
              ? "Reprenez votre collection là où vous l'avez laissée."
              : "Trois champs suffisent pour commencer votre encyclopédie."}
          </p>
        </div>

        <Card className="bg-card/60">
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="pseudo">Pseudonyme</Label>
                  <Input
                    id="pseudo"
                    value={pseudo}
                    onChange={(event) => setPseudo(event.target.value)}
                    placeholder="Collectionneur"
                    autoComplete="nickname"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Adresse courriel</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="vous@exemple.fr"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>

              {error && <p className="text-destructive text-xs">{error}</p>}

              <Button type="submit" className="w-full">
                {mode === "login" ? "Se connecter" : "Créer mon compte"}
                <ArrowRight className="size-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  login("demo@wikitcg.app", "Salim");
                  toast.success("Session de démonstration ouverte.");
                  navigate("/collection", { replace: true });
                }}
              >
                Entrer en mode démonstration
              </Button>
            </form>

            <Separator className="my-4" />

            <p className="text-muted-foreground text-center text-xs">
              {mode === "login" ? (
                <>
                  Pas encore de compte ?{" "}
                  <Link to="/inscription" className="text-primary underline-offset-4 hover:underline">
                    Créer un compte
                  </Link>
                </>
              ) : (
                <>
                  Déjà inscrit ?{" "}
                  <Link to="/connexion" className="text-primary underline-offset-4 hover:underline">
                    Se connecter
                  </Link>
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <p className="text-muted-foreground text-center text-[11px]">
          {profile.displayName} · {collection.length} cartes déjà dans la collection locale
        </p>
      </div>
    </div>
  );
}
