# Sources Découvrir V11.5

## Catalogue Pyrénées intégré — Camptocamp

657 fiches collaboratives sélectionnées et 190 GPX convertis depuis des géométries existantes. Édition du 12 novembre 2026. Ariège : 197 fiches / 28 GPX ; Haute-Garonne : 49 / 9 ; Hautes-Pyrénées : 411 / 153. Ces nombres sont des fiches, avec variantes possibles ; la présence du point de référence dans le département ne garantit pas que le départ ou tout le parcours s’y trouve.

API : https://api.camptocamp.org/routes
Documentation : https://www.camptocamp.org/articles/838875/en/api-c2c-v6
Licence : https://www.camptocamp.org/articles/106728/fr/licence-des-contenus
Attributions détaillées : LICENCE-CATALOGUE.md et les liens historiques par fiche.

L’API publique est lisible par un serveur mais refuse les origines de sites tiers (HTTP 400 observé avec Origin RandoVista/localhost ; origine Camptocamp autorisée). RandoVista n’appelle donc pas cette API depuis le navigateur : le ZIP contient un catalogue daté et les fichiers réutilisables. Aucun proxy externe, clé privée ni compte tiers. Une mise à jour de ce catalogue demande une nouvelle livraison, pas le bouton Recharger.

Seules les fiches dont l’activité est exclusivement hiking et la licence CC-BY-SA-3.0 sont reprises. Les 657 détails ont été consultés pour vérifier l’activité et la licence et récupérer les distances lorsqu’elles existent. Les coordonnées ont été comparées aux contours des départements (https://github.com/gregoiredavid/france-geojson). Les sorties personnelles, photos et descriptifs intégraux ne sont pas distribués.

Conversion fidèle des LineString/MultiLineString existantes : nombre et ordre des points conservés, segments séparés, altitudes et temps conservés lorsque présents. Refus si moins de 30 ou plus de 80000 points, altitude manquante/invalide, saut de plus de 500 m entre deux points d’un segment ou espacement moyen supérieur à 100 m. Ces seuils évitent certaines mauvaises analyses ; ils ne prouvent ni la complétude ni la praticabilité. Le moteur stable ajoute ses propres alertes et calcule le verdict uniquement sur le GPX.

Sur 290 fiches possédant une géométrie détaillée : 190 exports retenus, 21 trop sommaires/volumineux, 20 sans altitudes valides, 59 trop espacés. 367 autres fiches sans tracé. Aucun score ni trace inventés pour ces fiches.

Distances : annoncées par la source (mètres convertis en kilomètres), parfois absentes ou décrivant un tronçon. Le GPX peut différer. Inclure les distances inconnues laisse ces fiches visibles en dehors de la plage ; décocher applique strictement les limites aux seules distances connues. Les filtres de paysages reposent sur les mots disponibles, sans certification.

## Sources intégrées conservées

Écrins : API Geotrek https://geotrek-admin.ecrins-parcnational.fr/api/v2/trek/ ; 406 fiches pédestres françaises contrôlées. Licence Ouverte : https://www.data.gouv.fr/datasets/randonnees-du-parc-national-des-ecrins . GPX direct, catalogue à charger/actualiser en ligne ; sauvegarde GPX pour conservation.

Pyrénées-Atlantiques : https://data.le64.fr/explore/dataset/itineraires_randonnee_64/information/ ; 370 fiches pédestres hors GR identifiés. Licence Ouverte 2.0 générale, restrictions particulières GR : ces derniers sont exclus. GPX manuel parce que le serveur source ne permet pas la lecture directe depuis le navigateur.

## Autres sources vérifiées

Geotrek Pyrénées Haut-Garonnaises : https://rando.cc-pyreneeshautgaronnaises.fr/ ; API https://admin-ccphg.openig.org/api/v2/ ; 52 fiches françaises pédestres publiées avec GPX lors du contrôle.

Geotrek Hautes-Pyrénées/Gavarnie : https://rando.valleesdegavarnie.com/ ; API https://geotrek65admin.openig.org/api/v2/ ; 329 fiches françaises pédestres publiées avec lien GPX lors du contrôle. Le GPX du lac de Gaube a été téléchargé et contrôlé.

Ces accès techniques ne suffisent pas à établir une licence de reprise des catalogues : ils restent en consultation externe et import manuel. Pour l’Ariège, l’annuaire officiel Geotrek ne mentionnait pas de portail public déployé pour le Département ; cela ne prouve pas l’absence de tout autre portail.

DATAtourisme : l’export public et Explore donnent 7 WalkingTour en 09, 0 en 31 et 65 lors de l’audit ; aucune trace exploitable identifiée dans les sept fiches ariégeoises. L’API complète nécessite une clé non obtenue ici. Pas d’intégration trompeuse de ces fiches comme GPX.

Ariège Pyrénées Tourisme, FFRandonnée09/MaRando, TraceRando, MapiRando, Pyrénées31, Louron, Peyragudes et Lherm : liens dans Autres catalogues. Les licences de reprise n’étant pas établies, pas de copie automatique de leurs contenus. L’utilisateur importe un fichier selon les conditions du fournisseur.

Visorando, Decathlon Outdoor, Cirkwi et Altituderando : aucun accès de réutilisation GPX vérifié permettant leur agrégation ici. Le fait de proposer un téléchargement au public ne suffit pas à autoriser la redistribution d’un catalogue.

## Commune, vie privée et hors connexion

Recherche de commune : https://geo.api.gouv.fr/communes ; seuls le nom saisi et la demande de centre sont transmis. Le catalogue Pyrénées et ses GPX sont livrés dans le cache de l’application ; filtrage et analyse sur l’appareil. Les autres catalogues intégrés utilisent le réseau et leur cache existant. Les GPX sauvegardés dans Mes randos passent par le système de stockage/synchronisation stable, sans modification du schéma de données.
