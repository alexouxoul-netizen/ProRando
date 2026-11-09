# Correctif GPX 3 m — analyse partielle sans blocage abusif

Correctif du 10 novembre 2026. Aucune publication.

## Problème corrigé

Le seuil de couverture altimétrique était déjà de 85 %. Le blocage d’Oô avec un message évoquant 99 % d’altitudes exploitables venait d’une condition supplémentaire : toute interruption de trace interdisait l’analyse. Le verdict et le conseil traduisaient ensuite ce blocage par « altitudes insuffisantes », ce qui était trompeur.

## Comportement

- Une couverture suffisante permet désormais de calculer et d’afficher les dénivelés et le verdict sur les portions enregistrées, même avec une interruption.
- Les D+/D− portent alors la mention **« partiel »**, et le verdict **« analyse partielle »**. La qualité, le conseil et le comparateur avertissent que le parcours complet peut être plus exigeant que les portions disponibles.
- Le message « altitudes insuffisantes » est réservé aux données altimétriques trop lacunaires. Le seuil de 85 % reste inchangé.
- Le conseiller utilise également les contrôles de continuité du moteur pour éviter de calculer une pente à travers un trou.
- Les interruptions ne sont pas comblées ; la simplification à 3 m et les formules de difficulté sont conservées. Les originaux, profils, carnet et modules de synchronisation restent conservés.

## Vérification dans le navigateur

Avec le GPX original d’Oô : **9,20 km, D+ 465 m (partiel), D− 402 m (partiel)**. Un verdict est désormais affiché, avec la mention « analyse partielle », et le conseil ne prétend plus que les altitudes sont insuffisantes. Ces chiffres ne décrivent pas le trajet non enregistré lors de l’oubli de reprise signalé par l’utilisateur.

Avec Gaube : les altitudes restent réellement insuffisantes (environ 81 % de couverture) ; le dénivelé et le verdict restent indisponibles.

## Tests

**46 vérifications automatisées** : les 38 précédentes, plus huit vérifications du verdict, du conseiller et du comparateur sur les six références et deux scénarios synthétiques. Ces derniers vérifient qu’une trace interrompue avec environ 99 % d’altitude reste analysable, et qu’une couverture réellement insuffisante reste signalée. La syntaxe JavaScript et la présence des fichiers du cache ont également été contrôlées. Le cache possède un nouvel identifiant pour ce correctif.

Oô et Gaube ont aussi été chargés dans le vrai navigateur local avec leurs GPX originaux ; les résultats ci-dessus ont été observés. Les interactions iPhone, la synchronisation cloud et le sélecteur natif de fichiers n’ont pas été retestés.

## Essai

Utiliser le ZIP **GPX-3M-CORRECTIF**, puis recharger le GPX original d’Oô. La nouvelle version porte « GPX 3 m · correctif » dans l’en-tête. Le blocage doit avoir disparu et les mentions d’analyse partielle doivent être visibles. Les règles de difficulté n’ont pas été recalibrées.

Le ZIP est prêt pour un emplacement de test GitHub Pages, mais aucune publication n’a été effectuée. Les fichiers de l’application sont à la racine. En local, après extraction : `python -m http.server 8000`, puis ouvrir http://localhost:8000.

L’archive de validation séparée comprend les six originaux, les tests et les rapports historiques. Pour rejouer les 46 vérifications depuis sa racine : `python validation/run.py`. Le présent rapport décrit le comportement actif et remplace les indications antérieures qui annonçaient un blocage systématique des traces interrompues.
