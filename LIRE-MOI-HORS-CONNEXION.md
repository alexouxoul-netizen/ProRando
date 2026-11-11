# RandoVista V11.1 — hors connexion, version de test

Base : version SAUVEGARDES validée. Aucune publication.

## Changements

- Le démarrage vérifie le cache complet auprès du service worker actif, même si son réenregistrement échoue sans réseau.
- Affichage de l’état réseau et du résultat de la préparation hors connexion, avec bouton pour vérifier/préparer à nouveau.
- Les parcours doivent être enregistrés dans Mes randos avant le départ. Les fonds de carte nécessitent le réseau et ne sont pas téléchargés pour le hors connexion.
- Aucun changement du moteur GPX, des difficultés, de la calibration, des sauvegardes ou de la synchronisation.

## Vérification dans le navigateur

18 contrôles réussis dans un espace isolé : cache complet ; bibliothèque et favori ; profil ; indicateur réseau ; deux redémarrages serveur réellement arrêté ; réouverture du GPX original ; mesures, verdict et graphiques ; saisie et conservation du retour local ; absence d’envoi hors connexion ; reprise vers un service simulé ; synchronisations répétées sans doublon ; conservation du GPX, profil et favori ; nettoyage limité aux données fictives.

Beille après redémarrage hors serveur : 10,83 km, D+ 338 m, note physique 2/5. Valeurs identiques à la base validée.

Le serveur local a réellement été arrêté. Les événements réseau et le service de synchronisation sont simulés ; aucun compte réel ni serveur distant n’a été utilisé. Le fond de carte est neutralisé dans le banc d’essai. Ces essais ne remplacent pas un essai en mode avion sur un véritable iPhone, ni un essai de synchronisation entre deux appareils réels.

## Reproduire

Archive VALIDATION : lancer `python validation/run.py` pour les 179 contrôles existants et la vérification de syntaxe. Lancer `python -m http.server 8774`, ouvrir `http://127.0.0.1:8774/validation/offline-browser-tests/`, attendre `ready-to-stop-server`. Arrêter ce serveur, cliquer « Tester après coupure du serveur ». À `ready-to-restart-server`, relancer le même serveur au même port puis cliquer « Tester après retour du serveur ». Résultat attendu : `complete`, 18 contrôles, aucune erreur. Utiliser un navigateur de test ; données fictives et stockage préfixé, nettoyage automatique en fin de succès.

## Essai iPhone restant

Ouvrir avec connexion, vérifier « Application prête hors connexion », enregistrer une randonnée dans Mes randos. Passer en mode avion, fermer puis rouvrir l’application, ouvrir la randonnée enregistrée et saisir un retour. Vérifier sa présence après une nouvelle ouverture, puis après le retour du réseau. Les fonds de carte peuvent manquer ; le tracé et l’analyse doivent rester utilisables.
