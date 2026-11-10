# RandoVista — calibration personnelle et contexte des retours

10 novembre 2026. Version de test séparée, sans publication. La base COHERENCE-TEST validée reste disponible dans son archive inchangée.

## Confrontation aux ressentis connus

| Randonnée | Ressenti de référence | Note physique actuelle | Lecture du résultat |
|---|---:|---:|---|
| Gavarnie | 2/5 | 2/5 | Cohérent ; passage technique signalé avant le demi-tour. |
| Orlu | 3/5 | 3/5 | Cohérent, mais trace partielle. |
| Fontargente | 5/5 | 5/5 | Cohérent ; référence technique, pas un exemple du seul relief. |
| Oô | 2/5 | 3/5 | Écart d’un point ; le trajet pendant une interruption manque. |
| Saint-Félix | 4/5 avec forte chaleur | 2/5 | La chaleur peut expliquer un effort vécu supérieur au relief ; le ressenti reste 4/5. |
| Gaube | 1/5 | Indisponible | Altitudes trop lacunaires pour une note globale fiable. |

Les cinq premières références historiques hors Gavarnie proviennent du contexte de la conversation ; Gavarnie a été confirmé explicitement par l’utilisateur. Pour Saint-Félix, le contexte historique évoque 1–2/5 hors chaleur : ce n’est pas une mesure indépendante qui permettrait de remplacer le 4/5 réellement vécu.

Ces six références sont trop peu nombreuses et trop affectées par des facteurs techniques, la chaleur ou des données incomplètes pour justifier un changement général des seuils. Les notes et les règles de départ restent donc conservées. Ce chantier corrige les données utilisées pour l’apprentissage personnel, pas les scores de base pour les faire correspondre artificiellement aux six exemples.

## Améliorations livrées

### Chaleur distincte de la difficulté du parcours

Le formulaire du carnet dispose d’une case facultative **« Forte chaleur ayant augmenté l’effort »**. La même case apparaît sur chaque sortie déjà enregistrée pour pouvoir compléter un ancien retour. Ce changement ne modifie ni la note, ni les commentaires, ni les mesures du retour : il ajoute seulement le contexte explicitement choisi. Aucun marquage automatique n’est effectué à partir du nom ou du texte d’une sortie.

Une sortie ainsi marquée reste intégralement dans le carnet, les historiques et les sauvegardes, mais ne vote pas pour augmenter ou diminuer la difficulté physique des autres parcours. Son rôle est expliqué dans l’audit de calibration et dans le bilan de sortie. Le contexte est aussi visible quand ce retour est rappelé dans la fiche ou le comparateur.

### Prévisions partielles séparées du calibrage global

Les nouvelles évaluations enregistrent si leur prévision utilisait un GPX partiel ou des altitudes incomplètes. Ces retours restent affichés, avec leur note et leur verdict disponibles, mais ne calibrent pas automatiquement les autres parcours. Ce contrôle concerne uniquement l’apprentissage : il ne remet pas en place le blocage des résultats d’Oô, Orlu et Fontargente.

Les anciens retours sans cette information ne sont ni réécrits, ni devinés rétroactivement. La présence d’une interruption n’est enregistrée automatiquement que dans les nouveaux retours, en vérifiant que les mesures appartiennent au GPX actif.

### Changement de niveau du profil

Le calcul adaptatif historique utilisait encore d’anciens décalages de niveau, différents de ceux de la fiche et du comparateur maintenant unifiés. Les nouvelles prévisions mémorisent donc les règles effectivement utilisées. Lorsqu’un profil change de niveau, une prévision ainsi identifiée peut être réévaluée avec les bons décalages. Si un ancien retour ne permet pas d’identifier ces règles ou de retrouver son score avant plafonnement à zéro, il reste conservé mais n’est pas réinterprété de façon arbitraire.

