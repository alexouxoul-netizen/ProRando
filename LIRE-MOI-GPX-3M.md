# RandoVista V11.1 — intégration de la simplification à 3 m

Version de test du 9 novembre 2026. **Aucune publication ni modification du dépôt GitHub.** Ce rapport décrit la version GPX-3M-TEST et remplace, pour cette version, les mesures des essais précédents.

## Changement livré

La distance et la forme du tracé utilisent désormais une simplification adaptative Douglas–Peucker à 3 m. Cette valeur provient d’un essai sur Gavarnie : l’utilisateur a confirmé un parcours « très très fidèle » avec très peu de zigzags ; Komoot affiche 9,89 km, D+ 300 m et D− 300 m pour ce fichier simplifié. Aucun objectif Strava ou Komoot n’est codé dans le moteur. La fidélité visuelle des cinq autres références à 3 m reste à vérifier par l’utilisateur.

La simplification conserve les extrémités de chaque portion continue et les sommets nécessaires pour limiter l’écart aux points enregistrés. Les longues interruptions détectées ne sont ni simplifiées comme un parcours continu, ni reconstituées. La tolérance n’est pas une garantie de précision du GPS ou de longueur réelle du sentier.

## Distance et altitude séparées

Le moteur conserve les observations altimétriques denses après contrôle des données. Leur traitement (lacunes, zéros suspects, pics, lissage sur 20 m et seuil de retournement de 3 m) est effectué sur l’axe de distance enregistré avant simplification. Les D+/D− sont donc exactement conservés par rapport au précédent moteur de test, même si une montée rectiligne n’a besoin que de deux sommets sur la carte. On évite ainsi de perdre une montée ou une descente parce que sa géométrie est droite.

Pour les pentes, graphiques et repères de carte, les observations d’altitude sont ensuite réparties sur les segments simplifiés, proportionnellement à leur progression sur la portion enregistrée correspondante. Le moteur additionne la longueur des seuls segments retenus pour la distance finale. Les points intermédiaires de profil se trouvent sur ces segments ; ils ne recréent pas les zigzags. La représentation reste dense pour conserver les couleurs de pente et les interactions carte/profil. Les fichiers XML originaux utilisés par la bibliothèque, le carnet et les identifiants de parcours ne sont pas remplacés par les données simplifiées.

Les règles et coefficients de difficulté ne sont pas recalibrés. La fonction calculateDifficulty est identique à celle de la V11.1 fournie. Les verdicts peuvent changer parce que la distance et les pentes fournies aux règles changent ; ils restent expérimentaux. La correction manuelle existante reste disponible mais n’a servi à aucune mesure de ce rapport.

## Mesures des six GPX

Les quatre traces marquées incomplètes donnent uniquement une somme de portions connues. Les D+/D− partiels sont conservés dans le JSON de diagnostic mais masqués comme mesures globales dans l’interface.

| Parcours | Points originaux | Sommets à 3 m | Distance brute | Portions connues avant simplification | Après simplification | D+/D− affichés | Statut |
|---|---:|---:|---:|---:|---:|---:|---|
| Lac d’Oô | 9450 | 680 | 12.123 km | 11.609 km | 9.195 km | — | Incomplet |
| Fontargente | 14143 | 356 | 9.870 km | 9.346 km | 7.895 km | — | Incomplet |
| Gaube | 7347 | 166 | 6.558 km | 5.974 km | 5.783 km | — | Incomplet |
| Vallée d’Orlu | 18724 | 675 | 17.945 km | 17.819 km | 14.543 km | — | Incomplet |
| Saint-Félix | 7550 | 126 | 8.537 km | 8.537 km | 8.006 km | 178/177 m | Aucune rupture détectée |
| Gavarnie | 10346 | 455 | 11.669 km | 11.669 km | 9.863 km | 327/326 m | Aucune rupture détectée |

### Gavarnie

Résultat intégré : **9,863 km**, affiché 9,86 km, 455 sommets géométriques, D+ 327 m et D− 326 m. Référence Komoot rapportée pour le 3 m : 9,89 km, 300/300 m. La différence de distance est de 27 m, environ 0,28 %. Les D+/D− RandoVista restent supérieurs d’environ 27/26 m aux chiffres de Komoot. Ils n’ont pas été forcés à 300 m : cette différence altimétrique reste à étudier. Les dénivelés ne sont pas certifiés par cette seule comparaison.

