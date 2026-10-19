# Ouverture de paquet — cahier des charges

Document de travail, **à valider avant toute implémentation**.
État : proposition. Aucun serveur n'existe aujourd'hui.

---

## 1. Les six règles à ne jamais casser

Une vraie ouverture de paquet doit respecter ces règles. Si l'une tombe, le jeu devient
injuste ou attaquable.

| # | Règle | Pourquoi | Comment |
|---|---|---|---|
| 1 | **Le tirage ne dépend jamais du navigateur** | Sinon n'importe qui peut modifier le résultat en trois clics | Tirage exécuté sur le serveur, le navigateur ne reçoit qu'un résultat déjà figé |
| 2 | **Une ouverture = une transaction indivisible** | Éviter le joueur débité sans carte, ou les cartes gratuites | Débit, cartes et trace d'ouverture écrits ensemble, ou rien du tout |
| 3 | **Les taux affichés sont les taux appliqués** | C'est la promesse faite au joueur | Une seule table de taux, versionnée, utilisée à la fois pour l'affichage et le tirage |
| 4 | **Une demande = une seule ouverture** | Empêcher de tirer dix paquets en cliquant dix fois | Chaque demande porte une clé unique, à usage unique |
| 5 | **On ne peut pas ouvrir plus vite qu'une limite** | Empêcher les robots et la surcharge | Limite par compte et par minute, plus une ouverture à la fois par joueur |
| 6 | **L'animation n'est qu'un habillage** | Sinon le serveur et l'écran peuvent se contredire | Le résultat est décidé avant, l'animation ne fait que le révéler |

---

## 2. Le parcours complet, étape par étape

```
Joueur          Navigateur              Serveur                    Base de données
  │                 │                      │                             │
  │ clic « Ouvrir » │                      │                             │
  │────────────────>│                      │                             │
  │                 │ demande + clé unique │                             │
  │                 │─────────────────────>│                             │
  │                 │                      │ 1. session valide ?         │
  │                 │                      │ 2. clé déjà vue ?           │
  │                 │                      │ 3. solde suffisant ?        │
  │                 │                      │ 4. limite non atteinte ?    │
  │                 │                      │────────────────────────────>│
  │                 │                      │ 5. tirage (aléatoire sûr)   │
  │                 │                      │ 6. ÉCRITURE EN UN BLOC :    │
  │                 │                      │    débit + cartes + trace   │
  │                 │                      │<────────────────────────────│
  │                 │  résultat + n° ouverture                            │
  │                 │<─────────────────────│                             │
  │   animation     │                      │                             │
  │<────────────────│                      │                             │
```

**Détail des étapes**

1. **Clic** — le bouton se désactive immédiatement, pour éviter le double envoi.
2. **Demande** — le navigateur envoie une *clé unique* (un identifiant de cette tentative).
3. **Contrôles** — dans cet ordre : session, clé déjà utilisée, solde, limite de fréquence.
   Les contrôles passent **avant** le tirage : on ne tire pas pour rien.
4. **Tirage** — aléatoire cryptographique, pondéré par rareté (voir §3).
5. **Écriture** — une seule transaction : débit des crédits, ajout des cartes, trace de
   l'ouverture avec la version des taux. Si une seule partie échoue, tout est annulé.
6. **Réponse** — le serveur renvoie les cartes, le solde restant et un numéro d'ouverture.
7. **Animation** — le navigateur révèle les cartes de la réponse, dans l'ordre reçu.
8. **Historique** — l'ouverture reste consultable, même après fermeture du navigateur.

---

## 3. Le tirage, en pratique

- **Aléatoire cryptographique** (générateur fourni par le système), jamais l'aléatoire
  ordinaire du navigateur. C'est la différence entre « imprévisible » et « devinable ».
- **Deux temps** : on tire d'abord une rareté selon les taux publiés, puis une carte au
  hasard à l'intérieur de cette rareté. Cela garantit que les taux affichés sont exacts.
- **Pas de rattrapage caché.** Si un jour on ajoute une garantie du type « au bout de 30
  paquets sans rare, une rare est offerte », elle doit être **écrite noir sur blanc** dans
  la page des taux. Une garantie secrète est une tromperie.
- **Traçabilité** : chaque ouverture enregistre la table de taux utilisée, sa version et sa
  date. Si les taux changent, les anciennes ouvertures restent justifiables.

---

## 4. Des taux publics et vérifiables

- Une **page publique** liste les taux de chaque paquet, avec la date de dernière mise à jour.
- Les **garanties affichées** (« 1 peu commune garantie », « rare garanti ») doivent être
  réellement appliquées par le tirage. Aujourd'hui, l'interface les promet : c'est une
  promesse à tenir, sinon il faut la retirer.
- **Journal personnel** : le joueur peut revoir ses ouvertures (date, paquet, cartes).
- **Statistiques globales** : publier le nombre d'ouvertures et de rares distribuées permet
  à la communauté de contrôler les taux. C'est le meilleur argument de confiance.

