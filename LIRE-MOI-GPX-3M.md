# RandoVista V11.1 — sauvegardes et restauration renforcées

10 novembre 2026. **Version de test séparée, sans publication.** Base : archive CALIBRATION-TEST validée par l’utilisateur. La version utilisée par l’utilisateur et ses données réelles n’ont pas été remplacées pendant ce chantier.

## Nouveautés visibles

Dans « Mon compte et mes sauvegardes », la date et le nom du **dernier export préparé** sont visibles. Le nom du fichier contient la date et l’heure. La date indique la préparation et le lancement du téléchargement ; elle ne prouve pas que le navigateur ou l’utilisateur a effectivement enregistré le fichier sur disque. Le message invite donc à vérifier sa présence dans les téléchargements. Pour les anciens exports réalisés avant cette fonction, aucune date n’est inventée.

La dernière restauration et son éventuelle attente de confirmation avant synchronisation sont également affichées. Le bouton **« Exporter la copie de secours précédente »** permet de récupérer l’état conservé avant la dernière fusion ou restauration. Cette copie de secours est locale au navigateur ; elle ne remplace pas un fichier exporté.

## Contrôles avant restauration

Une sauvegarde complète est vérifiée avant toute modification : format V11, présence des clés attendues, profils et **validité du profil sélectionné**, carnet, réglages de calibration, identifiants uniques et structure des GPX enregistrés. Un fichier pouvait auparavant passer les contrôles avec un profil sélectionné absent du fichier ; ce cas est désormais refusé.

La demande de confirmation présente la date du fichier et le nombre de profils, GPX, retours et favoris qu’il contient. Les données actuelles sont conservées dans une copie de secours avant remplacement. L’annulation et les fichiers invalides ne remplacent aucune donnée. Les sauvegardes complètes V11 historiques et les anciens retours du carnet sans les nouveaux champs restent acceptés. Les valeurs nulles des anciennes sauvegardes initiales sont reconnues comme absence de données, sans fabriquer de contenu historique.

Les GPX sont conservés comme chaînes XML d’origine ; le contrôle de sauvegarde ne certifie ni la précision GPS ni la validité sportive d’une trace. La sélection du profil, les favoris, les retours d’anciens profils archivés, la chaleur, la qualité de prévision mémorisée et les versions de règles des nouveaux retours sont préservés. Les clés et formats existants ne sont pas renommés.

## Écriture et récupération

La copie durable de l’état courant est enregistrée avant les écritures. Si l’écriture d’un GPX ou des métadonnées échoue, les données précédentes sont rétablies. Si ce rétablissement échoue lui-même, l’application reste bloquée plutôt que de poursuivre dans un état partiel ; le journal de récupération reste disponible pour reprendre la récupération à l’initialisation suivante.

Le rechargement des réglages de calibration après une restauration déclenche désormais une mise à jour des écrans concernés : un verdict ne doit pas conserver les anciens réglages jusqu’au prochain changement de profil.

Un ressenti non enregistré n’est pas inclus silencieusement dans un export présenté comme complet : l’utilisateur est invité à l’enregistrer d’abord. La restauration est aussi interdite pendant un brouillon. Les saisies commencées pendant la lecture du fichier ou la préparation de l’export sont contrôlées. L’interface est temporairement désactivée pendant la restauration, puis rétablie ou conservée bloquée si une récupération est nécessaire.

## Séparation de la restauration et du compte partagé

Une restauration remplace d’abord les données **sur cet appareil**. Elle laisse une indication persistante de reprise à confirmer : aucune synchronisation automatique du jeu restauré n’est lancée avant un clic explicite sur **Synchroniser**, suivi de sa confirmation. Cette indication reste mémorisée entre les ouvertures de l’application. Une annulation conserve la pause.

Après confirmation, les vérifications et la résolution de conflits existantes reprennent normalement. Les identifiants de connexion ne sont pas inclus dans la sauvegarde et ne sont pas remplacés lors de sa restauration. Aucun compte partagé réel n’a été utilisé pour les tests ; les appels de service étaient simulés.

## Vérifications réalisées