### Oô et les autres traces interrompues

L’utilisateur confirme qu’un raccord droit d’Oô correspond à une marche pendant un oubli de reprise d’enregistrement après la pose d’un pansement. Ce n’est pas nécessairement une position aberrante : le chemin parcouru pendant la pause est absent du fichier. L’exclusion du raccord donne une distance de portions connues, pas une distance réelle totale. Les 9,195 km obtenus ne valident donc pas à eux seuls la référence Strava de 9,3 km. De même, les 7,895 km de Fontargente et les 5,783 km de Gaube ne représentent pas une preuve d’erreur de Strava : ils excluent des raccords et simplifient les portions disponibles.

Gaube conserve en outre des altitudes manquantes/suspectes, avec une couverture d’environ 81 %. L’interface et le comparateur refusent un dénivelé global ou un verdict fiable. Les avertissements d’incomplétude restent actifs pour Oô, Fontargente et Orlu.

## Vérifications effectuées

- **38 vérifications automatisées réussies** : 17 cas du moteur initial, 14 cas de simplification et invariants sur les six références, 6 intégrations carte/comparateur, 1 test des valeurs XML vides.
- Cas de simplification : zigzags sur ligne droite, vrai lacet, boucle fermée, montée/descente sur géométrie droite, lacune d’altitude, frontières de segments, entrée non modifiée et comparaison sans simplification.
- Sur chaque référence : D+/D− et profil altimétrique identiques au moteur précédent, mêmes interruptions et zéros suspects, distances cumulées croissantes, géométrie respectant la tolérance, absence de raccord ajouté entre portions.
- Syntaxe de tous les JavaScript et présence de tous les fichiers requis par le cache hors connexion vérifiées. Cache renommé pour isoler cette version.
- **Les six GPX originaux ont été lus par le vrai navigateur local**, via DOMParser et les modules de l’application, au moyen d’une page de test locale : parcours prêts, distances et altitudes affichées conformes aux calculs ; original XML conservé ; cohérence avec le comparateur. Gavarnie affiche 9,86 km et 327/326 m, Saint-Félix 8,01 km et 178/177 m ; les quatre autres parcours affichent « — » pour les dénivelés globaux.
- Ce test navigateur utilise le point d’entrée normal de chargement d’un parcours après lecture locale du fichier ; le sélecteur de fichiers natif n’a pas été automatisé. Il ne valide pas les gestes tactiles d’un iPhone.

Pas de test réel de connexion/synchronisation cloud, de restauration de sauvegarde utilisateur ou d’usage hors connexion après coupure réseau. Les modules correspondants sont conservés. Le fichier de calibration absent du ZIP V11.1 d’origine avait été restauré à l’identique depuis le ZIP V11 local dans la première version de test ; il est conservé. Aucun accès aux données de production n’a été nécessaire.

## Utilisation du ZIP de test

Le ZIP GPX-3M-TEST contient les fichiers du site à sa racine, avec index.html et .nojekyll. Aucune publication n’a été faite. Utiliser un emplacement de test distinct si un hébergement est décidé plus tard. Pour tester localement après extraction :

```text
python -m http.server 8000
```

Ouvrir http://localhost:8000 et importer **le GPX original de Gavarnie**, pas le fichier déjà simplifié : l’application effectue désormais la simplification elle-même. Vérifier environ 9,86 km, le tracé, les couleurs de pente et les graphiques. Vérifier ensuite les autres originaux et leurs avertissements, puis les fonctions habituelles de carnet, profils et sauvegarde. Aucun écrasement de l’application habituelle n’est nécessaire.

## Reproduire les mesures et tests

L’archive GPX-3M-VALIDATION contient l’application, les six GPX originaux, le ZIP V11.1 d’origine, les scripts et les rapports historiques. Le présent rapport est le rapport actif ; les anciens documents décrivent des étapes précédentes. Après extraction, depuis la racine :

```text
python validation/run.py
```

Le programme reconstruit les observations depuis les GPX, lance les 38 vérifications, recalcule validation/measures-3m.json et contrôle la syntaxe. Aucun paquet externe ni accès réseau n’est requis. Le fichier validation/gpx-engine-before-3m.cjs sert uniquement à la comparaison de non-régression altimétrique ; il n’est jamais chargé par l’application.
