# RandoVista V11.5 TEST — bilan

Le module Découvrir propose une recherche intégrée par zone ou commune, rayon, distance, nom, paysage et présence de GPX. Profil sélectionnable, analyse par le moteur stable, ouverture dans Préparer et sauvegarde dans Mes randos. Les dix catalogues complémentaires et l’import personnel sont conservés.

## Base et préservation

Copie isolée de V11.4.1, dernière version de test validée par l’utilisateur, reposant sur V11.3.1. 21 fichiers critiques sont identiques octet par octet à la base stable : moteur GPX corrigé, calibration/verdicts, bibliothèque intelligente, profils, carnet, stockage et modules cloud. Aucun changement du schéma synchronisé ni migration des données personnelles. L’interface conserve les composants vert forêt existants. Seuls le module Découvrir, ses données, le chargement des scripts, la présentation et la version du cache ont évolué.

## Catalogue livré

| Point de référence | Fiches | Traces passant les contrôles d’import |
|---|---:|---:|
| Ariège | 197 | 28 |
| Haute-Garonne | 49 | 9 |
| Hautes-Pyrénées | 411 | 153 |
| Total | 657 | 190 |

Les 657 fiches sont issues des itinéraires collaboratifs Camptocamp sous CC-BY-SA 3.0, activité exclusivement randonnée. Les attributions et liens historiques sont dans les fiches et GPX. Les GPX sont regroupés en quatre fichiers de données pour simplifier le dépôt manuel sur GitHub et le chargement hors connexion. Aucun GPX personnel des tests n’est livré.

Il s’agit d’une édition du 12 novembre 2026 : l’API Camptocamp refuse les appels provenant d’un site tiers, constat confirmé dans le navigateur. Le catalogue est donc livré avec l’application, sans proxy ni clé supplémentaire. Le bouton Recharger relit cette édition ; il ne récupère pas les dernières modifications Camptocamp.

Les sources intégrées Écrins (406 fiches pédestres lors du contrôle) et Nature64 (370 hors GR identifiés) sont conservées. Les sources Geotrek 31/65 et les sites locaux restent accessibles en consultation/import manuel lorsque les droits de reprise ne sont pas établis. Les audits DATAtourisme n’ont pas fourni de couverture GPX suffisante pour ces départements.

## Vérifications réalisées

- Suites historiques du moteur, altitudes, analyse partielle, relief, difficultés faciles, cohérence des verdicts, contexte d’apprentissage, renommage et bibliothèque intelligente : réussies. Calibration : 7 contrôles, dont balayage de 8723 combinaisons. Cohérence : 96 comparaisons de verdicts.
- Recherche existante : 34 contrôles ; catalogues/import manuel : 33 ; conversion/sécurité Camptocamp : 10 groupes de contrôles.
- Vérification des 657 fiches et 190 GPX : identités, licence, attribution, fichiers présents, coordonnées/altitudes, filtrage et récupération depuis les données distribuées.
- 21 empreintes critiques identiques à V11.3.1 ; 53 ressources nécessaires au cache présentes.
- Navigateur Chrome, écran mobile 390 × 844 : démarrage, recherche réelle de Foix, recherche Auzat, aucun verdict avant GPX, analyse réelle des 200 points du Pic des Calmettes, changement de profil, sauvegarde, ouverture dans Préparer, filtre 8–12 km, absence de débordement horizontal.
- Les quatre fichiers contenant les 190 GPX sont en cache avant déconnexion. Rechargement sans réseau : application, catalogue, récupération d’un autre GPX jamais analysé et randonnée sauvegardée dans Mes randos accessibles. Aucune exception JavaScript non interceptée observée.
- Accès réels aux catalogues Écrins/Nature64 et téléchargement Écrins contrôlés. Les GPX Nature64 restent manuels.

## Limites

Les fiches peuvent être des variantes, des traversées transfrontalières ou des parcours dont le point de référence est un sommet. Les traces communautaires peuvent être dessinées, anciennes ou partielles ; la présence d’un GPX ne certifie pas le terrain. Le verdict et la distance mesurée concernent uniquement le fichier fourni. La cotation technique du producteur est affichée séparément ; les passages techniques et l’exposition exigent de lire la fiche source.

367 fiches ne fournissent aucun tracé ; 100 géométries ont été refusées (21 trop sommaires/volumineuses, 20 sans altitudes valides, 59 trop espacées). Elles restent sans verdict GPX, avec leur motif et leur source. Les distances annoncées ne sont pas toujours connues : l’option correspondante permet de garder ces fiches ou de les exclure des filtres. Les paysages sont des indications textuelles et peuvent être incomplets.

La recherche de commune, les sites sources et les fonds de carte demandent Internet. Les catalogues du 64 et des Écrins demandent une première consultation en ligne ; leurs GPX doivent être sauvegardés pour être conservés. Le catalogue Pyrénées et ses GPX sont disponibles après préparation du cache, sous réserve de l’espace disponible et des règles du navigateur.

Non vérifiés ici : Safari sur un iPhone physique, état des sentiers sur le terrain, et synchronisation réelle avec le compte de l’utilisateur entre deux appareils. Le code cloud et le format de données sont préservés ; ce dernier contrôle figure dans les consignes.

Aucune publication sur GitHub ni modification de compte externe. Voir INSTALLATION-V11.5.txt/LIRE-MOI.txt pour la publication manuelle et le retour arrière.
