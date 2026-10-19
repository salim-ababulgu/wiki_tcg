import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Award,
  BookOpen,
  CalendarDays,
  Coins,
  Crown,
  Flame,
  LogOut,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { RarityBadge } from "@/components/rarity-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CARD_BY_ID, CARDS } from "@/data/cards";
import { useGame } from "@/lib/game-store";
import { formatNumber } from "@/lib/utils";

const BADGES = [
  { name: "Première fiche", icon: BookOpen, unlocked: true, hint: "Obtenir une première carte" },
  { name: "Chasseur de paquets", icon: Sparkles, unlocked: true, hint: "Ouvrir 10 paquets" },
  { name: "Duelliste", icon: Swords, unlocked: true, hint: "Gagner 20 duels" },
  { name: "Série de 7 jours", icon: Flame, unlocked: true, hint: "Se connecter 7 jours d'affilée" },
  { name: "Érudit", icon: Award, unlocked: false, hint: "Posséder 25 fiches distinctes" },
  { name: "Légende vivante", icon: Shield, unlocked: false, hint: "Obtenir une carte légendaire" },
];

export function ProfilePage() {
  const { profile, collection, toggleTheme, theme, resetProgress, signOut, pro, setPro, packsReady } =
    useGame();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = React.useState(profile.displayName);

  const distinct = new Set(collection.map((owned) => owned.cardId)).size;
  const completion = Math.round((distinct / CARDS.length) * 100);
  const nextLevelXp = (profile.level + 1) * 400;
  const levelProgress = Math.min(100, Math.round((profile.xp / nextLevelXp) * 100));

  const rarest = collection
    .map((owned) => CARD_BY_ID.get(owned.cardId))
    .filter(Boolean)
    .sort((a, b) => (b?.value ?? 0) - (a?.value ?? 0))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Profil" title={profile.displayName} description={profile.bio} />

      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[oklch(0.4_0.1_255)] via-[oklch(0.35_0.08_280)] to-[oklch(0.5_0.12_85/0.4)]" />
        <CardContent className="-mt-10 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-end gap-3">
              <Avatar className="size-16 border-4 border-background">
                <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold">
                  {profile.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="pb-1">
                <p className="font-display text-lg font-bold">{profile.displayName}</p>
                <p className="text-muted-foreground text-xs">@{profile.handle}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pb-1">
              <Badge variant="secondary" className="gap-1">
                <Shield className="size-3" /> {profile.guild}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CalendarDays className="size-3" /> Membre depuis juillet
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Fiches" value={`${distinct}`} hint={`${completion} % du catalogue`} />
            <Stat label="Cartes" value={formatNumber(collection.length)} hint="exemplaires" />
            <Stat label="Duels" value={`${profile.duelWins}`} hint={`${profile.duelLosses} défaites`} />
            <Stat label="Crédits" value={formatNumber(profile.credits)} hint="solde actuel" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Niveau {profile.level} — {formatNumber(profile.xp)} XP
              </span>
              <span className="text-muted-foreground">
                {formatNumber(nextLevelXp - profile.xp)} XP avant le niveau {profile.level + 1}
              </span>
            </div>
            <Progress value={levelProgress} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="activite">
        <TabsList>
          <TabsTrigger value="activite">Activité</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="reglages">Réglages</TabsTrigger>
        </TabsList>

        <TabsContent value="activite" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-card/60">
              <CardHeader>
                <CardTitle className="font-display text-sm">Vos plus belles pièces</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {rarest.length === 0 && (
                  <p className="text-muted-foreground text-sm">Aucune carte pour l'instant.</p>
                )}
                {rarest.map((card) =>
                  card ? (
                    <Link
                      key={card.id}
                      to={`/carte/${card.slug}`}
                      className="hover:bg-accent/40 flex items-center gap-2 rounded-lg p-1.5"
                    >
                      <RarityBadge rarity={card.rarity} className="w-8 justify-center" />
                      <span className="flex-1 truncate text-sm">{card.name}</span>
                      <span className="text-muted-foreground flex items-center gap-1 text-xs tabular-nums">
                        <Coins className="size-3" /> {formatNumber(card.value)}
                      </span>
                    </Link>
                  ) : null,
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/60">
              <CardHeader>
                <CardTitle className="font-display text-sm">Journal récent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                {[
                  ["Ouverture d'un paquet Standard", "il y a 2 heures", "+5 cartes"],
                  ["Duel remporté contre nina.explore", "hier", "+420 WikiCrédits"],
                  ["Fiche rare ajoutée : Stonehenge", "il y a 2 jours", "+92 XP"],
                  ["Badge débloqué : Série de 7 jours", "il y a 3 jours", "+1 badge"],
                ].map(([title, time, reward]) => (
                  <div key={title} className="flex items-start gap-2">
                    <span className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full" />
                    <div className="flex-1">
                      <p className="leading-tight">{title}</p>
                      <p className="text-muted-foreground text-[11px]">{time}</p>
                    </div>
                    <span className="text-muted-foreground text-[11px] whitespace-nowrap">
                      {reward}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="badges">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BADGES.map((badge) => (
              <Card
                key={badge.name}
                className={
                  badge.unlocked ? "bg-card/60" : "bg-card/30 opacity-70"
                }
              >
                <CardContent className="flex items-center gap-3">
                  <span
                    className={
                      badge.unlocked
                        ? "grid size-10 place-items-center rounded-lg bg-[oklch(0.82_0.15_85/0.18)] text-[var(--gold)]"
                        : "bg-muted text-muted-foreground grid size-10 place-items-center rounded-lg"
                    }
                  >
                    <badge.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{badge.name}</p>
                    <p className="text-muted-foreground text-[11px]">{badge.hint}</p>
                  </div>
                  {badge.unlocked && (
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      obtenu
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reglages">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-card/60">
              <CardHeader>
                <CardTitle className="font-display text-sm">Compte de démonstration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="nick">Pseudonyme</Label>
                  <Input
                    id="nick"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mail">Adresse courriel</Label>
                  <Input id="mail" defaultValue={profile.email} type="email" />
                </div>
                <Button size="sm" onClick={() => toast.success("Profil enregistré (démo).")}>
                  Enregistrer
                </Button>
                <p className="text-muted-foreground text-[11px]">
                  Les données restent dans votre navigateur : rien n'est envoyé à un serveur.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/60">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2 text-sm">
                  <Crown className="size-4 text-[var(--gold)]" /> Abonnement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Paquet gratuit toutes les 3 minutes</p>
                    <p className="text-muted-foreground text-[11px]">
                      10 minutes sans abonnement. Le contenu et les taux ne changent pas.
                    </p>
                  </div>
                  <Switch checked={pro} onCheckedChange={setPro} />
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Paquets en réserve</span>
                  <span className="font-medium tabular-nums">{packsReady} / 10</span>
                </div>
                <p className="text-muted-foreground rounded-md border border-dashed px-2 py-1.5 text-[11px] leading-relaxed">
                  Démo : cet interrupteur simule l'abonnement. Aucun paiement, aucune donnée envoyée.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/60">
              <CardHeader>
                <CardTitle className="font-display text-sm">Préférences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Thème sombre</p>
                    <p className="text-muted-foreground text-[11px]">Confort de lecture le soir</p>
                  </div>
                  <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm">Réinitialiser la partie</p>
                  <p className="text-muted-foreground text-[11px]">
                    Remet la collection, les WikiCrédits et les statistiques à leur état initial.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      resetProgress();
                      toast.success("Progression réinitialisée.");
                    }}
                  >
                    <Trash2 className="size-3.5" /> Réinitialiser
                  </Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm">Quitter la session</p>
                  <p className="text-muted-foreground text-[11px]">
                    Vous revenez à l'accueil en visiteur. Votre collection reste dans ce navigateur
                    et revient à la prochaine connexion.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      signOut();
                      toast.success("Vous êtes déconnecté.");
                      navigate("/", { replace: true });
                    }}
                  >
                    <LogOut className="size-3.5" /> Se déconnecter
                  </Button>
                </div>
                <Separator />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast.info("Rien à restaurer dans cette démonstration.")}
                >
                  <RotateCcw className="size-3.5" /> Restaurer une sauvegarde
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border bg-card/50 p-3">
      <p className="text-muted-foreground text-[10px] tracking-wide uppercase">{label}</p>
      <p className="font-display text-xl font-bold tabular-nums">{value}</p>
      <p className="text-muted-foreground text-[10px]">{hint}</p>
    </div>
  );
}
