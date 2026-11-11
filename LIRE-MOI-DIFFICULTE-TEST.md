# RandoVista V11.1 — essai prudent de difficulté

11 novembre 2026. Livraison expérimentale, aucune publication.

## Provenance vérifiée

Base : dossier de travail `offline-app` du chantier « Fiabiliser le moteur GPX V11.1 », version HORS-CONNEXION-TEST. Le dernier échange Work contient « tout est oki », suivi de la confirmation que cette version devient la nouvelle base. Aucun retour à une ancienne archive. Copie isolée dans le présent chantier ; aucun accès ni changement aux données réelles.

## Modification limitée

La frontière physique entre 2/5 et 3/5 passe de **2,7 à 2,8**. Les poids, les autres frontières (1,1 ; 3,5 ; 4,35), la fatigue cumulative et le plancher des montées concentrées restent identiques. La formule physique est maintenant partagée entre fiche et comparateur pour éviter leur divergence. Le nom du parcours, les distances Strava et le ressenti ne sont jamais utilisés comme exceptions dans le code.

Le score d’Oô vaut 2,715 : son classement était très proche de la frontière. Le seuil expérimental arrondi à 2,8 est un assouplissement de 0,1, limité à cette frontière ; il ne constitue pas une estimation statistique validée. Un seuil de 3,0 aurait élargi davantage la zone assouplie sans données suffisantes ; il n’est pas retenu. Il faudra confirmer 2,8 sur d’autres parcours complets et retours indépendants avant de l’adopter comme stable. Cet essai ne prétend pas calibrer tous les profils à partir du ressenti d’une seule personne.

Les **verdicts personnalisés** suivent leur échelle distincte (low/moderate/high), leurs seuils et leurs scores historiques inchangés. Les offsets des profils et la version des règles adaptatives restent inchangés : aucune réinterprétation des carnets. La note physique /5 ne doit pas être confondue avec le verdict personnalisé.

## Résultats avant / après

| Parcours | Référence de ressenti | Km mesurés | D+ mesuré | Score physique | Note avant → après | Verdict, niveau de test 1 |
|---|---|---:|---:|---:|---|---|
| Gaube | 1/5 | 5,783 | 77 m connus seulement | non publiable | indisponible → indisponible | inconnu |
| Oô | 2/5 ; Strava 9,3 km | 9,195 | 468 m | 2,715 | 3 → 2 | moderate, score 4 inchangé |
| Orlu | 3/5 ; montées finales | 14,543 | 520 m | 3,155 | 3 → 3 | moderate, score 5 inchangé |
| Fontargente | 5/5, terrain technique, à éviter ; Strava 8,5 km | 7,895 | 470 m | 4,907 | 5 → 5 | high, score 11 inchangé |
| Saint-Félix | 1–2/5 hors météo ; 4/5 vécu à 30 °C au soleil | 8,006 | 178 m | 1,279 | 2 → 2 | low, score 1 inchangé |
| Gavarnie, contrôle supplémentaire | 2/5, passage technique signalé | 9,863 | 327 m | 2,241 | 2 → 2 | moderate, score 4 inchangé |
| Beille–Prat Moll, contrôle supplémentaire | aucun ressenti de validation exploité ici | 10,832 | 338 m | 2,504 | 2 → 2 | low, score 2 inchangé |

Le niveau 1 ci-dessus est un **profil synthétique**, pas une lecture du profil réel de votre femme. Le CSV fournit les cinq niveaux, les mesures non arrondies et les verdicts. Pour Gaube, le score mathématique calculable sur les seules portions connues ne représente pas la randonnée entière et n’est pas affiché comme note.

## Relief, terrain et météo

- Le relief utilise distance, D+, pentes, montées continues et charge cumulative. Les pentes raides ne prouvent pas la présence de rochers, de pierriers ou d’exposition.
- La technicité reste un retour terrain distinct. Fontargente conserve son verdict élevé sur la trace ; une référence personnelle « à éviter » garde son rôle existant. Aucun retour de la conversation n’est injecté dans le carnet.
- La chaleur reste un contexte déclaré, exclu du vote physique adaptatif. Le 4/5 vécu à Saint-Félix reste conservé ; la température et le soleil ne sont pas transformés en difficulté de relief ni en formule météo fictive.

## Incertitudes déterminantes

Gaube : seulement 81,2 % de couverture altimétrique et une interruption. Il serait trompeur de forcer 1/5 sur cette trace. Une trace plus complète est nécessaire pour vérifier cette référence.

