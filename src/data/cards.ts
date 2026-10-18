import { RARITIES, RARITY_MAP, type Card, type Category, type Rarity } from "@/lib/types";
import { unit } from "@/lib/utils";

/**
 * Jeu de données de démonstration entièrement original : les fiches sont rédigées
 * pour ce projet. Aucun texte, visuel ou donnée n'est repris du site de référence.
 *
 * Format compact : [slug, nom, catégorie, rareté, époque, origine, accroche, fait 1, fait 2]
 */
type Seed = [string, string, Category, Rarity, string, string, string, string, string];

const SEEDS: Seed[] = [
  // ——— Animaux ———
  ["abeille", "Abeille domestique", "Animaux", "commun", "Vivant", "Mondial",
    "Butineuse sociale qui transforme le nectar en miel et façonne des alvéoles parfaites.",
    "Une colonie compte jusqu'à 60 000 individus.", "Sa danse indique la direction d'une fleur."],
  ["loup-gris", "Loup gris", "Animaux", "peu-commun", "Vivant", "Hémisphère nord",
    "Canidé chasseur vivant en meute, doté d'un langage fait de hurlements et de postures.",
    "Un hurlement porte à plus de dix kilomètres.", "La meute suit une hiérarchie familiale souple."],
  ["corbeau", "Corbeau freux", "Animaux", "rare", "Vivant", "Europe",
    "Oiseau noir réputé pour sa mémoire des visages et son goût pour les énigmes.",
    "Il reconnaît un humain pendant des années.", "Il plie des brindilles pour en faire un outil."],
  ["baleine-bleue", "Baleine bleue", "Animaux", "super-rare", "Vivant", "Océans",
    "Le plus grand animal vivant, filtreur géant dont le chant traverse les bassins.",
    "Son cœur atteint la taille d'une voiture.", "Son chant voyage sur des centaines de kilomètres."],
  ["panda-geant", "Panda géant", "Animaux", "ultra-rare", "Vivant", "Sichuan",
    "Mangeur de bambou paisible, devenu l'emblème mondial de la protection animale.",
    "Il consacre plus de douze heures par jour à manger.", "Il possède un sixième « doigt » pour saisir."],
  ["axolotl", "Axolotl", "Animaux", "legendaire", "Vivant", "Mexique",
    "Amphibien rose des canaux de Xochimilco qui régénère ses membres perdus.",
    "Il garde ses branchies toute sa vie.", "Il cicatrise sans laisser de marque."],

  // ——— Sciences ———
  ["gravitation", "Gravitation", "Sciences", "commun", "XVIIe s.", "Europe",
    "Force d'attraction qui tient les pommes au sol et les planètes en orbite.",
    "La loi de la chute fut formalisée au XVIIe siècle.", "Elle courbe l'espace-temps selon Einstein."],
  ["adn", "Double hélice d'ADN", "Sciences", "peu-commun", "XXe s.", "Cambridge",
    "Escalier chimique où s'écrit, en quatre lettres, le mode d'emploi du vivant.",
    "Sa structure fut publiée en 1953.", "Chaque cellule humaine en contient deux mètres."],
  ["tableau-periodique", "Tableau périodique", "Sciences", "rare", "XIXe s.", "Russie",
    "Grille des éléments, classés par masse et par familles de propriétés.",
    "Il prédit la place d'éléments encore inconnus.", "Sa forme actuelle compte 118 cases."],
  ["trou-noir", "Trou noir", "Sciences", "super-rare", "Contemporain", "Cosmos",
    "Puits de gravité si dense que même la lumière n'en ressort pas.",
    "Sa frontière s'appelle l'horizon des événements.", "Il peut fusionner avec un autre trou noir."],
  ["theoreme-pythagore", "Théorème de Pythagore", "Sciences", "ultra-rare", "Antiquité", "Grèce",
    "Relation entre les côtés du triangle rectangle, vieille de plus de vingt-cinq siècles.",
    "Des tablettes mésopotamiennes l'utilisaient déjà.", "Il admet des centaines de démonstrations."],
  ["vaccination", "Vaccination", "Sciences", "legendaire", "XVIIIe s.", "Europe",
    "Entraînement préventif du système immunitaire, l'un des plus grands gains de santé publique.",
    "Le premier vaccin visait la variole.", "Elle a effacé une maladie déclarée éradiquée en 1980."],
  ["quanta", "Quanta d'énergie", "Sciences", "super-rare", "XXe s.", "Europe",
    "Grains indivisibles d'énergie qui rendent le monde atomique granuleux.",
    "L'idée naît en 1900 pour expliquer le rayonnement.", "Elle fonde toute la physique moderne."],

  // ——— Histoire ———
  ["cleopatre", "Cléopâtre VII", "Histoire", "ultra-rare", "Antiquité", "Égypte",
    "Dernière grande reine d'Égypte, stratège politique et polyglotte redoutable.",
    "Elle parlait plusieurs langues de son royaume.", "Son règne s'achève en 30 av. J.-C."],
  ["grande-muraille", "Grande Muraille", "Histoire", "legendaire", "Antiquité", "Chine",
    "Suite de remparts bâtis sur des siècles pour protéger la frontière du nord.",
    "Ses tronçons cumulés dépassent 20 000 km.", "Elle n'est pas visible à l'œil nu depuis la Lune."],
  ["route-de-la-soie", "Route de la Soie", "Histoire", "super-rare", "Antiquité", "Asie",
    "Réseau de pistes par lequel circulaient soie, chevaux, idées et religions.",
    "Elle reliait la Chine à la Méditerranée.", "La soie y servait parfois de monnaie."],
  ["imprimerie", "Presse à imprimer", "Histoire", "rare", "XVe s.", "Europe",
    "Machine à caractères mobiles qui a mis les livres à portée de bourse.",
    "Gutenberg l'adapte vers 1450.", "Un atelier tirait des centaines de pages par jour."],
  ["apollo-11", "Mission Apollo 11", "Histoire", "ultra-rare", "XXe s.", "États-Unis",
    "Premier alunissage habité, retransmis devant des centaines de millions de téléspectateurs.",
    "Trois astronautes, deux sur le sol lunaire.", "L'ordinateur de bord avait moins de mémoire qu'un téléphone."],
  ["revolution-industrielle", "Révolution industrielle", "Histoire", "peu-commun", "XIXe s.", "Europe",
    "Passage des ateliers manuels aux usines, au charbon et aux chemins de fer.",
    "Elle commence en Angleterre au XVIIIe siècle.", "Elle transforme villes, travail et paysages."],

  // ——— Arts ———
  ["frida-kahlo", "Frida Kahlo", "Arts", "super-rare", "XXe s.", "Mexique",
    "Peintre des autoportraits, mêlant douleur intime et couleurs de son pays.",
    "Elle peignit surtout allongée, après son accident.", "Sa maison bleue est devenue un musée."],
  ["beethoven", "Ludwig van Beethoven", "Arts", "rare", "XIXe s.", "Vienne",
    "Compositeur qui continua d'écrire en perdant l'ouïe, jusqu'aux dernières symphonies.",
    "Il composa sa Neuvième étant sourd.", "Ses carnets de conversation remplacent sa voix."],
  ["estampe-japonaise", "Estampe japonaise", "Arts", "peu-commun", "XVIIIe s.", "Japon",
    "Images gravées et imprimées en série, aux lignes nettes et aux ciels dégradés.",
    "Le bleu de Prusse vint bouleverser sa palette.", "Elle inspira largement les peintres européens."],
  ["vitrail-gothique", "Vitrail gothique", "Arts", "commun", "Moyen Âge", "Europe",
    "Verre coloré assemblé en plomb, servant de catéchisme lumineux aux fidèles.",
    "Le rouge s'obtenait avec de l'or dans le verre.", "Les rosaces peuvent compter des milliers de pièces."],
  ["jazz", "Jazz", "Arts", "super-rare", "XXe s.", "La Nouvelle-Orléans",
    "Musique née d'un métissage de fanfares, de blues et de rythmes afro-américains.",
    "Elle repose sur l'improvisation collective.", "Le swing devient sa signature rythmique."],
  ["grande-vague", "La Grande Vague", "Arts", "legendaire", "XIXe s.", "Japon",
    "Estampe célèbre où la mer se courbe en serre au-dessus de trois frêles barques.",
    "L'œuvre appartient à la série des Trente-six vues.", "Le mont Fuji apparaît au fond."],

  // ——— Lieux ———
  ["machu-picchu", "Machu Picchu", "Lieux", "ultra-rare", "XVe s.", "Pérou",
    "Cité d'altitude aux terrasses de pierre, accrochée entre deux crêtes andines.",
    "Elle se dresse à près de 2 430 mètres.", "Ses pierres s'emboîtent sans mortier."],
  ["stonehenge", "Stonehenge", "Lieux", "super-rare", "Préhistoire", "Angleterre",
    "Cercle de pierres dressées dont l'axe s'aligne sur les solstices.",
    "Les blocs les plus lourds pèsent près de 25 tonnes.", "Ils furent transportés sur des dizaines de kilomètres."],
  ["sahara", "Sahara", "Lieux", "rare", "Vivant", "Afrique",
    "Désert de sable, de reg et de roche, plus vaste étendue chaude du globe.",
    "Il fut vert et peuplé il y a plusieurs milliers d'années.", "Ses dunes peuvent dépasser 180 mètres."],
  ["venise", "Venise", "Lieux", "super-rare", "Moyen Âge", "Italie",
    "Cité lagunaire bâtie sur pilotis, sillonnée de canaux et de ponts.",
    "Elle repose sur des millions de pieux de bois.", "Les marées hautes la submergent parfois."],
  ["kilimandjaro", "Kilimandjaro", "Lieux", "ultra-rare", "Vivant", "Tanzanie",
    "Volcan isolé coiffé de neige, point culminant du continent africain.",
    "Il s'élève à 5 895 mètres.", "Ses glaciers reculent d'année en année."],
  ["grand-canyon", "Grand Canyon", "Lieux", "legendaire", "Préhistoire", "États-Unis",
    "Entaille monumentale creusée par un fleuve dans des strates de roche rouge.",
    "Ses parois exposent près de deux milliards d'années.", "Il mesure jusqu'à 29 km de large."],

  // ——— Techniques ———
  ["boussole", "Boussole", "Techniques", "commun", "Moyen Âge", "Chine",
    "Aiguille aimantée qui donne le nord au voyageur, même sous un ciel couvert.",
    "Elle est attestée en Chine bien avant l'Europe.", "Le champ magnétique la fait osciller."],
  ["moteur-a-vapeur", "Machine à vapeur", "Techniques", "rare", "XVIIIe s.", "Écosse",
    "Moteur transformant la pression de l'eau bouillante en mouvement continu.",
    "Watt y ajoute un condenseur séparé.", "Elle a propulsé usines, trains et navires."],
  ["transistor", "Transistor", "Techniques", "ultra-rare", "XXe s.", "États-Unis",
    "Petit interrupteur de silicium, brique de base de toute électronique moderne.",
    "Le premier date de 1947.", "Un processeur en contient plusieurs milliards."],
  ["telescope", "Télescope", "Techniques", "peu-commun", "XVIIe s.", "Pays-Bas",
    "Tube de lentilles qui rapproche les astres et repousse la frontière du ciel.",
    "Galilée l'utilisa dès 1609.", "Les miroirs modernes dépassent dix mètres."],
  ["satellite-artificiel", "Satellite artificiel", "Techniques", "super-rare", "XXe s.", "Terre",
    "Objet mis en orbite pour observer, transmettre ou naviguer.",
    "Le premier fut lancé en 1957.", "Ses panneaux tirent leur énergie du soleil."],
  ["pont-suspendu", "Pont suspendu", "Techniques", "commun", "XIXe s.", "Europe",
    "Ouvrage dont le tablier pend à des câbles tendus entre deux pylônes.",
    "Ses câbles portent des dizaines de milliers de tonnes.", "Certaines portées dépassent deux kilomètres."],

  // ——— Récits ———
  ["odyssee", "L'Odyssée", "Recits", "super-rare", "Antiquité", "Grèce",
    "Récit du retour d'un héros vers son île, semé de monstres et de tentations.",
    "Le poème compte vingt-quatre chants.", "Il a donné le mot « odyssée » aux langues européennes."],
  ["mille-et-une-nuits", "Les Mille et Une Nuits", "Recits", "legendaire", "Moyen Âge", "Orient",
    "Recueil de contes enchâssés où une conteuse repousse chaque nuit son destin.",
    "Les manuscrits diffèrent beaucoup entre eux.", "Le récit-cadre est plus ancien que les contes."],
  ["dracula", "Dracula", "Recits", "rare", "XIXe s.", "Irlande",
    "Roman épistolaire qui a fixé l'image moderne du vampire aristocrate.",
    "Il paraît en 1897.", "Son auteur n'a jamais visité la Transylvanie."],
  ["graal", "Le Saint-Graal", "Recits", "ultra-rare", "Moyen Âge", "Europe",
    "Objet de quête des romans courtois, à la fois coupe, secret et promesse.",
    "Les premiers textes n'en font pas une coupe.", "Sa légende a nourri des siècles d'images."],
  ["yggdrasil", "Yggdrasil", "Recits", "peu-commun", "Moyen Âge", "Scandinavie",
    "Frêne cosmique dont les branches, le tronc et les racines portent neuf mondes.",
    "Un aigle niche à son sommet.", "Un écureuil court entre ses racines et sa cime."],
  ["atlantide", "Atlantide", "Recits", "super-rare", "Antiquité", "Méditerranée",
    "Île décrite puis engloutie dans un dialogue philosophique grec.",
    "Elle apparaît chez Platon, sans localisation.", "Des milliers de sites ont été proposés depuis."],
];

