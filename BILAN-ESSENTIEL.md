> Historique de l’audit RC1. Pour la candidate actuelle, lire d’abord CORRECTIF-EXPERT.md. Les résultats navigateur historiques ne sont pas présentés comme tous répétés en RC2.

# RandoVista V11.5.3 RC1 — bilan essentiel

Candidate préparée les 12–13 novembre 2026 depuis la dernière V11.5.2 fonctionnelle de Work et GitHub (révision 9600a7e6). **Le site en ligne et le compte réel n’ont pas été modifiés.** Les sauvegardes du projet sont fournies séparément ; exporte aussi les données depuis l’application avant toute installation.

## Corrections

- Profil : un échec de stockage annule la modification visible et avertit.
- GPX : échec de sauvegarde automatique visible, limites de taille et refus des déclarations externes homogénéisés.
- Favori : une écriture refusée conserve la valeur en mémoire et sur disque.
- Cache : séparation par chemin Pages, fichiers rechargés et activation après fermeture de l’ancienne application.
- Interface verte/crème conservée, focus clavier et onglet actif accessibles, animations réduites et archives publiables allégées.

Les moteurs, verdicts, apprentissage, catalogue, fonctions et formats des données sont conservés. Pas de nouveau réglage à refaire.

## Ce qui a réussi

17 suites automatisées et 34 contrôles de syntaxe ; 6 GPX de référence, cas de distance/pente/D+/D− connus, verdicts et apprentissage par profil. Dans le navigateur : 32 contrôles de sauvegarde/restauration ; scénarios à deux contextes avec cloud simulé, conflits et reprise ; réouverture avec serveur arrêté ; mise à jour V11.5.2 → RC1 avec profil conservé ; 16 contrôles responsive (320 à 1280 px).

Découvrir : catalogues et traces empaquetés vérifiés, APIs Écrins et Nature64 accessibles ; GPX Écrins effectivement téléchargé, analysé, sauvegardé puis ouvert dans Préparer. Nature64 reste en téléchargement manuel.

## Ce qui reste à valider

**Non validés :** synchronisation avec le vrai compte sur PC/iPhone, isolation entre deux comptes connectés et politiques serveur, Safari/PWA/VoiceOver sur iPhone physique, tenue du stockage et performances sur plusieurs mois. Audit des trois versions directes de bibliothèques sans alerte OSV renvoyée ; audit transitif complet indisponible sans lockfile/npm. La lecture cloud anonyme a été refusée HTTP 401 ; ce contrôle ne suffit pas à certifier la sécurité serveur.

Les prévisions restent indicatives. Les traces interrompues ne couvrent pas le trajet complet : Fontargente reste notamment environ 7 % sous sa référence de distance. Gaube manque d’altitudes pour un verdict global. Aucun dénivelé terrain indépendant complet n’est établi pour les six traces. Cartes et Geotrek direct nécessitent le réseau.

## Petit protocole terrain

- [ ] Export complet avant installation puis régulièrement.
- [ ] Un GPX connu par profil ; vérifier distances, avis et bon profil.
- [ ] Avant le départ : parcours enregistré, cache prêt et réouverture en mode avion.
- [ ] Après la sortie : Évaluer, noter chaleur/terrain, comparer sans recalibrer sur un seul écart.
- [ ] PC/iPhone : nom ou favori synchronisé, conflit explicite si les deux modifient la même donnée, absence de doublons après reconnexion.
- [ ] Conserver les originaux et les étapes exactes en cas de bug ; ne pas vider les données du site.

Publication : suivre PUBLICATION-MANUELLE.md. Les détails, mesures, risques et preuves sont dans AUDIT-CANDIDAT.md et l’archive de validation privée.
