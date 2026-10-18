import { ArrowLeft, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Section = { title: string; items: string[] };

/**
 * Règlement rédigé pour ce prototype : texte original, volontairement court.
 */
const SECTIONS: Section[] = [
  {
    title: "1. Respect entre joueurs",
    items: [
      "Aucun propos haineux, discriminatoire ou menaçant, dans les profils comme dans les messages.",
      "Les pseudonymes et avatars doivent rester lisibles par tous : pas d'usurpation, pas d'image choquante.",
      "Un désaccord sur une règle se règle par un signalement, jamais par une insulte.",
    ],
  },
  {
    title: "2. Un compte par personne",
    items: [
      "Les comptes multiples destinés à multiplier les récompenses sont interdits.",
      "Le partage, la revente ou l'échange de comptes contre un avantage extérieur est interdit.",
      "Toute tentative de contournement d'une sanction entraîne un bannissement définitif.",
    ],
  },
  {
    title: "3. Jeu équitable",
    items: [
      "Pas de robots, de macros ni de scripts pour ouvrir des paquets ou jouer à votre place.",
      "Les failles doivent être signalées, pas exploitées. Un avantage obtenu par une faille est retiré.",
      "Les duels doivent être joués de bonne foi : pas d'entente pour fausser un classement.",
    ],
  },
  {
    title: "4. Échanges et place de marché",
    items: [
      "Une annonce décrit honnêtement la carte proposée et son édition.",
      "Aucune transaction en argent réel n'est autorisée pour des cartes virtuelles.",
      "Les cartes n'ont aucune valeur monétaire : ce sont des objets de collection numériques.",
    ],
  },
  {
    title: "5. Contenus et données",
    items: [
      "Les fiches sont rédigées par l'équipe : ne les recopiez pas ailleurs sans autorisation.",
      "Vous êtes responsable de ce que vous publiez dans votre profil et vos échanges.",
      "Les signalements sont examinés et peuvent mener à un avertissement, une suspension ou un bannissement.",
    ],
  },
];

export function RulesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/">
          <ArrowLeft className="size-4" /> Retour
        </Link>
      </Button>

      <div className="space-y-3">
        <div className="bg-accent text-accent-foreground grid size-11 place-items-center rounded-xl">
          <ScrollText className="size-5" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Règles de la communauté
        </h1>
        <p className="text-muted-foreground text-sm">
          Dernière mise à jour : aujourd'hui. Ces règles s'appliquent à toutes les pages de WikiTCG :
          profils, duels, échanges et espaces de discussion.
        </p>
      </div>

      <Card className="bg-card/60">
        <CardContent className="space-y-6">
          {SECTIONS.map((section, index) => (
            <div key={section.title} className="space-y-2.5">
              {index > 0 && <Separator className="mb-4" />}
              <h2 className="font-display text-base font-semibold">{section.title}</h2>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="text-muted-foreground flex gap-2 text-sm leading-relaxed">
                    <span className="bg-primary/60 mt-1.5 size-1.5 shrink-0 rounded-full" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-xs">
        Ce prototype ne dispose pas de serveur : aucune sanction réelle n'est appliquée, aucune donnée
        n'est transmise.
      </p>
    </div>
  );
}