---

## 5. Anti-abus et anti-rejeu

| Risque | Parade |
|---|---|
| Double clic, double onglet | Clé unique par tentative : la deuxième demande renvoie le **même** résultat, sans nouveau débit |
| Rejeu d'une ancienne demande | Clé à usage unique, liée au compte et horodatée |
| Robot d'ouverture en boucle | Limite par minute **et** par heure, plus une seule ouverture simultanée par compte |
| Script qui contourne l'interface | Vérification côté serveur de la cohérence (temps de réaction impossible, séquences régulières) |
| Perte de réseau | Nouvelle tentative avec la **même** clé : soit le résultat existant est renvoyé, soit rien n'a eu lieu |

---

## 6. Les cas limites

| # | Situation | Ce que le joueur voit | Ce qui est écrit en base |
|---|---|---|---|
| 1 | Solde insuffisant | Message clair, bouton vers les duels ou l'attente quotidienne | Rien |
| 2 | Double clic | Une seule ouverture | Une seule |
| 3 | Coupure **après** l'écriture, avant la réponse | Le résultat réapparaît à la reconnexion (historique) | L'ouverture complète |
| 4 | Coupure **avant** l'écriture | « L'ouverture n'a pas abouti », réessai possible | Rien |
| 5 | Réponse perdue, le joueur réessaie | Même résultat qu'attendu | Une seule |
| 6 | Le joueur possède déjà toutes les cartes | Cartes en doublon (règle à décider, §8) | Les doublons |
| 7 | Limite de fréquence atteinte | « Patientez quelques secondes » + compte à rebours | Rien |
| 8 | Session expirée pendant l'ouverture | « Reconnectez-vous », aucune perte | Rien, ou l'ouverture si déjà écrite |
| 9 | Onglet fermé pendant l'animation | Rien à l'écran ; les cartes sont déjà là | L'ouverture |
| 10 | Le serveur tombe pendant l'écriture | « Réessayez », rien n'est débité | Rien (transaction annulée) |
| 11 | Taux modifiés entre deux ouvertures | Sans effet pour le joueur | Chaque ouverture garde sa version |
| 12 | Paquet demandé avec une taille inconnue | Refus | Rien |

---

## 7. Ce que ça change pour la maquette actuelle

- **Aujourd'hui** : le tirage a lieu dans le navigateur, les crédits sont décoratifs. C'est
  assumé et affiché comme tel.
- **On ne cherche pas à « sécuriser »** ce tirage côté navigateur : ce serait du vernis sur
  une porte ouverte, et cela donnerait une fausse impression de sérieux.
- **Le jour du serveur** : l'écran d'ouverture ne change pas. Seul le tirage passe de
  l'autre côté, et l'animation se nourrit d'un résultat déjà validé.

---

## 8. Décisions à prendre (et qui bloquent la suite)

1. **Monnaie** : les paquets s'ouvrent-ils uniquement avec des crédits gagnés en jouant, ou
   peut-on en acheter avec de l'argent réel ? *Tout le reste en dépend, y compris le cadre
   juridique (§9).*
2. **Doublons** : que faire d'une carte déjà possédée — poussière convertible, échange,
   ou rien ?
3. **Garanties** : garde-t-on les garanties affichées aujourd'hui (« 1 peu commune »,
   « rare garanti ») ? Si oui, elles doivent être programmées et vérifiables.
4. **Prix et taille des paquets** : trois formules sont affichées dans l'interface ; il faut
   figer leurs prix et leur contenu.
5. **Historique** : conservé combien de temps, et visible uniquement par le joueur ?

---

## 9. Point juridique à ne pas laisser traîner

Si un paquet peut s'acheter avec de l'argent réel et rend un contenu aléatoire, on entre dans
le sujet des **« loot boxes »**. La France a ouvert un cadre spécifique pour les « jeux à
objets numériques monétisables », avec un régulateur dédié. **Je ne suis pas juriste** : c'est
un point à faire vérifier par un professionnel **avant** de vendre quoi que ce soit, pas après.
Tant que les crédits se gagnent uniquement en jouant, la situation est plus simple — sans être
forcément hors sujet.

---

## 10. Critères d'acceptation (comment on saura que c'est bon)

1. Couper le réseau juste après le clic : au retour, aucune ouverture perdue, aucun double débit.
2. Cliquer dix fois très vite : une seule ouverture, un seul débit.
3. Ouvrir 10 000 paquets en test : les fréquences observées collent aux taux publiés.
4. Rejouer une ancienne demande : refusée, aucun débit.
5. Vérifier en base qu'aucune ouverture n'existe sans ses cartes ni son débit.
6. Le journal du joueur correspond exactement à la base.
7. Un administrateur peut expliquer n'importe quelle ouverture passée (table de taux, date).
8. Dépasser la limite de fréquence : refus propre, message compréhensible.
