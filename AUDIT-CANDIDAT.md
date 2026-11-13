# RandoVista V11.5.3 RC1 — audit des 12–13 novembre 2026

**Conclusion : candidate consolidée pour essai prolongé. Pas de certification « tout fonctionne ».** Aucun déploiement, aucune modification du dépôt ou du compte réel. Base : GitHub `alexouxoul-netizen/ProRando`, révision `9600a7e6b43f142d61c029a0e15f15140e1507ee` (V11.5.2), comparée à la dernière copie Work. Tous les fichiers actifs correspondaient, hors fins de ligne. Deux sauvegardes sont livrées : projet Work et révision GitHub. Elles ne remplacent pas l’export des données personnelles depuis l’application.

## Corrections et consolidation

- Échec de stockage d’un profil : retour au dernier état enregistré et alerte explicite ; le niveau affiché ne prétend plus être sauvegardé.
- Échec de sauvegarde automatique d’un GPX : avertissement visible ; un favori dont l’écriture échoue ne change plus seulement en mémoire.
- Entrées GPX : limite de 15 Mo avant lecture du fichier et contrôle homogène dans Préparer/comparateur ; rejet des déclarations DTD/entités et contenus non GPX avant modification de la carte.
- Cache : installation par fichiers rechargés, séparation par chemin GitHub Pages, attente de fermeture de l’ancienne application avant activation ; vérification/récupération des seuls fichiers manquants. Les nouveaux caches ne suppriment plus ceux d’un autre chemin Pages.
- Interface Nature Premium conservée : vert/crème, fonctions avancées déjà repliées, version candidate explicite, onglet actif annoncé aux aides techniques, focus clavier visible, prise en compte de la réduction des animations, absence d’envoi du référent aux sites externes.
- Livraison épurée : modules chargés et catalogues conservés ; anciens scripts/doublons non chargés du dépôt, rapports de versions précédentes et GPX personnels de validation exclus du ZIP à publier. Ils restent dans les sauvegardes/validation privées.

Aucun changement des seuils GPX, verdicts, calibration, catalogue de 657 fiches/190 traces, noms de bases ou format des sauvegardes. Aucune migration ni effacement de données.

17 suites automatisées et 34 contrôles de syntaxe réussis dans la dernière exécution ; 32 contrôles navigateur de sauvegardes, 18 résultats de parcours/synchronisation/hors connexion (dont une mesure de durée), 3 étapes de mise à jour et 16 vérifications responsive. Les transports cloud des essais à deux appareils sont simulés. Les tests unitaires finaux couvrent aussi le dernier correctif de favori.

## Résultats et limites par domaine