Oô : deux interruptions ; la distance manque environ 105 m par rapport aux 9,3 km Strava, sans que cet écart mesure à lui seul tout le trajet manquant. D+ et note restent des estimations sur les portions enregistrées. L’ajustement du seuil est une hypothèse de test, pas une correction de la trace.

Fontargente : une interruption ; environ 605 m d’écart par rapport aux 8,5 km Strava. Aucun raccord ni dénivelé n’est inventé. La technicité connue provient du retour utilisateur.

Orlu : une interruption. Les montées finales sont un facteur de ressenti confirmé par l’utilisateur ; cette livraison conserve les montées et la fatigue cumulative, mais n’ajoute pas de coefficient spécifique à leur position dans la sortie. Il manque des observations indépendantes pour le calibrer.

Les sept GPX constituent un petit ensemble local, sans validation indépendante de tous les ressentis. Aucun nouveau GPX n’a été téléchargé sur Internet. Les tests supplémentaires utilisent Gavarnie et Beille disponibles dans le précédent chantier.

## Vérifications et conservation

179 contrôles existants passent : moteur GPX, intégration fiche/comparateur, simplification 3 m, altitudes, analyses partielles, adaptation et conservation du carnet. 7 scénarios supplémentaires passent, dont un balayage déterministe de 8 723 combinaisons, les frontières, la monotonie distance/D+, le plancher des montées raides et les résultats attendus. Les seuls changements de note dans ce balayage sont de 3 vers 2 pour les scores [2,7 ; 2,8), hors plancher des montées concentrées.

L’audit réel des fonctions de la fiche et du comparateur concorde sur **35 combinaisons** (7 GPX × 5 niveaux). Les 96 contrôles existants vérifient aussi les corrections adaptatives −1/0/+1 et les références terrain. **41 fichiers de la base sont identiques à l’octet**, vérifiés par SHA-256, dont moteur GPX, profils, carnet, adaptation, stockage, synchronisation, démarrage et bibliothèques. Les mesures GPX et scores des verdicts personnalisés des six références historiques sont inchangés.

Fichiers de fonctionnement modifiés : formule partagée dans verdict-rules.js, ses deux appelants script.js et compare-gpx-v104.js, en-tête de test index.html, identifiant de cache concordant dans sw.js et offline-v11.js. Aucun schéma de données modifié.

Pas de nouveau test navigateur/iPhone, de restauration réelle ni de synchronisation cloud réelle dans ce chantier. Les essais de non-régression utilisent les fonctions réelles avec interface et stockage simulés ; l’identité des modules cloud ne remplace pas un essai multi-appareils. Les contrôles navigateur du chantier précédent ne sont pas revendiqués comme rejoués ici.

## Archives et reproduction

- `RandoVista-V11.1-DIFFICULTE-TEST.zip` : site à la racine, destiné à une publication manuelle sur GitHub Pages.
- `RandoVista-V11.1-DIFFICULTE-VALIDATION.zip` : même site, sources de validation, GPX, mesures avant/après et contrôles. Contient des traces personnelles : conserver cette archive de validation privée si leur publication n’est pas souhaitée.
- `SCORES-AVANT-APRES.csv` : audit détaillé.

Extraire l’archive VALIDATION, puis lancer `python validation/run.py` avec Python et Node disponibles. Les références supplémentaires et leurs points extraits sont fournis dans validation/supplementary. Les tests ne se connectent pas au compte cloud. Les fichiers de sommes de contrôle permettent de vérifier l’intégrité des archives et les modules conservés.

## Essai manuel conseillé

1. Exporter toutes les données depuis la version stable et conserver son ZIP pour revenir en arrière.
2. Extraire le ZIP TEST et placer ses fichiers à la racine du dépôt GitHub Pages, comme pour les versions précédentes. Aucune publication n’a été effectuée par l’assistant.
3. Fermer les autres onglets RandoVista puis recharger. Vérifier l’en-tête « difficulté expérimentale » et le statut hors connexion prêt ; le cache possède un nouvel identifiant pour charger les bons fichiers.
4. À profil et calibration identiques, vérifier Oô 2/5 dans la fiche et le comparateur, Fontargente 5/5, Orlu 3/5 et Saint-Félix 2/5 ; Gaube garde l’avertissement. Un éventuel avis personnalisé différent dépend du profil et du carnet.
5. Vérifier carnet, profils, parcours enregistrés, puis ouverture hors connexion. Ne pas confondre l’absence de fond de carte avec une perte de parcours.

Cette livraison reste une version de test soumise à votre validation d’usage.
