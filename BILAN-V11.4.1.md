# RandoVista V11.4.1 TEST — catalogues locaux

Base : ZIP V11.4-DECOUVRIR-TEST fourni et essayé par l'utilisateur. SHA-256 : `9e0c2271076ae29ab9cfbb339fa2d1717fde0c40f80eb01f2b37afada0db760e`.

## Livré

Découvrir propose deux modes : un annuaire de six catalogues locaux, filtrable par département 09/31/65, et la recherche intégrée V11.4 sur le 64 et les Écrins.

Depuis l'annuaire : ouverture du site source, téléchargement du GPX par l'utilisateur, retour avec le fichier, choix du profil et du nom, analyse stable, ouverture dans Préparer et sauvegarde dans Mes randos. Aucun inventaire tiers, GPX ou photo n'est copié dans le ZIP. Aucune nouvelle API de recherche automatique pour le 09/31/65 n'est activée : les droits de reprise restent à établir ou nécessitent un accord. Voir SOURCES-LOCALES.md.

## Vérifications

- 29 contrôles du nouveau module : filtres des départements ; fichiers invalides et taille ; noms ; aucune analyse avant GPX ; XML intact ; changement de profil ; transfert vers Préparer ; erreur de sauvegarde réessayable ; sauvegarde unique ; changement de source ; lecture asynchrone devenue obsolète ; bascule entre modes.
- 34 contrôles Découvrir V11.4 réussis.
- Suite historique relancée : 179 vérifications annoncées par le lanceur, puis 7 contrôles de recalibration dont 8 723 combinaisons. Fontargente, Oô, Orlu, Gaube, Saint-Félix et Gavarnie conservent leurs résultats. Contrôle historique de conservation des fichiers réussi.
- 21 fichiers critiques identiques aux versions stables précédentes : moteur, calibration, profils, carnet, bibliothèque intelligente, stockage, cloud et chargement des parcours. Noyau de découverte V11.4 et module de sauvegarde également inchangés.
- 46 ressources hors connexion présentes ; dépendances de démarrage couvertes par le cache atomique.
- Navigateur à 390 × 844 : six adresses, dont une en Ariège, trois en Haute-Garonne et trois en Hautes-Pyrénées (Peyragudes commun à deux départements). Largeur de page et défilement horizontal de 390 px : pas de débordement.
- GPX officiel de Gaube téléchargé et importé dans le nouveau formulaire ; analyse pour Ma femme puis Moi ; renommage ; sauvegarde ; ouverture dans Préparer avec le bon profil ; présence dans Mes randos.
- Recherche intégrée 64 vérifiée : 370 fiches pédestres chargées, 239 résultats avec les réglages par défaut autour d'Ossau pendant l'essai.
- Serveur arrêté puis page rechargée : module accessible depuis le cache, annuaire visible, Gaube toujours sauvegardé et réouverture/analyse réussie. Ce contrôle n'est pas un test complet en mode avion sur un iPhone physique.

Le GPX officiel de Gaube testé n'est pas le fichier personnel historique. Il donne environ 4,87 km et +257 m. Ses 329 points sont jugés peu détaillés par le moteur stable, qui affiche son avertissement. Les verdicts dépendent du profil et du fichier exact ; aucune règle fondée sur le nom Gaube n'a été ajoutée.

La synchronisation réelle avec le compte de l'utilisateur sur deux appareils et Safari sur iPhone physique ne sont pas testés. Les modules cloud sont inchangés ; les consignes prévoient ce contrôle utilisateur.

## Limites

Les randonnées du 09/31/65 se recherchent sur les sites externes ; import GPX manuel. Droits de reprise non établis ou soumis à accord, accès Ariège bloqué pendant le contrôle, GPX Louron pouvant demander une connexion. Aucun contournement ni message envoyé aux producteurs.

La source choisie est déclarative, ne certifie pas l'identité du GPX et n'est pas ajoutée au format synchronisé. Seuls le nom et le GPX original sont sauvegardés via la bibliothèque compatible V11. Les fichiers seulement analysés dans le formulaire disparaissent à la fermeture.

Rien n'a été publié. Le ZIP est prévu pour une publication manuelle à la même adresse GitHub Pages, sans GPX personnels ni fichiers externes de contrôle.
