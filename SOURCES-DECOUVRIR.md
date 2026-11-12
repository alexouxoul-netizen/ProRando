> V11.4.1 : recherche intégrée conservée. Un annuaire 09/31/65 et un import local sont ajoutés ; voir SOURCES-LOCALES.md.

# Sources de Découvrir — vérification du 12 novembre 2026

## Sources activées

### Parc national des Écrins

- Producteur : Parc national des Écrins. [Jeu officiel et licence](https://www.data.gouv.fr/datasets/randonnees-du-parc-national-des-ecrins), Licence Ouverte 2.0. La licence des logiciels Geotrek ne constitue pas la licence des données.
- API : https://geotrek-admin.ecrins-parcnational.fr/api/v2/trek/ ; champs sélectionnés, pages de 100, filtrage local des fiches publiées en français, pratique « A pied » (4). Le paramètre `practice=4` testé était ignoré : l'application vérifie donc chaque fiche.
- Recherche locale par coordonnées de départ, rayon et distance annoncée. Paysages : thèmes du producteur (point de vue, lac et glacier) et mots du titre/résumé. Un thème « lac et glacier » ne garantit pas la présence d'un lac.
- GPX : URL explicitement fournie dans `gpx`, sans reconstruction de géométrie. HTTP 200 et en-tête CORS autorisant l'origine testée vérifiés sur le catalogue et un téléchargement réel. Les points/altitudes sont ceux du producteur, pas nécessairement un enregistrement de terrain.
- Sans clé lors des vérifications. Aucun quota chiffré ni engagement de disponibilité trouvé : cela ne signifie pas un accès illimité. RandoVista charge au plus 15 pages, séquentiellement, conserve le catalogue local et télécharge un GPX à la fois sur action explicite. Délai de 20 secondes par requête ; limite de 3 Mo par page et 15 Mo par GPX.
- Couverture : massif des Écrins et territoires associés, pas les Pyrénées. Pas de photos récupérées : leurs droits sont distincts.

### Département des Pyrénées-Atlantiques / Nature64

- [Catalogue officiel](https://data.le64.fr/explore/dataset/itineraires_randonnee_64/information/) ; [métadonnées API](https://data.le64.fr/api/explore/v2.1/catalog/datasets/itineraires_randonnee_64).
- Licence indiquée : Licence Ouverte v2.0, **avec restriction explicite des tracés GR à un usage personnel et non commercial**. Les fiches dont le nom, le résumé ou le réseau identifient un GR/GRP sont exclues ; tout réseau codé non vide est également exclu par prudence. Ce contrôle dépend de la qualité du catalogue et ne certifie pas les droits d'un fichier importé par l'utilisateur.
- API Explore v2.1 : catalogue `itineraires_randonnee_64`, sélection de champs sans géométrie, pagination de 100. Seule la pratique pédestre 4 est retenue. Distances du catalogue en kilomètres, coordonnées `longitude;latitude`. Métadonnées annonçant une mise à jour quotidienne.
- Catalogue HTTP 200 avec CORS `*` vérifié. Les URL GPX sont réellement présentes. Un téléchargement GPX testé répond HTTP 200 mais **sans autorisation CORS** : l'application statique GitHub Pages ne peut pas le lire directement. Aucun proxy ni contournement : lien vers le producteur, puis import volontaire du fichier dans Découvrir.
- Sans clé sur les appels testés. Aucun quota propre à ce catalogue vérifié : mêmes bornes côté application que ci-dessus. Les règles du portail restent applicables ; accès non garanti.
- Couverture : département 64, incluant Béarn, Pays basque, Aspe et Ossau. Ne couvre pas Cauterets, Gaube, Oô, Orlu ou Fontargente. Les paysages du catalogue ne sont pas structurés dans les champs utilisés : recherche par mots du titre/résumé, donc incomplète.

## Sources étudiées mais non activées

| Source | Découverte / GPX | Décision et limites |
|---|---|---|
| Geotrek Hautes-Pyrénées / OPenIG | API `https://geotrek65admin.openig.org/api/v2/`, catalogue et GPX publics ; pratique et thèmes disponibles, CORS catalogue testé | Les mentions légales consultées traitent principalement de confidentialité. Pas de licence de réutilisation explicite du catalogue établie. API accessible ne vaut pas autorisation. Désactivée dans cette livraison. [Présentation officielle du Département](https://www.hautespyrenees.fr/actualite/general/decouvrez-les-itineraires-officiels-des-hautes-pyrenees-avec-geotrek/) |
| DATAtourisme | Couverture nationale, itinéraires et coordonnées ; GPX possible parmi les médias, non systématique | [FAQ officielle](https://www.datatourisme.fr/faq/) : Licence Ouverte 2.0, clé demandée avec inscription, 1 000 requêtes/heure, 20–30 requêtes concurrentes et environ 10/s au maximum prolongé. [Documentation API](https://api.datatourisme.fr/v1/docs?lang=fr). Candidat pour extension nationale avec clé et vérification des médias/droits/CORS par producteur. Aucun GPX ni score inféré d'une fiche seule. |
| Geotrek Vosges du Nord | API régionale avec GPX | [API officielle](https://geotrek.parc-vosges-nord.fr/api/v2/) annonce une licence ouverte hors photos. Candidate pour extension, non testée de bout en bout dans cette version, pas de couverture pyrénéenne. |
| OpenStreetMap / Waymarked Trails | Réseau géographique et exports de relations, couverture collaborative nationale | Les données OSM et le service d'export ont des conditions distinctes. Pas de garantie d'ordre, de continuité ou d'altitudes suffisantes pour une analyse. Aucun usage automatique du service Waymarked Trails autorisé/vérifié ici ; non intégré. [Droits OSM](https://www.openstreetmap.org/copyright), [service](https://hiking.waymarkedtrails.org/). |
| IGN Géoplateforme calcul d'itinéraire | Calcul entre points, pas catalogue de randonnées vérifiées avec GPX | [Fiche officielle](https://www.data.gouv.fr/dataservices/api-geoplateforme-calcul-ditineraire), limite annoncée 5 requêtes/s/IP. Ne répond pas au besoin de découverte de traces existantes. Non intégré. |
| Visorando, Wikiloc, AllTrails, Komoot | Sites de découverte et téléchargements selon compte/offre | Pas d'API de découverte + téléchargement GPX avec conditions de réutilisation vérifiées pour RandoVista dans cette étude. Aucun scraping, aucune connexion ni téléchargement automatisé. |

## Garanties et limites de cette livraison

Attribution, lien vers la fiche, lien de licence et date de consultation affichés sur chaque résultat. Aucun parcours démonstratif présenté comme réel. Aucun score issu des difficultés commerciales du catalogue. Une difficulté GPX et un verdict personnalisé apparaissent seulement après passage du fichier réel dans le moteur stable ; les altitudes insuffisantes restent inconnues.

La recherche vise les départs autour des coordonnées saisies, pas les traces traversant toute une zone. Pas de géocodage libre : zones prédéfinies, coordonnées ou géolocalisation volontaire. Le catalogue consulté est conservé dans une base locale distincte ; il peut vieillir. « Actualiser la source » recharge les données en ligne. Les GPX analysés ne sont conservés qu'en mémoire (20 maximum) jusqu'à leur sauvegarde explicite dans Mes randos. Les GPX sauvegardés utilisent la bibliothèque, les sauvegardes et la synchronisation V11 existantes ; le cache de découverte ne se synchronise pas.

Un import manuel n'établit pas l'identité entre fichier et fiche : l'interface le signale. Les sources externes peuvent changer, fermer une randonnée ou retirer un fichier. Vérifier les consignes sur leur site avant le départ. L'avis du moteur est physique et indicatif ; météo, neige, exposition et technicité ne sont pas prouvées par le GPX.