**32 scénarios exécutés dans le vrai navigateur avec IndexedDB natif**, plus les **179 contrôles de non-régression existants** exécutés sur les sources de cette livraison.

Les tests du navigateur utilisent des profils et retours fictifs, deux GPX originaux fournis (Gavarnie et Beille), et un compte de service simulé sans requête distante réelle. Un préfixe propre à chaque exécution isole toutes les clés de stockage et les bases de test, même si la page est ouverte sur une origine déjà utilisée. Les espaces de ce jeu de tests sont nettoyés en fin de réussite. Les données de l’application habituelle ne sont ni lues ni remplacées.

Les scénarios couvrent :

- Aller-retour complet de profils, sélection active, GPX XML, favoris, métadonnées, carnet, retours archivés et réglages ; rechargement des modules réels après restauration.
- Refus d’un profil sélectionné inexistant, de réglages invalides et d’identifiants GPX dupliqués ; acceptation d’anciennes sauvegardes compatibles.
- Détection de modifications locales pendant une lecture ou avant une écriture ; absence de remplacement silencieux.
- Échecs simulés d’écriture dans les vrais magasins IndexedDB, annulation de transaction, rétablissement des données, échec du rétablissement puis récupération à la réinitialisation du module.
- Export et restauration par les vrais gestionnaires de l’application ; persistance et relecture de la date ; annulation, JSON invalide, brouillons existants ou commencés pendant l’opération.
- Conservation de la copie précédente ; absence d’appel de compte partagé avant reprise ; annulation et confirmation de cette reprise.

Le téléchargement de fichier a été intercepté par le banc de test pour examiner le contenu préparé sans écrire dans les téléchargements de l’utilisateur. Ce contrôle prouve la préparation du fichier et son contenu, pas son enregistrement par un navigateur sur iPhone. Le redémarrage de récupération est vérifié en réinitialisant le vrai module sur les bases persistantes, sans simuler une panne matérielle complète du navigateur.

La syntaxe JavaScript, les dépendances du cache et l’intégrité des ZIP ont été vérifiées. Les modules de calcul GPX, de règles de verdict, de fiches et comparateur, ainsi que les profils, le carnet, la bibliothèque et la configuration de connexion sont comparés à l’archive CALIBRATION-TEST : ils restent identiques à l’octet près. Le module adaptatif ne change que le rafraîchissement après restauration, pas ses règles d’apprentissage.

**Limites :** pas de test sur iPhone ni de synchronisation réelle entre deux appareils, pas de garantie d’écriture physique du fichier téléchargé, et pas de simulation exhaustive de toutes les pannes possibles. La version validée précédente reste disponible pour retour arrière.

## Premier essai recommandé

1. Ouvrir cette version de test et vérifier l’en-tête **« sauvegardes vérifiées »**.
2. Aller dans **Mon compte et mes sauvegardes → Sauvegardes complètes → Exporter toutes mes données**.
3. Vérifier que la date apparaît et que le fichier `.json` est présent dans les téléchargements. Conserver aussi les anciens exports.

Il n’est pas nécessaire de restaurer les données réelles pour ce premier essai. Les restaurations ont été vérifiées dans l’environnement isolé. Aucune publication n’a été effectuée par l’assistant.

## Reproduction

Le ZIP SAUVEGARDES-TEST contient les fichiers du site à sa racine, prêts pour un emplacement de test GitHub Pages. Le ZIP SAUVEGARDES-VALIDATION ajoute les sources des tests et les GPX de référence.

Pour les 179 contrôles sans navigateur, depuis la racine de l’archive de validation :

```text
python validation/run.py
```

Pour les 32 scénarios IndexedDB et de restauration, lancer depuis la même racine :

```text
python -m http.server 8772
```

Puis ouvrir http://localhost:8772/validation/browser-tests/ et attendre **« 32 tests réussis »**. Ces tests s’exécutent automatiquement avec leur propre espace de stockage isolé et nettoyé ; ils ne demandent aucune connexion au compte partagé. Ils ne remplacent pas un essai d’export sur le téléphone habituel.

Ce rapport décrit la livraison active. Les autres rapports du dossier validation sont conservés comme historique.
