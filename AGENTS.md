# AGENTS.md — WikiTCG

## Ce qu'est le produit

WikiTCG est un jeu de cartes à collectionner dont chaque carte est une fiche
encyclopédique : un sujet (un animal, un monument, un personnage historique, une
œuvre, une notion scientifique), une accroche courte, une rareté, deux compteurs
et un numéro de fiche.

Le joueur vient **ouvrir des paquets et compléter sa collection**. Ce qui le fait
revenir : le désir de finir une série et la découverte d'une carte rare.
Les duels existent, mais ce sont un bonus pour tester sa collection.

## Public

- Adultes de 18 à 35 ans, francophones.
- Des personnes qui aiment apprendre (animaux, histoire, arts) et qui ont déjà
  joué à un jeu de cartes, ou qui aimeraient essayer.
- Pas de contenu destiné aux enfants pour l'instant.

Conséquences pour le design et les textes :
- rien d'infantilisant : pas de visuels enfantins, pas de vocabulaire simplifié ;
- les sujets sensibles (guerres, figures historiques contestées) sont traités
  avec un vocabulaire neutre et factuel.

## Priorités, dans cet ordre

1. La boucle principale : paquet → collection → série complète.
2. Ce qui la soutient : page de série (« il te manque 3 fiches sur 12 »), mise en
   avant des cartes rares, historique des ouvertures.
3. Plus tard : duels, échanges et place de marché, guildes.

Écarté pour l'instant : paiements, multijoueur en temps réel.
L'API Wikipédia est branchée (photo + résumé des fiches), voir « Sources externes ».

## Où en est le projet

Prototype local, sans serveur : Vite, React 19, TypeScript, Tailwind v4, shadcn/ui.
43 fiches écrites pour le projet (aucun contenu repris d'un autre site).
Aucun compte réel, aucune donnée enregistrée ailleurs que dans le navigateur.
Versionné sur Git, branche `main`.

## Objectif en cours

Terminer le parcours visible, écran par écran, dans cet ordre :
accueil → inscription → catalogue → collection → série complète.
Le serveur vient après.

## Accès aux écrans

Publics, sans compte : accueil, inscription, connexion, règles, catalogue
(`/explorer`) et fiches de cartes (`/carte/...`).

Privés, réservés aux personnes connectées : collection, séries, paquets, duels,
classement, profil. Un visiteur non connecté qui demande une adresse privée est
renvoyé vers la connexion, puis ramené à la page qu'il voulait voir.

Le catalogue et les fiches sont publics par décision produit : voir les cartes
donne envie de s'inscrire, alors qu'un catalogue fermé décourage la découverte.

## Adresses des pages

En français, sans accents, en minuscules, avec des tirets si nécessaire
(exemples : `/paquets`, `/collection`, `/series`, `/carte/grande-vague`).
Pas d'adresses en anglais.

## Modèle économique (validé)

- Un paquet **gratuit toutes les 10 minutes**, avec une **réserve plafonnée à 10**.
- **Aucun paquet ne s'achète.** La seule monnaie d'un paquet, c'est le temps. Il n'existe ni
  ouverture payante, ni achat de tirage supplémentaire.
- **Réserve pleine : le minuteur s'arrête.** Il ne capitalise rien au-delà de 10, et repart
  seulement quand une place se libère.
- **Abonnement « temps »** : le minuteur passe à un paquet toutes les 3 minutes. Il ne change
  jamais les chances de tirage.
- Les WikiCrédits servent à autre chose (achat de fiches à l'unité), et **ne servent pas** à
  ouvrir des paquets.
- **Aucune conversion inverse** : des WikiCrédits ne se revendent jamais contre de l'argent.

## Sources externes

Wikipédia et Wikimedia Commons sont utilisés pour la photo et le résumé des fiches.

- **Attribution obligatoire** : le texte et l'image restent sous licence CC BY-SA. Ils sont
  affichés dans un bloc « Source : Wikipédia », avec la mention de licence et un lien vers
  l'article. Ils ne sont jamais présentés comme notre contenu.
- **Bandeau « Fiche Wikipédia »** sur chaque fiche carte : c'est le lien vers l'article.
- **Politesse technique** : cache local de 7 jours, deux requêtes simultanées au maximum,
  chargement différé (une carte n'interroge l'API que lorsqu'elle entre à l'écran), délai de
  7 secondes, échec silencieux.
- **Ne jamais réécrire l'URL d'une vignette** pour changer sa taille : Wikimedia refuse les
  tailles non générées (erreur 400). On utilise l'URL telle que fournie.
- **Toujours un repli** : si l'image échoue, on affiche l'illustration générée. Jamais de carré
  cassé.
- Avec un serveur, ces appels devront passer par un relais maison (mise en cache et
  identification correcte), pas depuis le navigateur de chaque visiteur.

## Règle de la maquette (à respecter tant qu'il n'y a pas de serveur)

- Le tirage des paquets est une **maquette assumée**.
- Le compte à rebours du paquet gratuit est lui aussi **simulé dans le navigateur** : c'est une
  commodité pour la démonstration, pas un mécanisme sûr. Le vrai minuteur doit vivre sur le
  serveur.
- Ne pas tenter de « sécuriser » ce tirage côté navigateur : cela donnerait une
  fausse impression de sécurité.
- Les crédits sont **décoratifs**.
- L'interface doit le dire clairement à l'utilisateur, à l'endroit où il joue :
  mention du type « démo — rien n'est enregistré ».

## Garde-fous — demander TOUJOURS avant

- toucher à l'authentification, aux comptes ou aux mots de passe ;
- toucher au paiement ;
- supprimer des données ou faire une action irréversible ;
- déployer en production ;
- ajouter un service externe ou une dépendance importante.

## Ligne rouge sécurité

- Aucun mot de passe, clé ou jeton dans la conversation, ni dans un fichier
  versionné.
- Tirage et attribution des cartes : côté serveur uniquement, jamais dans le
  navigateur — dès que le serveur existera.
- Ne jamais faire croire à une sécurité qui n'existe pas.
- Aucune donnée personnelle en clair.

## Façon de travailler

- Commits au format conventionnel (`feat:`, `fix:`, `refactor:`, `docs:`,
  `chore:`) ; titres et messages en anglais, interface en français.
- Un écran à la fois. Ne jamais enchaîner deux écrans sans accord.
- À la fin de chaque écran : un point d'étape avec une capture ou un lien à
  tester, et une phrase disant quel fichier a été modifié et ce qui y a changé.
- Annoncer le plan et attendre l'accord avant tout chantier important.
- Ne toucher qu'à ce projet.

## Décisions de design

Palette encre et or, grille discrète, composants shadcn/ui. Ne pas changer de
direction artistique sans accord. Le logo fourni (globe en pièces de puzzle) reste
à intégrer ; le traitement visuel sera proposé avant d'être appliqué.

## Questions ouvertes

- Un mineur peut-il créer un compte ? À trancher au moment de l'inscription.
- Délai visé pour le parcours visible : 3 semaines.
- Échéance fixe : aucune.
