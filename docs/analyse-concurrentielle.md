# Analyse concurrentielle

Trois jeux de cartes à collectionner bâtis sur des articles encyclopédiques.
Lecture seule, et **aucun texte, visuel ni logo repris** : seules les mécaniques sont décrites,
reformulées avec mes mots.

## Méthode et limites, à lire avant le reste

- **Zones publiques uniquement.** Les collections, les duels, les marchés et les enchères vivent
  derrière une connexion : je ne les ai pas vus fonctionner.
- **Une partie du relevé vient de toi**, pas de moi. Les pages « comment ça marche » et les
  conditions d'utilisation de Wiki-Pick m'ont été transmises. Je les ai lues et reformulées, mais
  je ne les ai pas re-vérifiées une par une sur le site.
- **Le troisième site (wikimasters.fr) ne donne rien à voir.** Sa page publique est une coquille
  qui charge ses données en JavaScript : aucune structure, aucun parcours, aucune mécanique
  observable. Je ne peux rien en dire d'utile.

---

## 1. WikiMasters (wiki-masters.com)

**Structure d'information.** Tout est derrière la porte : seules l'inscription, la connexion, la
vérification d'adresse et les règles sont accessibles sans compte. Le plan du site public ne
contient que ces adresses. Le reste — collection, duels, profil, classement — redirige vers la
connexion.

**Les cartes.** Chaque carte vient d'un article encyclopédique réel. La rareté n'est pas
décorative : elle dépend du **nombre de consultations mensuelles de l'article**. Six niveaux, avec
des seuils croissants, du plus discret au plus consulté.

**Les paquets.** Cinq cartes par paquet, **révélées dans l'ordre croissant de rareté** (la plus
commune d'abord). Un paquet se régénère **toutes les 10 minutes**, et on peut en **stocker 10 au
maximum**. La réserve est donc bornée : l'attente se capitalise, mais pas indéfiniment.

**Monétisation.** Une monnaie achetable, présentée comme servant à **enchérir aux enchères** sur
des cartes rares. Achats annoncés non remboursables.

**Communauté.** Le règlement évoque duels, échanges, guildes, messagerie et place de marché.

**Non vérifié chez eux :** l'écran de collection, le déroulé d'un duel, le fonctionnement réel des
enchères, les taux de tirage (aucun chiffre public trouvé).

---

## 2. Wiki-Pick (wiki-pick.com)

**Ampleur.** Le corpus n'est pas une sélection : c'est **l'ensemble du Wikipédia francophone**,
soit plusieurs millions d'articles potentiels. Le titre, le résumé et l'image proviennent de
l'article, et se mettent à jour quand l'article change.

**Les cartes.** Sept rangs, avec des seuils de consultation très élevés (jusqu'à des dizaines de
millions de vues mensuelles pour le sommet). Un huitième état, dit « chromatique », ne remplace pas
un rang : c'est une **variante d'exemplaire** réservée aux deux rangs les plus hauts, extrêmement
rare, sans recette connue.

**Les paquets.** Cinq cartes, dévoilées de la plus commune à la plus rare. Réserve de **10 paquets**,
régénération **toutes les 10 minutes**. Les abonnés payants ont un paquet **toutes les 3 minutes**,
plus un paquet de 20 cartes offert chaque jour.

**Les taux.** Publiés, mais exprimés en **« combien de paquets faut-il ouvrir en moyenne pour
croiser ce rang »** — une formulation bien plus parlante qu'un pourcentage. Le reste du paquet est
tiré au hasard dans tout le corpus, où les articles très lus sont rares par nature.

**Les événements.** Des variantes saisonnières (Halloween) remplacent une carte du même rang. Elles
sont permanentes une fois obtenues, avec leur propre marché et leurs propres doublons.

**L'économie.** Monnaie de jeu, marché entre joueurs, recyclage, fusion, défis collectifs, guildes.

**Les conditions d'utilisation**, telles que tu me les as transmises, disent l'essentiel :

- Les objets virtuels sont **concédés en usage**, pas possédés ; sans valeur monétaire, non
  remboursables, non convertibles en argent ; le commerce hors du jeu est interdit.
- Le jeu est **jouable intégralement sans payer** ; les achats sont facultatifs (lots de paquets,
  monnaie, abonnement à 4,99 € par mois, taxes comprises).
- Échanges et enchères entre joueurs, dans la monnaie du jeu seulement ; une enchère remportée est
  définitive ; toute manipulation du marché est interdite.
- Sanctions graduées : avertissement, retrait de contenu, retrait de ce qui a été obtenu
  abusivement, suspension, suppression.
- Suppression de compte définitive, qui **résilie l'abonnement** et efface les données.

**Non vérifié chez eux :** l'interface réelle, le parcours d'inscription écran par écran, le
déroulé d'un duel, la page de boutique.

---

## 3. Comparaison avec WikiTCG aujourd'hui

