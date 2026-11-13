# RandoVista V11.6 RC4 — bibliothèque « À faire / Déjà faites »

Candidate du 13 novembre 2026, basée sur la dernière RC3 publiée, révision GitHub `91d6b54c36c8c829acc51fd0d697b99b4ad24e43`. Les scripts actifs ont été comparés à la copie Work : ils correspondaient. Une sauvegarde de cette révision est fournie séparément. Aucun changement du site en ligne ni publication automatique.

## Utilisation

Dans **Mes randos**, trois boutons séparent désormais les parcours :

- **Toutes** : la bibliothèque entière, y compris les anciens parcours non classés ;
- **À faire** : les randonnées prévues ;
- **Déjà faites** : celles que tu as marquées comme réalisées.

Chaque fiche possède un choix **Mon classement** : « À classer », « À faire » ou « Déjà faite ». Le changement est immédiat et réversible. Pour refaire une randonnée, repasse-la dans À faire ; les retours du carnet restent conservés.

Les nouveaux GPX enregistrés vont dans À faire. Les anciens GPX ne sont pas classés automatiquement : ils restent dans Toutes jusqu’à ton choix. Le classement est **commun aux profils de la bibliothèque**, alors que les avis de difficulté restent calculés pour le profil sélectionné. Le carnet Évaluer reste indépendant ; saisir un bilan ne change pas automatiquement ce classement.

Les compteurs indiquent le nombre total de parcours dans chaque catégorie. Les filtres de nom, distance, dénivelé et difficulté continuent à s’appliquer à l’intérieur de la catégorie choisie. Réinitialiser ces filtres ne change pas la catégorie.

## Conservation et compatibilité

Le classement est une métadonnée facultative du parcours, sans changement du GPX, des profils, des règles Expert, des notes physiques, favoris ou retours. Aucune migration automatique de l’ancienne bibliothèque.

Les exports complets et de bibliothèque conservent le classement. Réenregistrer le même GPX ne remet pas une randonnée déjà faite dans À faire. Importer une ancienne sauvegarde de bibliothèque sans cette information ne supprime pas le classement déjà présent ; une ancienne sauvegarde complète restaure, comme auparavant, l’état exact de son époque.

Le classement emprunte la synchronisation existante. Si deux appareils modifient simultanément le même parcours, le conflit porte sur la fiche et demande un choix explicite. Les clients plus anciens doivent être mis à jour avant de modifier ces données : leurs anciens imports ou écritures pourraient ignorer la nouvelle métadonnée.

## Vérifications

- 21 suites automatisées et 34 contrôles de syntaxe : calculs GPX, avis Expert, apprentissage, bibliothèque et stockage. Tests ciblés : données anciennes, classement réversible, filtre combiné, favori sur une fiche périmée, renommage, réimport, export, identifiants dupliqués et échec d’écriture atomique.
- Navigateur réel : création et déplacement de fiches entre catégories, compteurs, original/favori préservés, sauvegarde complète, réouverture et affichage à 320/390 px.
- Deux contextes navigateur avec vrais modules de stockage/synchronisation et transport cloud simulé : réception des classements, propagation d’une modification et résolution explicite d’un conflit.
- 32 contrôles navigateur de sauvegarde/restauration relancés sur les modules actuels.

Le cloud réel multi-appareils, les autorisations serveur, Safari sur iPhone physique et l’usage prolongé restent à valider. Les autres limites du premier audit restent applicables. Les rapports RC1/RC3 inclus sont historiques ; ce document décrit le changement RC4 et les contrôles répétés.

## Publication manuelle

1. Exporte une sauvegarde complète depuis l’app et vérifie son téléchargement. La sauvegarde du dépôt ne contient pas les données du navigateur ou du compte.
2. Extrais le ZIP **V11.6 RC4 BIBLIOTHÈQUE** et remplace les fichiers du dépôt habituel par tout son contenu. Publie toi-même en conservant l’adresse et la configuration cloud.
3. Ouvre avec une connexion, attends la préparation du cache, ferme toutes les fenêtres RandoVista puis rouvre. Vérifie **V11.6 RC4**. N’efface pas les données du site.
4. Classe d’abord une randonnée dans À faire, passe-la en Déjà faite puis vérifie les deux vues. Mets tous les appareils à jour avant d’utiliser le classement partagé.

La version RC3 reste disponible pour revenir en arrière, mais exporte d’abord les données récentes. Les GPX personnels et fichiers de test sont exclus du ZIP à publier. L’archive de validation est privée.