const STAT_BASE: Record<Rarity, number> = {
  commun: 38,
  "peu-commun": 46,
  rare: 54,
  "super-rare": 62,
  "ultra-rare": 70,
  legendaire: 80,
};

function statFor(slug: string, rarity: Rarity, salt: string): number {
  const base = STAT_BASE[rarity];
  return Math.min(99, Math.round(base + unit(slug, salt) * 20 - 6));
}

const SET_BY_CATEGORY: Record<Category, string> = {
  Animaux: "Mondes vivants",
  Sciences: "Lumière & métal",
  Histoire: "Pierres & empires",
  Arts: "Ateliers & scènes",
  Lieux: "Cartes du monde",
  Techniques: "Machines & signaux",
  Recits: "Rêves & récits",
};

export const CARDS: Card[] = SEEDS.map((seed, index) => {
  const [slug, name, category, rarity, era, origin, blurb, fact1, fact2] = seed;
  const info = RARITY_MAP[rarity];
  const value = Math.round((info.baseValue * (0.85 + unit(slug, "value") * 0.45)) / 10) * 10;

  return {
    id: `card_${slug}`,
    slug,
    name,
    category,
    rarity,
    set: SET_BY_CATEGORY[category],
    era,
    origin,
    blurb,
    lore: `${blurb} Cette fiche rassemble l'essentiel de ce qu'un collectionneur doit savoir avant de la poser sur la table.`,
    stats: {
      savoir: statFor(slug, rarity, "savoir"),
      influence: statFor(slug, rarity, "influence"),
      singularite: statFor(slug, rarity, "singularite"),
    },
    value,
    number: `${String(index + 1).padStart(3, "0")} / ${String(SEEDS.length).padStart(3, "0")}`,
    tags: [category.toLowerCase(), era.toLowerCase(), origin.toLowerCase()],
    facts: [fact1, fact2],
  };
});

export const CARD_BY_SLUG = new Map(CARDS.map((card) => [card.slug, card]));
export const CARD_BY_ID = new Map(CARDS.map((card) => [card.id, card]));

export function cardById(id: string): Card | undefined {
  return CARD_BY_ID.get(id);
}

export const SETS = Array.from(new Set(CARDS.map((card) => card.set)));

export const RARITY_COUNTS = RARITIES.reduce<Record<Rarity, number>>(
  (acc, rarity) => {
    acc[rarity] = CARDS.filter((card) => card.rarity === rarity).length;
    return acc;
  },
  {} as Record<Rarity, number>,
);

/** Tire une carte au hasard en respectant les taux d'apparition des raretés. */
export function drawCard(random = Math.random): Card {
  const roll = random();
  let cumulative = 0;
  for (const rarity of RARITIES) {
    cumulative += RARITY_MAP[rarity].dropRate;
    if (roll <= cumulative) {
      const pool = CARDS.filter((card) => card.rarity === rarity);
      if (pool.length > 0) return pool[Math.floor(random() * pool.length)];
    }
  }
  const pool = CARDS.filter((card) => card.rarity === "commun");
  return pool[Math.floor(random() * pool.length)];
}