| Point | WikiMasters | Wiki-Pick | WikiTCG (actuel) |
|---|---|---|---|
| Origine des cartes | articles réels | tout Wikipédia FR | 43 fiches rédigées maison |
| Rareté | vues mensuelles, 6 niveaux | vues mensuelles, 7 niveaux + variante | attribuée à la main, 6 niveaux |
| Paquets | 5 cartes / 10 min / stock 10 | idem, + abonnement à 3 min | 5 cartes, sans minuteur, stock illimité |
| Taux | non publiés | publiés, en « 1 paquet sur N » | publiés, en pourcentage |
| Monnaie | une monnaie achetée, pour les enchères | monnaie + boutique + abonnement | décorative |
| Marché | enchères | marché entre joueurs + recyclage | aucun |
| Compte | simple | simple + abonnement | simulé |

---

## 4. Dix idées à reprendre

1. **Réserve de paquets plafonnée (10).** L'attente devient un capital : on peut « faire ses
   courses » une fois par jour au lieu de revenir toutes les 10 minutes. C'est le réglage qui
   respecte le mieux la vie réelle, et il est trivial à coder côté serveur.
2. **Compte à rebours toujours visible.** Un rendez-vous, un rituel. Sans lui, le joueur ne sait
   pas quand revenir.
3. **Révélation de la plus commune à la plus rare.** Le suspense est gratuit : il ne coûte qu'un
   ordre d'affichage.
4. **Taux exprimés en « 1 paquet sur N ».** « Une légendaire tous les 200 paquets » se comprend
   instantanément ; « 0,5 % » demande un calcul. C'est de la pédagogie, pas de la décoration.
5. **Rareté adossée à un fait objectif.** Une rareté fondée sur un chiffre vérifiable se défend
   toute seule : pas de débat sur « pourquoi cette carte est-elle légendaire ». Elle se met à jour
   quand la donnée bouge.
6. **Un abonnement qui accélère le temps, pas la chance.** Payer pour ouvrir plus souvent reste
   honnête ; payer pour de meilleures chances transforme le jeu en loterie payante. C'est la
   différence entre les deux concurrents et c'est la bonne frontière.
7. **La fiche renvoie à sa source.** Un lien vers l'article d'origine apporte de la crédibilité, du
   contenu gratuit, et du trafic entrant depuis les moteurs de recherche.
8. **Une variante d'exemplaire.** Le même sujet, une version rare et irisée : cela prolonge la
   collection sans écrire une seule nouvelle fiche. À garder pour plus tard, mais c'est la
   meilleure idée de longévité des deux sites.
9. **Un événement saisonnier.** Une variante limitée dans le temps, conservée ensuite, relance
   l'intérêt sans casser l'économie.
10. **Règles et conditions accessibles partout.** Les deux concurrents en ont fait un livre de
    droit ; toi tu peux faire mieux en une page claire. C'est aussi une protection.

---

## 5. Ce qu'il faut écarter, ou décaler

1. **Les enchères en monnaie achetable.** C'est le point le plus exposé : on paie, on mise, on
   obtient une carte rare. Le joueur qui a payé perd son argent contre du hasard, et la frontière
   avec le jeu d'argent devient difficile à défendre. À écarter de la première version.
2. **Une variante ultra-rare en plus des raretés existantes.** Produire un rendu irisé pour des
   milliers de cartes coûte cher en design. À garder comme objectif de saison 2.
3. **Tout Wikipédia comme réservoir.** Des millions de fiches, c'est impressionnant, mais la
   qualité est inégale (ébauches, articles vides), la modération est impossible, et l'attribution
   des sources devient un casse-tête juridique et technique.
4. **Le parrainage.** C'est le premier vecteur de faux comptes, et ton propre règlement les interdit
   déjà.
5. **Multiplier les monnaies.** Une monnaie principale et, au besoin, une seconde pour les échanges
   suffisent. Chaque monnaie supplémentaire ajoute de la confusion et de la surface d'abus.

---

## 6. Ce que cela change dans nos décisions déjà écrites

| Décision précédente | Ce que la concurrence enseigne | Nouvelle proposition |
|---|---|---|
| Un paquet gratuit, **pas d'accumulation** | les deux concurrents plafonnent à 10 | **Réserve de 10**, minuteur serveur de 10 minutes |
| Rareté attribuée à la main | la rareté mesurée est plus défendable | garder la main sur les 43 fiches, **mais prévoir un champ « source » et un indice** pour plus tard |
| Aucune monétisation prévue | l'abonnement existe et se vend | **abonnement « temps »** (gratuit toutes les 3 min) plutôt que « chance » |
| Doublons : question ouverte | les concurrents recyclent et fusionnent | **recyclage en crédits**, la fusion plus tard |

---

## 7. Le point Wikipédia, qui n'est pas un détail

Les textes de Wikipédia sont sous licence libre : leur réutilisation commerciale est autorisée, mais
**avec attribution** — et le texte modifié doit rester partageable dans les mêmes conditions. Les
images sont un cas par cas, avec des licences parfois plus restrictives.

Conséquences pratiques si on branche l'API plus tard : mention visible de la source sur chaque
fiche, lien vers l'article, et prudence sur la réécriture des résumés. À faire vérifier par un
juriste avant la mise en ligne, pas après.
