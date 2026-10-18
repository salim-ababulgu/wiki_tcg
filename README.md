# WikiTCG — refonte « cartes à collectionner du savoir », avec shadcn/ui

Prototype complet, **original**, d'un site de collection de fiches encyclopédiques, bâti en
réponse à l'analyse de `wiki-masters.com`. Le code, les textes et les visuels sont propres à ce
projet : aucun texte, logo, image ou donnée du site de référence n'a été repris.

## 1. Ce que fait le site de référence (analyse)

Le site cible est une application **Next.js** (App Router, rendu serveur, Tailwind) dont la
quasi-totalité des pages est derrière authentification. Ce qui est observable publiquement :

- `/` redirige vers `/signup`, `/collection`, `/battle`, `/profile` et `/leaderboard` renvoient vers `/login` (307).
- Pages publiques : `/login`, `/signup`, `/rules`, `/verify-email`, plus un `sitemap.xml` réduit.
- Proposition de valeur : « Collectionnez les cartes Wikipédia » — chaque carte = un sujet
  encyclopédique, avec un visuel, une accroche courte, une **rareté** (C, PC, R, SR, UR, L),
  deux compteurs chiffrés (valeur et offre/demande) et un numéro de fiche.
- Fonctionnalités déduites du règlement communautaire : profils et pseudonymes, messages privés,
  **échanges**, **duels**, **guildes**, **place de marché**, **paquets** (`/packs`), parrainage,
  classements, suspension/bannissement.
- Design : fond sombre, cartes très illustrées avec halo coloré par rareté, navigation latérale,
  doubles compteurs monétaires.

Décision de refonte : reprendre **le modèle de jeu et la structure d'information**, pas l'identité
visuelle. La direction artistique ici est inédite (palette encre + or, arts générés, grille
discrète, typographie display).

## 2. Ce qui est livré

| Page | Route | Contenu |
| --- | --- | --- |
| Accueil | `/` | Héros avec deck animé, progression, échelle des raretés, sélection, « comment jouer » |
| Catalogue | `/explorer` | 43 fiches, recherche plein texte, filtres rareté/catégorie/édition, 5 tris, vue dense |
| Fiche | `/carte/:slug` | Grande carte, attributs, faits, cours simulé (histogramme), achat, liste d'envies, suggestions |
| Collection | `/collection` | Progression globale et par rareté, valeur totale, onglets toutes / doublons / envies |
| Paquets | `/paquets` | Ouverture animée carte par carte, taux publics, 3 formules, statistiques |
| Duels | `/duels` | Main de 3 cartes, comparaison Savoir / Influence / Singularité, récompenses |
| Classement | `/classement` | Joueurs (surlignage de la ligne « vous ») et guildes |
| Profil | `/profil` | Bannière, stats, niveau/XP, journal, badges, réglages et remise à zéro |
| Règles | `/regles` | Règlement original en 5 sections |
| Auth | `/connexion`, `/inscription` | Formulaires validés + entrée en mode démonstration |

État de jeu persistant (`localStorage`) : collection, crédits, XP, paquets ouverts, liste d'envies,
thème. Aucun serveur : tout est local, donc rejouable et remis à zéro depuis le profil.

## 3. Technique

- **Vite 7 + React 19 + TypeScript strict + Tailwind CSS v4**
- **shadcn/ui** (style `new-york`) : `components.json` présent, primitives Radix dans
  `src/components/ui/` (button, badge, card, input, label, dialog, select, tabs, progress,
  separator, avatar, tooltip, switch, skeleton, sonner), tokens OKLCH clair/sombre dans
  `src/index.css`.
- **Arts de cartes générés** : `src/components/card-art.tsx` produit un dégradé + formes SVG +
  pictogramme de catégorie, de façon **déterministe** à partir du slug (aucune image externe,
  donc aucun problème de licence).
- Données : `src/data/cards.ts` — 43 fiches rédigées pour le projet, 7 éditions, 6 raretés.
- État : `src/lib/game-store.tsx` (contexte + persistance).

### Lancer

```bash
pnpm install
pnpm dev          # serveur de développement Vite
pnpm build        # vérification TypeScript + build de production
node scripts/serve.mjs 4174   # prévisualiser dist/ sans dépendance
```

### Structure

```
src/
  components/ui/      primitives shadcn
  components/         card-tile, card-art, rarity-badge, app-shell, stat-bar…
  data/cards.ts       catalogue
  lib/                types, utils, game-store
  pages/              une page par route
scripts/serve.mjs     serveur statique de prévisualisation
```

## 4. Prochaines étapes possibles

1. **Passer à Next.js 15/16** (App Router) pour le SEO des fiches — les composants shadcn et les
   pages se transposent presque tels quels ; seuls le routage et les imports changent.
2. **Backend** : Postgres + Prisma (ou Supabase) pour comptes, inventaire transactionnel,
   ouvertures de paquets côté serveur (RNG non manipulable), échanges et place de marché.
3. **Authentification** réelle : e-mail + mot de passe (argon2), vérification d'adresse, OAuth.
4. **Données réelles** : importer des sujets depuis une source libre (Wikidata / API Wikimedia)
   avec attribution conforme, et générer les visuels ou utiliser des images sous licence claire.
5. **Temps réel** pour les duels (WebSocket), guildes, modération et signalements.
