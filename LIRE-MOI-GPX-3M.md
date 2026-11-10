# RandoVista — essai du calcul altimétrique régulier

10 novembre 2026. **Version de test séparée, sans publication.** La version GPX-3M-RESULTATS validée par l’utilisateur reste disponible et inchangée dans son ZIP d’origine.

## Résultat de ce chantier

La distance et la simplification à 3 m sont conservées à l’identique sur les six références. Les dénivelés utilisent un profil régulier et une accumulation qui respecte les extrémités de chaque portion connue. Les tests d’affichage vérifient que les dénivelés, notes et verdicts d’Oô, Fontargente et Orlu restent disponibles avec la mention partielle. Les règles et coefficients de difficulté ne sont pas recalibrés.

**Ce changement ne rapproche pas artificiellement Gavarnie des 300/300 m de Komoot.** Le résultat intégré reste environ 327/326 m. La correction est démontrée sur des propriétés mathématiques et des parcours synthétiques connus ; l’altitude réelle des six randonnées n’a pas été mesurée indépendamment.

## Défauts identifiés dans le traitement précédent

Le lissage précédent mélangeait les échantillons aux extrémités, ce qui pouvait abaisser une montée monotone dont les altitudes de départ et d’arrivée étaient pourtant connues. L’accumulation par seuil pouvait aussi fermer une portion sur un extremum intermédiaire au lieu de sa dernière altitude, et ne garantissait pas que D+ moins D− corresponde à la différence d’altitude entre les extrémités connues. Les valeurs continuaient à être évaluées sur chaque point dense plutôt que sur un profil spatial régulier.

## Nouveau traitement

1. Les contrôles existants restent en amont : altitudes absentes, zéros suspects, pics isolés, interpolation seulement des petits trous bornés et séparation des interruptions. Aucun trajet ni altitude de longue lacune n’est inventé.
2. Chaque portion continue dont les altitudes sont connues est interpolée sur un pas spatial régulier maximal de **5 m**, ajusté pour inclure exactement les deux extrémités. Les observations d’origine restent conservées. Le nombre de points du fichier ne détermine plus directement le nombre de variations additionnées.
3. Un filtre triangulaire symétrique sur cinq échantillons (support maximal de **20 m**) est appliqué à l’intérieur de la portion. Les deux premiers et deux derniers échantillons ne sont pas filtrés, afin de conserver les altitudes de bord et de ne pas extrapoler.
4. Les retournements inférieurs à **3 m** sont filtrés pour l’accumulation du D+/D−. Le premier et le dernier échantillon connu sont toujours conservés dans les totaux. Les courbes cumulées sont monotones.
5. Un déplacement nul entre les points d’une portion ne devient pas un D+ de marche à cause d’une oscillation verticale stationnaire. Une ascension réellement verticale sans mouvement horizontal identifiable ne peut pas être reconstituée par cette méthode.
6. Les pentes utilisent le profil filtré. Les totaux D+/D− descriptifs affichés dans les panneaux principaux, le comparateur et le conseil proviennent du même moteur. Les règles historiques du verdict conservent leur propre échantillonnage de pente par tranches de 50 m : ses seuils et coefficients ne sont pas modifiés.

La fenêtre et le seuil restent des paramètres expérimentaux généraux. Ils n’ont pas été choisis pour faire coïncider une randonnée avec un chiffre externe. Une petite bosse réelle peut être atténuée par le filtre ; cette limitation doit être évaluée sur davantage de références.

## Avant / après sur les six GPX

Les dénivelés des traces interrompues ne concernent que les portions connues. Gaube reste insuffisant pour une mesure globale avec le contrôle de couverture actuel ; ses chiffres ci-dessous sont uniquement un diagnostic partiel.

