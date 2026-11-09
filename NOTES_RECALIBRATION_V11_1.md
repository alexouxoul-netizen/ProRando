# RandoVista V11.1 — Recalibration pilote (TEST)

**Ne pas remplacer la V11 validée sans sauvegarde préalable.**

## Changements
- Ajustement du verdict de base pour donner plus de poids aux portions raides réelles et moins de poids à la simple longueur d’une montée progressive.
- Sensibilité « Débutant » légèrement moins restrictive, sans supprimer les précautions pour « Très débutant ».
- La distance corrigée manuellement est prise en compte pour la charge de distance du verdict ; les repères sur la carte restent liés à la distance géométrique du GPX.
- Aucun changement aux données GPX, au carnet, aux références techniques, à la calibration personnelle, aux profils ou à la synchronisation V11.

## Tests avec profil « Débutant » (niveau 2/5, sans calibration personnelle active)
- Lac d’Oô : **Adaptée** (ressenti réel 2/5).
- Vallée d’Orlu : **Exigeante mais potentiellement faisable** (ressenti réel 3/5).
- Fontargente : **À éviter** (ressenti 5/5 et terrain technique).
- Saint-Félix-de-Lauragais : **Adaptée** hors facteur météo (ressenti 4/5 uniquement lors d’une chaleur intense).
- Lac de Gaube : **Indisponible** car la trace contient trop de données d’altitude manquantes ; la référence réelle est 1/5.

Ces tests visent uniquement à vérifier le comportement de la règle sur les données de référence, et ne démontrent **pas** une capacité de généralisation à toutes les randonnées.

## Limites / points à surveiller
- Les distances GPX brutes diffèrent sensiblement de celles de Strava (Oo : 12,12 vs 9,3 km ; Fontargente : 9,87 vs 8,5 km). Les traces peuvent contenir des anomalies et la méthode Strava n’est pas documentée ici.
- Les pentes de forte résolution restent sensibles aux erreurs altimétriques ; les résultats seront à confirmer avec d’autres GPX.
- La référence Fontargente n’est pas extrapolée automatiquement aux autres tracés techniques.
- La calibration personnelle conserve son ajustement optionnel de +/-1 point.
- Le verdict et la note physique sur cinq sont deux indicateurs distincts : le second n’est pas recalibré ici.

## Validation demandée
Choisir le profil de ta femme, **désactiver provisoirement la calibration personnelle pour comparer la base**, puis importer Oo, Orlu et Fontargente. Vérifier ensuite que le panneau de calibration et la synchronisation V11 conservent leur fonctionnement.