| Domaine | Résultat vérifié | Limite / suite requise |
|---|---|---|
| Architecture | Application statique, dépendances locales, démarrage ordonné, moteur GPX partagé et fusion à trois versions. Syntaxe de tous les scripts contrôlée. | Nombreux modules historiques et CSS cumulée ; refonte volontairement évitée. Certains recalculs restent synchrones. |
| GPX | 6 traces de référence, distances synthétiques, pentes, montées/descentes connues, bruit, pics, trous, segments, inversion et invariance à la densité. Cohérence carte/comparateur/verdict. | Pas de vérité terrain indépendante complète pour le D+/D− des six traces ; des références interrompues sous-estiment le parcours complet. |
| Verdict/apprentissage | 96 comparaisons de verdict, balayage de 8 723 combinaisons, 21 contrôles du contexte : chaleur, ancien carnet, plusieurs niveaux, simulation, données partielles, au moins 3 sorties distinctes. | Validité prédictive sur plusieurs semaines/mois non établie. Les anciennes sorties ne deviennent pas artificiellement des mesures terrain fiables. |
| Découvrir | 657 fiches et 190 GPX empaquetés vérifiés ; filtres et récupération locale. API Écrins : 406 fiches, GPX récupéré. Nature64 : 370 fiches admissibles, import manuel conservé. Navigateur : recherche Écrins, GPX L’Onde et Le Villard, analyse, sauvegarde et ouverture dans Préparer. | Services distants, CORS et catalogues peuvent évoluer. Nature64 n’offre pas de récupération directe dans l’app. Les tracés communautaires peuvent être partiels/dessinés. |
| Import/export/stockage | 32 contrôles navigateur réels : IndexedDB, round-trip, champs historiques, favoris, sauvegarde de secours, refus des fichiers invalides, rollback, reprise après interruption, exports sans session de connexion et brouillons protégés. | Quota/éviction Safari, coupure brutale réelle du téléphone et très grosse bibliothèque non éprouvés pendant des mois. Les exports JSON ne sont pas chiffrés. |
| Sync/conflits | Deux contextes navigateur isolés avec vrais modules et transport cloud simulé : fusion indépendante, conflit explicite, résolution, panne, concurrence de révision, restauration suspendue, reprise sans doublon. | Pas de connexion réelle à deux appareils ou deux comptes. Fonction SQL `rv_sync_commit`, politiques RLS, propriété des fonctions et sauvegardes serveur non accessibles à l’audit. |
| Hors connexion/cache | Réouverture avec serveur local arrêté, conservation profils/GPX/carnet, analyse réutilisable et reprise. Mise à jour V11.5.2 → RC1 réellement testée : worker en attente, ancienne interface conservée, nouvelle version après fermeture, profil préservé. | Cartes non téléchargées ; Geotrek direct non disponible sans réseau. Les anciens caches non scindés par chemin sont conservés par prudence ; quelques Mo supplémentaires peuvent rester. |
| Sécurité/confidentialité | Configuration contenant uniquement une clé publique ; pas de secret/service-role identifié dans les fichiers actifs. Lecture anonyme `rv_spaces?select=revision&limit=1` refusée HTTP 401. Noms et textes échappés/affichés comme texte aux points inspectés. | Ce refus ne prouve pas l’isolation entre comptes connectés ni toutes les autorisations serveur. Sessions persistées sur l’appareil, données non chiffrées de bout en bout ; déconnexion locale conserve les randonnées. Pas de test d’intrusion exhaustif. |
| Dépendances/licences | Chart.js 4.4.8 (MIT), Leaflet 1.9.4 (BSD-2-Clause), Supabase JS 2.119.0 (MIT) ; notices conservées. OSV interrogé sur ces 3 versions : aucune alerte directe renvoyée. Attributions Camptocamp/Geotrek et restrictions Nature64 conservées. | Pas de manifest/lockfile d’origine ni provenance complète des bundles ; npm absent, audit transitif complet non réalisé. Pas de mise à jour massive non motivée. Revoir les conditions des producteurs avant diffusion plus large. |
| UI/accessibilité/mobile | Quatre onglets conservés ; contrôles DOM, focus et navigation active ajoutés ; validation navigateur et captures de l’interface. | Pas de certification WCAG, VoiceOver ou test Safari/iPhone physique. Cadres navigateur de 320, 390, 768 et 1280 px : 16 contrôles sans débordement horizontal. Ce sont des cadres de largeur contrôlée, pas des iPhone physiques. |
| GitHub Pages | Chemins relatifs, manifeste, `.nojekyll`, scripts et assets du cache présents ; application exécutée sous un sous-chemin local, installation et mise à jour vérifiées. | Publication volontairement non effectuée ; vérification finale sur le domaine et l’iPhone habituels à faire. |

## Mesures de référence

Valeurs calculées, **pas des totaux garantis du parcours complet**. La couverture et les interruptions sont conservées et signalées par l’application.