Les anciens retours restent utilisables pour la calibration au niveau où ils ont été enregistrés, dès lors que les critères existants sont remplis. Aucun carnet ni profil n’est effacé ou migré automatiquement. L’activation volontaire de la calibration, le minimum de trois GPX distincts, la tendance cohérente à 75 % et la correction maximale de −1/+1 restent inchangés.

Les retours techniques restent des références terrain distinctes, comme auparavant. La difficulté ressentie et le plaisir de refaire une sortie restent deux informations différentes.

## Conservation des résultats validés

Le moteur GPX et le module de règles de verdict sont comparés à l’archive COHERENCE-TEST : ils sont identiques à l’octet près. Les distances à 3 m, les dénivelés, les notes physiques et les verdicts de base ne sont pas recalibrés dans cette livraison. Les modules de profils, stockage et synchronisation sont également conservés. Le carnet accepte toujours les anciennes sauvegardes ; les nouvelles informations sont facultatives.

Les paramètres et les données réels de l’utilisateur n’ont pas été lus ni modifiés. Aucun retour terrain de la conversation n’a été ajouté automatiquement dans son carnet. Les essais de conservation et d’import sont réalisés sur des jeux synthétiques isolés.

## Tests

**179 contrôles automatisés** : les 158 précédents et 21 contrôles supplémentaires du vrai carnet, de l’adaptation et du bilan, exécutés avec une interface et un stockage simulés.

Les nouveaux contrôles vérifient notamment : absence d’écriture ou de perte au chargement d’un ancien carnet ; acceptation des anciens retours ; conservation des nouvelles informations dans une sauvegarde JSON et lors d’un vrai appel au gestionnaire d’import ; rejet d’une sauvegarde invalide sans remplacement des données ; conservation intégrale des anciens champs lors de l’ajout du contexte chaleur ; restauration de l’état si l’écriture échoue ; exclusion de la chaleur, des terrains techniques et des prévisions partielles du vote physique ; conservation du minimum de trois traces ; utilisation des bons décalages pour une prévision identifiée ; absence de réinterprétation arbitraire d’un historique sans règles connues ; séparation de l’effort et du plaisir ; explication correcte dans le bilan.

La syntaxe JavaScript, les dépendances du cache et l’intégrité des archives sont vérifiées. Les tests de cohérence couvrent encore les six GPX et les cinq niveaux avec les ajustements personnels contrôlés. L’audit de base reste cohérent entre fiche et comparateur sur 30 combinaisons.

Cette livraison n’a pas fait l’objet d’un nouveau test complet dans le navigateur/iPhone ni d’une synchronisation cloud réelle. La nouvelle case et son interaction avec le carnet sont testées par les vrais gestionnaires d’événements sur une interface simulée. Le test sur l’appareil habituel reste nécessaire avant d’adopter cette version.

## Essai proposé

Le ZIP CALIBRATION-TEST contient le site à sa racine et porte l’en-tête **« calibration prudente »**. Aucune publication effectuée. La version précédente reste disponible pour retour arrière.

Si Saint-Félix est déjà enregistré dans le carnet : retrouver ce retour, cocher **« Forte chaleur ayant augmenté l’effort »** et vérifier que son ressenti 4/5 est conservé. Dans le bilan ou l’audit de calibration, cette sortie doit être expliquée comme conservée sans vote pour durcir les autres randonnées. Ce choix est facultatif et réversible ; il n’est pas appliqué automatiquement.

Vérifier ensuite qu’Oô, Fontargente et Orlu gardent leurs dénivelés, leurs notes et leurs verdicts partiels, puis que Gavarnie garde ses mesures. Lors d’une nouvelle évaluation, le passage technique de Gavarnie doit être déclaré dans « Terrain rencontré » si l’utilisateur souhaite le conserver dans son carnet ; le GPX ne le déduit pas.

Pour un essai local : extraire le ZIP, lancer `python -m http.server 8000` puis ouvrir http://localhost:8000. Pour rejouer les tests depuis l’archive CALIBRATION-VALIDATION : `python validation/run.py`. Ce rapport est le document actif de la livraison ; les rapports antérieurs sont conservés comme historique.
