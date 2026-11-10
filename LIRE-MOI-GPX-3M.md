# RandoVista — cohérence des verdicts de la fiche et du comparateur

10 novembre 2026. Version de test séparée, sans publication. Ce rapport décrit la livraison COHERENCE-TEST.

## Problème trouvé

La fiche et le comparateur utilisaient deux générations de règles : seuils différents pour la distance, le dénivelé, les pentes, les montées continues et la descente, ainsi que des décalages différents selon le niveau du profil. La distance, le D+/D− et les notes physiques pouvaient être les mêmes, mais le verdict diverger.

Sur six GPX et cinq niveaux de profil, le contrôle initial trouvait **14 différences de score sur 30 combinaisons**, dont **quatre avis différents** :

| Parcours / profil | Avis du comparateur avant | Avis de la fiche conservé |
|---|---|---|
| Oô — Très débutant | À éviter | Exigeante |
| Orlu — Débutant | À éviter | Exigeante |
| Orlu — Aguerri | Exigeante | A priori adaptée |
| Gavarnie — Très débutant | À éviter | Exigeante |

Ces écarts viennent d’une duplication des règles, pas d’un nouveau traitement GPX ni du ressenti de l’utilisateur.

## Correction

Les règles actuelles de la fiche validée sont regroupées dans **verdict-rules.js**, utilisé par la fiche et par le comparateur. Leurs seuils, décalages de profil et limites de catégorie sont conservés. Le comparateur abandonne ses anciens seuils pour employer ceux de la fiche. **Les 30 résultats de la fiche, scores compris, restent identiques au contrôle initial** ; le comparateur les rejoint.

Les ajustements de calibration personnelle restent plafonnés à −1/+1 comme auparavant. Les modules de profils, carnet, calibration et synchronisation sont conservés à l’identique. Un retour terrain technique « à éviter » pour le même GPX reste prioritaire lorsque l’analyse physique est calculable. Un ancien retour « à éviter » sans technicité reste affiché dans le carnet et dans les avertissements ; il ne force plus, dans le seul comparateur, un verdict physique différent de celui de la fiche. En l’absence d’altitudes suffisantes, le comparateur n’invente plus un verdict physique à partir d’une référence technique : la référence reste signalée séparément.

La note physique sur 5 et le verdict personnel répondent toujours à deux questions différentes. La note décrit la charge physique du tracé ; le verdict la met en relation avec le profil et ses retours. Cette correction ne cherche pas à faire correspondre artificiellement la note au ressenti de chaque sortie.

## Mesures et fonctions conservées

Le moteur GPX, la simplification à 3 m, les distances, le D+/D− révisé et les contrôles de qualité sont **identiques à la version ALTITUDES-TEST acceptée**. Les résultats d’Oô, Fontargente et Orlu restent disponibles et marqués partiels. Gaube reste le cas d’altitudes trop lacunaires déjà connu. Aucun profil, carnet ou réglage personnel de l’utilisateur n’a été modifié.

Les comparaisons portent sur les mêmes GPX et les mêmes mesures, sans correction manuelle de distance. Une distance saisie manuellement dans la fiche reste propre à la préparation en cours et ne modifie pas les fichiers GPX enregistrés ; cette fonction existante n’a pas été transformée. Le calcul adaptatif des anciens retours entre différents niveaux de profil n’a pas été recalibré ni migré dans ce chantier.

## Référence terrain Gavarnie

L’utilisateur précise **2/5 d’effort ressenti par sa femme**, avec un **passage technique avant le demi-tour au pied du cirque et de la cascade**. Ce retour est consigné comme donnée de validation, séparément du GPX, sans ajout automatique au carnet de l’application. La note physique actuelle de Gavarnie reste 2/5. Son verdict pour un profil Débutant reste « Exigeante », identique à la fiche avant cette correction. Cet écart entre effort ressenti et verdict reste un sujet de calibration ultérieure ; il n’est pas masqué par cette correction de cohérence. Le GPX ne suffit pas à identifier le passage technique décrit.

## Vérifications

**158 contrôles automatisés** : les 62 précédents, plus 96 comparaisons de verdicts. Ces 96 cas couvrent six GPX, cinq profils et trois ajustements personnels (−1/0/+1), puis des cas de référence technique, de retour historique non technique, de simulation temporaire, d’altitudes insuffisantes et de plafonnement des ajustements.

Les tests comparent les vrais modules de fiche et de comparaison avec une interface simulée. Ils vérifient l’égalité des avis, des scores de base et des notes physiques, et la conservation des résultats de la fiche validée. Le moteur GPX et les modules de données utilisateur sont comparés octet par octet à l’archive ALTITUDES-TEST. La syntaxe JavaScript, la présence des dépendances et l’intégrité des archives sont contrôlées.

Il n’y a pas eu de nouvelle vérification complète sur iPhone ou dans le navigateur pour cette livraison, ni de test réel de synchronisation cloud. Les tests utilisent des retours de calibration contrôlés et ne copient pas le carnet réel de l’utilisateur.

## Essai

Le ZIP **RandoVista-V11.1-COHERENCE-TEST.zip** contient le site à sa racine et reste prêt pour un emplacement de test GitHub Pages. Son en-tête indique **« verdicts cohérents »** et son cache possède un identifiant distinct. Aucune publication n’a été effectuée. La version ALTITUDES-TEST validée reste disponible pour revenir à la base précédente.

Charger un GPX original, choisir un profil puis sélectionner le même GPX dans le comparateur : à mesures et profil égaux, l’avis doit être cohérent. Vérifier en particulier Orlu pour le profil Débutant. Les distances et dénivelés doivent rester ceux de la version validée. Ne pas effacer les données du site en cas d’ancienne version en cache ; fermer complètement puis rouvrir après chargement.

Pour un essai local après extraction : `python -m http.server 8000`, puis ouvrir http://localhost:8000. L’archive COHERENCE-VALIDATION contient les six originaux, l’audit avant/après, la référence Gavarnie et les tests. Reproduction depuis sa racine : `python validation/run.py`. Ce rapport est le document actif de cette livraison ; les rapports antérieurs sont conservés comme historique.
