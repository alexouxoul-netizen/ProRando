# RandoVista GPX 3 m — résultats rétablis

10 novembre 2026. Version de test, sans publication. Ce rapport est le document actif pour le ZIP RESULTATS.

## Régression signalée et correction

L’utilisateur signale la disparition des dénivelés, des notes et des verdicts sur **Orlu, Fontargente et Oô**. Ces trois fichiers comportent des interruptions. Un contrôle ajouté dans la première version 3 m interdisait l’analyse dès qu’une interruption était présente et la présentait à tort comme une insuffisance d’altitude.

Cette condition ne bloque plus les résultats : les portions enregistrées sont analysées et les mesures/avis portent une mention **partielle**. Les raccords manquants ne sont pas inventés. Une absence réellement importante d’altitudes reste distincte de ce problème : le seuil altimétrique de 85 % est conservé. Ce comportement avait déjà été introduit dans le premier correctif ; cette livraison le vérifie explicitement sur les trois cas nommés, inclut des tests de la note et du temps estimé, et porte une identité visuelle et de cache distincte pour éviter de la confondre avec une ancienne version. La cause d’un éventuel ancien affichage chez l’utilisateur (archive installée ou cache) ne peut pas être confirmée depuis les tests locaux.

## Résultats contrôlés

Tests avec le profil de référence Débutant, sans correction personnelle :

| Parcours | Distance des portions disponibles | D+ affiché | D− affiché | Note physique | Verdict |
|---|---:|---:|---:|---:|---|
| Oô | 9,20 km | 465 m (partiel) | 402 m (partiel) | 3/5 | Exigeante — analyse partielle |
| Fontargente | 7,90 km | 468 m (partiel) | 482 m (partiel) | 5/5 | À éviter — analyse partielle |
| Orlu | 14,54 km | 518 m (partiel) | 506 m (partiel) | 3/5 | Exigeante — analyse partielle |

Les notes peuvent différer selon le profil et sa calibration. Les seuils/formules de difficulté n’ont pas été recalibrés ; la fonction calculateDifficulty est identique à celle de la V11.1 d’origine. Ces chiffres partiels ne décrivent pas les portions non enregistrées. La comparaison avec les distances Strava ne constitue pas une validation des distances totales.

Gavarnie et Saint-Félix continuent d’afficher leurs résultats. Gaube reste un cas distinct, avec environ 81 % de couverture altimétrique après détection des zéros suspects : son dénivelé global et son verdict restent indisponibles avec le seuil actuel. Ce ZIP ne prétend pas reconstituer des altitudes absentes.

## Conservation et vérifications

- Simplification géométrique à 3 m inchangée à l’identique depuis le ZIP GPX-3M-TEST.
- Originaux, profils, carnet, calibration personnelle et modules de synchronisation conservés.
- **47 vérifications automatisées** : 17 tests du moteur, 14 de simplification/invariants sur les six références, 6 intégrations carte/comparateur, 1 lecture XML et 9 tests d’affichage/verdict/conseil. Les trois randonnées nommées font l’objet de contrôles explicites du D+, de la note, du temps estimé, du verdict et du comparateur.
- Les scénarios comprennent 99 % d’altitudes avec interruption (analyse disponible), couverture réellement faible et absence totale d’altitude (indisponibilité explicite).
- Syntaxe des fichiers JavaScript, présence des fichiers requis pour le cache et intégrité du ZIP vérifiées.

Les tests d’affichage utilisent les vrais modules JavaScript avec des éléments d’interface simulés. Le comportement d’Oô du correctif précédent a également été observé dans le navigateur local ; aucune nouvelle session iPhone ni synchronisation cloud n’a été vérifiée pour cette livraison.

## Installer la bonne version

Utiliser **RandoVista-V11.1-GPX-3M-RESULTATS.zip**. À l’ouverture, l’en-tête doit indiquer **« GPX 3 m · résultats rétablis »**. Si l’ancien en-tête apparaît après remplacement des fichiers, le premier chargement peut encore provenir du cache précédent : attendre la fin du chargement, fermer complètement l’onglet/l’application puis rouvrir. L’identifiant de cache est différent. Ne pas effacer les données du site ni les profils pour résoudre un problème de cache.

Recharger les GPX originaux d’Oô, Fontargente et Orlu et vérifier la présence des quatre éléments : distance, dénivelé, note et verdict. Aucun changement du site habituel ni publication n’a été effectué par l’assistant. Le ZIP contient les fichiers du site à sa racine.

Pour un essai local après extraction : `python -m http.server 8000`, puis ouvrir http://localhost:8000. Pour reproduire les tests depuis l’archive de validation séparée : `python validation/run.py`. Les anciens rapports inclus dans validation décrivent les étapes antérieures ; le présent rapport les remplace pour cette livraison.
