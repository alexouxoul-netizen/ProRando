# RandoVista V11.5.5 RC3 — règle de présentation Expert

13 novembre 2026. Candidate complète basée sur RC2, sans publication automatique.

## Nouvelle règle demandée

Pour un profil **Expert**, l’application ne donne plus un verdict automatique « À éviter » sur la seule base de l’effort GPX. Les trois niveaux d’avis deviennent :

- A priori adaptée ;
- Exigeante, mais potentiellement faisable ;
- **Très exigeante**, accompagnée des efforts à anticiper.

Cette présentation vaut aussi pour un Expert simulé temporairement. Elle est harmonisée dans Préparer, les cartes Découvrir/bibliothèque, le filtre de bibliothèque, le comparateur et son conseil, ainsi que l’assistant avant départ. Deux parcours très exigeants sont comparés sur leurs passages clés, sans conseiller automatiquement de les écarter au profil Expert.

Les notes physiques, distances, dénivelés, pentes, scores et classements d’effort de RC2 sont conservés. Un parcours très exigeant garde sa couleur d’alerte et ses détails. Les autres niveaux conservent leurs verdicts précédents. Si les altitudes sont insuffisantes, le verdict reste indisponible.

Un ancien retour où tu avais personnellement choisi « À éviter » reste consultable comme historique. Il n’est pas effacé ou transformé en avis favorable ; le titre actuel Expert devient « Très exigeante : retour terrain défavorable ». Les anciennes prévisions mémorisées restent fidèles à leur ancien libellé, tandis que les nouvelles prévisions Expert conservent « Très exigeante » dans le bilan.

## Vérifications

- **20 suites automatisées et 34 contrôles de syntaxe réussis.**
- Tests d’un score élevé en Expert : titre « Très exigeante », carte de comparaison et conseil cohérents, classement d’effort élevé conservé.
- Filtre de la bibliothèque adapté au profil Expert, puis rétabli pour un autre niveau.
- Comparaison de deux parcours à effort élevé adaptée à Expert ; données manquantes toujours signalées.
- Conservation des retours terrain et anciens bilans ; nouvelles prévisions cohérentes dans le bilan.
- Navigateur réel : trace synthétique volontairement très exigeante (30 km et environ 3 000 m de D+) ; simulation Expert « Très exigeante » avec note physique 5/5, autre niveau conservant « À éviter », profil enregistré inchangé. La capture est celle de ce test synthétique, pas celle de la cascade d’Ars.
- Le test du GPX fourni de la cascade d’Ars est conservé : mesures et résultat Expert de RC2 inchangés, soit « Exigeante, mais potentiellement faisable ».

Les validations navigateur complètes du premier audit (cloud simulé, sauvegardes, responsive, mise à jour) restent historiques RC1, non toutes répétées en RC3. Safari/iPhone physique, cloud réel, sécurité serveur et usage prolongé restent à valider. Ce changement de présentation ne constitue pas une validation terrain du parcours.

## Installation manuelle

1. Exporte une sauvegarde complète depuis l’application et vérifie le fichier téléchargé.
2. Extrais le ZIP V11.5.5 RC3 et remplace les fichiers du dépôt habituel par tout son contenu. Publie toi-même, en gardant l’adresse et la configuration cloud habituelles.
3. Ouvre avec une connexion, attends la préparation puis ferme toutes les fenêtres RandoVista et rouvre. Vérifie **V11.5.5 RC3**. N’efface pas les données du site.
4. Vérifie un parcours très exigeant en simulation Expert, puis décoche pour retrouver ton niveau enregistré.

RC1 et RC2 restent disponibles pour revenir en arrière. Aucun GPX personnel ni test synthétique n’est inclus dans le ZIP publiable. L’archive de validation est privée et ne doit pas être publiée.
