# Publier RandoVista V11.5.3 RC1

Cette archive est une **candidate pour essai prolongé**, pas une garantie de fiabilité terrain. Aucune publication n’a été effectuée pendant l’audit.

1. Dans l’application habituelle, ouvre **Mon compte et mes sauvegardes → Sauvegardes complètes → Exporter toutes mes données**. Vérifie le fichier téléchargé. Garde aussi tes GPX originaux. La sauvegarde du projet fournie ici ne contient pas les données de ton navigateur ou du compte.
2. Garde le ZIP de sauvegarde GitHub V11.5.2. Extrais le ZIP **CANDIDAT** dans un dossier vide. `index.html`, `sw.js` et tous les fichiers `discover-*.json` doivent se trouver ensemble à sa racine.
3. Pour une première vérification, utilise un dépôt GitHub Pages de test distinct. Les données locales de l’adresse habituelle ne suivent pas automatiquement vers une nouvelle adresse. Utilise des données d’essai ; la configuration cloud vise le compte habituel : ne connecte pas ce compte pour un essai jetable.
4. Lorsque tu souhaites remplacer le site habituel : copie **tout le contenu du ZIP candidat** à la racine du dépôt ProRando, sur la branche utilisée par Pages, puis enregistre le changement. Conserve l’adresse habituelle et `cloud-config.js`. Ne copie pas les archives de sauvegarde ou de validation dans le dépôt public. Pas de nouvelle clé secrète à ajouter.
5. Dans GitHub, **Settings → Pages**, conserve la source de publication existante. Pour une publication depuis une branche, la racine `/` doit contenir `index.html` et `.nojekyll`. Attends la réussite de la publication. Les anciens fichiers non utilisés peuvent rester ; la candidate ne les charge pas.
6. Ouvre le site avec une connexion et laisse le cache se préparer. **Ferme toutes les fenêtres RandoVista, y compris l’application ajoutée à l’écran d’accueil, puis rouvre.** La nouvelle version attend la fermeture de l’ancienne application pour éviter un mélange de fichiers. Vérifie **V11.5.3 RC1** et **Application prête hors connexion** dans les sauvegardes. Si nécessaire, refais ce cycle ; n’efface pas les données du site.
7. Vérifie tes profils, un GPX, un favori et le carnet. Contrôle ensuite la synchronisation PC/iPhone avec une petite modification identifiable, puis le mode avion après sauvegarde du parcours. Les fonds de carte et les catalogues Geotrek en direct nécessitent une connexion.

## Retour à V11.5.2

Exporte d’abord les données les plus récentes. Remets les fichiers de la sauvegarde GitHub V11.5.2 dans le dépôt, republie et ferme/réouvre toutes les fenêtres. Les noms des bases locales, les clés et le format des données restent V11. Une restauration JSON remplace les données locales et demande une reprise explicite de synchronisation : utilise-la uniquement si les données ont réellement besoin d’être restaurées. La réouverture de l’ancienne version après retour arrière n’a pas fait l’objet d’un essai navigateur distinct.

## Essai local facultatif

Dans le dossier extrait, lance `python -m http.server 8000`, puis ouvre `http://localhost:8000/`. Un double-clic sur `index.html` ne valide ni le stockage ni le service worker. Les tests détaillés sont fournis dans l’archive de validation privée, à ne pas publier.
