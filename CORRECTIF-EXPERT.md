# RandoVista V11.5.4 RC2 — correction Expert

13 novembre 2026. Basée sur la candidate V11.5.3 RC1 ; aucune publication effectuée. Cette RC2 remplace la RC1 pour les prochains essais. Le ZIP RC1 et les sauvegardes précédentes restent disponibles.

## Cause reproduite

Le fichier fourni `visorando-la-cascade-d-ars.gpx` contient 181 observations. Le moteur calcule environ **10,52 km et +900 m**, avec une note physique **5/5**. Ces valeurs calculées ne sont pas une certification du parcours réel.

Le score intrinsèque du verdict est 11. La jauge temporaire fonctionnait : le score Expert descendait à 7, mais 7 est aussi la première valeur de la catégorie « À éviter ». Le problème signalé était donc une limite du réglage Expert, pas une jauge déconnectée. Plusieurs indicateurs de pente peuvent se cumuler dans ce score pilote.

## Ajustement ciblé

La réduction Expert passe de 4 à 5 points. Les quatre autres niveaux, mesures GPX, note physique et seuils généraux restent identiques. Cette modification s’applique à tous les GPX, sans reconnaissance du nom « Cascade d’Ars » et sans cas spécial codé pour ce parcours.

| Niveau simulé sur ce fichier | Ancien score/verdict | Nouveau score/verdict |
|---|---|---|
| Très débutant | 14 · À éviter | Identique |
| Débutant | 12 · À éviter | Identique |
| Bon marcheur | 11 · À éviter | Identique |
| Aguerri | 9 · À éviter | Identique |
| Expert | 7 · À éviter | **6 · Exigeante, mais potentiellement faisable** |

Un score intrinsèque de 12 ou plus reste « À éviter » même en Expert. Ce correctif est un **ajustement pilote d’un point**, motivé par le cas reproduit ; sa pertinence pour tous les profils Experts reste à confirmer sur le terrain. Il ne valide pas le terrain ni les conditions de la sortie. La note physique 5/5 reste séparée du verdict personnalisé.

La version des règles est maintenant `v1154-expert-pilot`. Les anciennes prévisions `v111-pilot` sont interprétées avec leurs anciens coefficients dans l’apprentissage, sans réécrire le carnet. En simulation temporaire, la calibration et les références personnelles restent en pause ; un vrai profil Expert avec ses retours personnels peut donc avoir un avis différent.

## Vérifications réalisées

- 19 suites automatisées et 34 contrôles de syntaxe : aucune erreur. Ils couvrent les moteurs existants, bibliothèque, sauvegardes unitaires, catalogues, verdicts et apprentissage.
- Fichier exact fourni : calcul carte/comparateur identique aux cinq niveaux, mesures conservées, seul le verdict Expert change.
- Balayage de 155 combinaisons score/niveau : quatre premiers niveaux identiques ; catégories Expert modifiées uniquement aux anciennes frontières des scores intrinsèques 7 et 11 ; avertissements conservés pour les scores supérieurs.
- Deux tests supplémentaires de compatibilité de l’apprentissage avec l’ancienne version Expert, sans mutation des données historiques.
- Navigateur réel : import par le contrôleur de l’application dans une page de test locale (le sélecteur de fichier de l’outil n’a pas répondu), événements réels de la jauge temporaire aux cinq niveaux, verdict orange en Expert, stockage du profil inchangé, désactivation de la simulation rétablissant le niveau enregistré. Capture fournie.

Les essais navigateur complets de sauvegarde, cloud simulé, mise à jour et responsive du premier audit restent des résultats **RC1**, non tous répétés sur RC2. Le code de stockage et de synchronisation est inchangé. Safari/iPhone physique, synchronisation réelle et politiques serveur restent à valider comme précédemment. Aucun test prolongé de terrain effectué.

## Installer manuellement

1. Exporte une sauvegarde complète depuis RandoVista et vérifie son téléchargement.
2. Extrais le ZIP **V11.5.4 RC2 EXPERT** et remplace les fichiers du dépôt habituel par tout son contenu. Publie toi-même, sans changer d’adresse ni de configuration cloud.
3. Ouvre l’app avec une connexion, attends la préparation, puis ferme toutes ses fenêtres et rouvre. Vérifie **V11.5.4 RC2**. N’efface pas les données du site.
4. Recharge ce GPX, coche « Tester temporairement un autre niveau », place la jauge sur Expert : le verdict attendu est orange. Décoche ensuite pour retrouver ton niveau enregistré.

Le GPX fourni n’est pas inclus dans le ZIP publiable. Les preuves et tests privés sont fournis séparément. Le rapport initial RC1 est conservé comme historique dans l’archive ; le présent document précise les changements et limites de RC2.