| Trace | Distance calculée | D+ / D− calculés | Interprétation |
|---|---:|---:|---|
| Gavarnie | 9,86 km | 327 / 326 m | Référence distance annoncée 10 km ; écart −1,4 %. |
| Saint-Félix | 8,01 km | 178 / 177 m | Pas de vérité terrain indépendante du total. |
| Oô | 9,20 km | 468 / 402 m | 2 ruptures ; résultats partiels. Référence distance 9,3 km. |
| Fontargente | 7,90 km | 470 / 482 m | 1 rupture ; écart à la référence 8,5 km d’environ −7,1 %, à expliquer par un enregistrement complet avant recalibration. |
| Orlu | 14,54 km | 520 / 507 m | 1 rupture ; total réel non établi. |
| Gaube | 5,78 km | Global non affiché | Couverture altitude 81,2 % < seuil 85 %, 1 rupture ; refus de conclure sur difficulté globale. |

Sur données synthétiques connues : +100 m monotone, −100 m, bosse de 50 m, plat bruité, pente de 20 %, réversion D+/D−, absence de raccords artificiels : contrôles réussis. Pour le GPX Écrins téléchargé dans le navigateur : 10,19 km, +412/−414 m, note physique 3/5 ; ces mesures ne constituent pas une validation terrain de la fiche source.

## Performance, journaux et risques résiduels

Le navigateur de bureau a réalisé le chargement/analyse/sauvegarde de Gavarnie en environ 2,57 s pendant l’essai à deux contextes ; ce chiffre inclut rendu et stockage et ne prédit pas la vitesse d’un iPhone. Les grosses traces et bibliothèques peuvent bloquer momentanément l’interface ; limiter la taille n’est pas une garantie de fluidité. Aucun envoi de télémétrie ajouté. Les scénarios normaux n’ont pas produit d’erreur JavaScript non gérée ; les erreurs de stockage/GPX provoquées exprès apparaissent dans les logs de tests et sont attendues.

Priorités terrain : **synchronisation réelle et sécurité serveur**, Safari/PWA sur iPhone, préservation du stockage dans la durée, comportement des sources externes, écart de Fontargente et validation des prévisions. Conserver une carte/navigation de randonnée adaptée et les GPX originaux ; les verdicts restent des avis indicatifs dépendant de la trace, du terrain et des conditions.

## Checklist d’essai sur plusieurs semaines

- [ ] Export complet vérifié avant installation, puis régulièrement (par exemple après chaque série de sorties).
- [ ] PC et iPhone : même compte, modification d’un nom/favori puis réception sur l’autre appareil ; même modification des deux côtés → conflit présenté, choix conservé.
- [ ] Avant une sortie : GPX réellement sauvegardé, cache prêt, fermeture/réouverture en mode avion ; analyse et carnet consultables.
- [ ] Tester un parcours facile connu, une montée prolongée et une descente raide, pour chaque profil sans simulation.
- [ ] Noter distance/dénivelé prévu, résultat de l’appareil de référence, effort réel, chaleur, terrain et pauses ; ne pas modifier l’algorithme après une seule différence.
- [ ] Remplir Évaluer après la sortie, vérifier le bon profil et l’absence de doublons après reconnexion.
- [ ] Après quelques sorties distinctes, inspecter la calibration facultative et les explications ; signaler toute prévision trop rassurante.
- [ ] Vérifier petits écrans, rotation, gros texte iOS, clavier/VoiceOver, stockage disponible et lancement depuis l’écran d’accueil.
- [ ] Si bug : conserver l’original, exporter les données, noter version, appareil, étapes et message ; ne pas vider le stockage pour dépanner.

## Sources techniques de l’audit

- [Révision GitHub utilisée](https://github.com/alexouxoul-netizen/ProRando/commit/9600a7e6b43f142d61c029a0e15f15140e1507ee).
- [Clés publiques Supabase et responsabilités RLS](https://supabase.com/docs/guides/getting-started/api-keys), [sécurité par ligne](https://supabase.com/docs/guides/database/postgres/row-level-security).
- [Cycle d’activation du service worker](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting).
- [OSV : requêtes de vulnérabilités par version](https://google.github.io/osv.dev/post-v1-querybatch/).

L’archive de validation privée contient les résultats bruts, les scripts de reproduction et les références de test. Elle ne doit pas être publiée sur GitHub Pages.
