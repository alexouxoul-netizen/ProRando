# RandoVista V11.4 TEST — Découvrir

## Livré

Recherche autour de coordonnées, d'une zone prédéfinie ou d'une position volontaire ; rayon, distance minimale/maximale, paysages et nom. Résultats paginés avec producteur, fiche, licence et date de consultation. Récupération GPX directe aux Écrins, téléchargement/import manuel pour le 64. Analyse par le moteur stable, verdict du profil choisi, ouverture dans Préparer et sauvegarde dans Mes randos. Présentation mobile vert forêt conservée.

## Base et conservation

Base : RandoVista-V11.3.1-RENOMMAGE-TEST.zip, dernière livraison retrouvée après validation de la bibliothèque et du niveau Très facile. SHA-256 du ZIP source : `69fdd495e9e4ef203548a97aba730e1b3a283d70eaa764944901a2abb8068c09`.

21 fichiers critiques sont identiques octet pour octet à V11.3.1 : moteur GPX, règles/calibration, comparateur, profils, carnet, bibliothèque intelligente, stockage, synchronisation et configuration cloud, chargement des parcours, etc. Le module de bibliothèque expose sa fonction de sauvegarde existante et signale explicitement une indisponibilité du stockage. La navigation accueille un quatrième onglet ; le démarrage et le cache hors connexion incluent les nouveaux fichiers. Aucune migration ni suppression des données V11. Le catalogue de découverte utilise une base locale distincte.

## Vérifications effectuées

- Suite historique : 179 vérifications annoncées par le lanceur, puis 7 contrôles de recalibration, dont le balayage de 8 723 combinaisons. Fontargente, Oô, Orlu, Gaube, Saint-Félix et Gavarnie : résultats stables. Les altitudes manquantes et les analyses partielles restent signalées.
- Tests de bibliothèque intelligente, Très facile, renommage, annulation et échec d'écriture : réussis.
- 34 contrôles Découvrir : coordonnées, unités différentes selon source, filtres géographiques/distance/paysage, exclusion des pratiques non pédestres et GR identifiés du 64, liens hors domaine, absence GPX, GPX invalide, pagination, HTTP 429, limite de taille et annulation.
- Vérification du paquet : 21 fichiers critiques stables identiques ; 43 ressources de l'application hors connexion présentes et dépendances de démarrage couvertes. Le contrôle historique de 30 fichiers passe également en autorisant uniquement l'ajout de l'onglet dans le fichier de navigation.
- Appels réels du 12 novembre 2026 : 406 fiches pédestres des Écrins, 370 du 64 après filtrage ; pagination complète. Ces nombres évolueront avec les producteurs. Récupération réelle GPX des Écrins réussie. Catalogue 64 lisible avec CORS, GPX 64 HTTP 200 sans autorisation CORS, d'où le parcours manuel.
- Navigateur à 390 × 844 : recherche réelle dans les deux catalogues, filtre Lacs, récupération/analyse de L’Onde et Le Villard, sauvegarde, sélection du profil Moi et transfert dans Préparer ; import du GPX réel Le circuit patrimoine de l'eau, analyse et sauvegarde. Bibliothèque : les deux parcours présents. Largeur de page 390 px, sans débordement horizontal.
- Serveur local arrêté puis page rechargée : application servie par son cache, catalogue conservé relu, deux GPX toujours présents en bibliothèque et ouverture/analyse d'un parcours réussie. Il s'agit d'un essai sans serveur d'application, pas d'un test réseau complet en mode avion sur un iPhone physique.

La synchronisation réelle entre deux appareils connectés au compte de l'utilisateur, Safari sur iPhone physique et les permissions de géolocalisation n'ont pas été testés. Les modules cloud existants sont inchangés ; un contrôle avec le compte partagé est prévu dans les consignes d'installation.

## Limites principales

Couverture partielle : Écrins et catalogue du 64. Hautes-Pyrénées et Ariège non activées faute d'autorisation de réutilisation établie pour la source étudiée. Le catalogue 64 peut contenir des parcours limitrophes ; sa couverture ne constitue pas un inventaire de tous les Pyrénées. Les restrictions GR du producteur priment sur sa licence générale ; exclusion des GR identifiés, dépendante de la qualité des métadonnées.

Les paysages sont des thèmes ou mots du titre/résumé. Le thème « lac et glacier » des Écrins ne garantit pas un lac. La recherche porte sur le départ et un rayon à vol d'oiseau, pas sur le temps de route ni l'intersection de toute la trace. Aucun géocodage libre de commune n'est fourni.

Le serveur GPX du 64 impose un téléchargement puis import manuel dans une application statique hébergée sur GitHub Pages. Aucun proxy ni trace reconstruite. L'identité du fichier importé avec la fiche reste à vérifier par l'utilisateur. Sans fichier valide, aucun score GPX. Le verdict reste indicatif et ne prouve pas la sécurité, la météo ou la technicité.

Attribution visible sur les résultats de Découvrir. Les GPX sont sauvegardés dans leur contenu original ; aucune nouvelle fiche de provenance n'est ajoutée au format synchronisé de la bibliothèque. Le catalogue conservé peut vieillir ; il doit être actualisé en ligne. Les analyses non sauvegardées sont limitées à 20 fichiers en mémoire et disparaissent à la fermeture.

Aucune publication réalisée. Le ZIP contient l'application et des tests portables ; les GPX personnels des anciennes vérifications et les sauvegardes de compte ne sont pas inclus.