| Parcours | Distance conservée | D+/D− précédents | D+/D− nouveaux |
|---|---:|---:|---:|
| Lac d’Oô | 9.195 km | 464.9/401.7 m | 468.0/402.1 m |
| Fontargente | 7.895 km | 468.3/482.1 m | 470.3/482.5 m |
| Gaube | 5.783 km | 70.9/102.8 m | 77.2/120.4 m |
| Vallée d’Orlu | 14.543 km | 518.1/506.5 m | 519.9/506.5 m |
| Saint-Félix | 8.006 km | 177.6/177.4 m | 177.6/177.4 m |
| Gavarnie | 9.863 km | 327.1/325.6 m | 327.2/325.7 m |

### Gavarnie et références externes

Le GPX original brut donne environ 341/340 m. La version précédente donnait 327,06/325,56 m ; le nouveau calcul donne environ 327,25/325,75 m, soit le même affichage arrondi 327/326 m. Komoot, d’après l’utilisateur, donne 300/300 m sur le GPX simplifié à 3 m et 310/300 m sur le GPX original ; Strava donne un D+ de 340 m. Ces traitements externes n’ont pas été reproduits ni vérifiés dans leurs comptes. Aucun de ces chiffres ne constitue à lui seul une vérité terrain. Le nouvel algorithme ne prétend donc pas résoudre l’écart absolu avec Komoot.

### Traces incomplètes

Oô reste partiel car le chemin parcouru pendant l’oubli de reprise d’enregistrement manque. Fontargente et Orlu restent signalés partiels aux interruptions détectées. Le seuil de couverture altimétrique et les résultats rétablis dans la livraison précédente sont conservés. Une altitude réellement absente n’est pas remplacée par zéro.

## Vérifications

**62 vérifications automatisées** : les 47 contrôles précédents, plus 15 contrôles altimétriques. Les anciens tests de parité altimétrique de la simplification s’exécutent explicitement en mode de comparaison historique ; les tests de la méthode nouvelle sont distincts.

Les 15 nouveaux contrôles couvrent une montée et une descente monotones de 100 m exactement connues, le bruit borné sur terrain plat, une colline de 50 m conservée à moins de 1 m après filtrage, l’ajout de points colinéaires, l’inversion du parcours, les interruptions, les longues lacunes altimétriques, les oscillations stationnaires et les six références réelles. Sur celles-ci sont vérifiés : géométrie et distance identiques, même couverture et mêmes contrôles de qualité, D+ moins D− égal à la somme des différences d’altitude des portions connues, courbes cumulées monotones et totaux finaux cohérents.

Les tests des vrais modules d’analyse, de verdict et de conseil avec des éléments d’interface simulés vérifient aussi la présence du D+, de la note et du verdict sur Oô, Orlu et Fontargente. La syntaxe JavaScript, les dépendances du cache et l’intégrité du ZIP sont contrôlées. La fonction calculateDifficulty reste identique à celle de la V11.1 d’origine.

Ce test n’a pas fait l’objet d’une nouvelle vérification complète dans le navigateur/iPhone ni d’un essai de synchronisation cloud. Les originaux, les profils, le carnet et la synchronisation sont conservés. Aucun changement de données utilisateur ni publication n’a été effectué.

## Essai et reproduction

Le ZIP ALTITUDES-TEST contient le site à sa racine. Son en-tête indique **« GPX 3 m · altitudes »** et son cache possède un identifiant distinct. Importer les GPX originaux, pas les variantes déjà simplifiées. Vérifier en priorité que Gavarnie garde environ 9,86 km et 327/326 m et que les trois parcours précédemment bloqués gardent leur note et leur verdict.

La version RESULTATS validée reste disponible pour revenir à la base précédente si l’essai révèle une régression. Ne pas effacer les données du site pour changer de version. Pour un essai local : `python -m http.server 8000`, puis ouvrir http://localhost:8000.

L’archive ALTITUDES-VALIDATION comprend l’application, les six originaux, la base précédente pour comparaison et les tests. Depuis sa racine : `python validation/run.py`. Le présent rapport décrit cette livraison ; les rapports historiques inclus décrivent les étapes antérieures.
