# Catalogues locaux — état vérifié le 12 novembre 2026

## Ce qui est intégré à RandoVista V11.4.1

Un annuaire de six adresses, rédigé pour RandoVista, filtrable par département 09, 31 ou 65. Il ouvre le site du producteur dans une autre fenêtre. Aucun inventaire d'itinéraires, photo, description de randonnée ou fichier GPX de ces sources n'est copié dans le ZIP. Il n'y a pas de nouvelle API de recherche automatique pour ces départements.

Au retour du site, l'utilisateur peut sélectionner le GPX qu'il a téléchargé, choisir son profil et son nom, obtenir l'analyse du moteur stable, ouvrir dans Préparer et sauvegarder dans Mes randos. L'application ne contacte pas la source pour lire le fichier local. La source est déclarative : l'identité du fichier avec une fiche n'est pas certifiée.

## Sources

| Adresse | Vérification des fichiers et accès | Droits / décision |
|---|---|---|
| [Ariège Pyrénées Tourisme](https://www.ariegepyrenees.com/preparer/randonner/) | Les fiches indexées Quérigut, Izourt, Bassiès et d'autres affichent un téléchargement GPX. Accès direct testé bloqué : HTTP 403 côté requête de contrôle, 503 côté outil de lecture. Le fichier de Quérigut n'a donc pas été téléchargé ni analysé pendant cet audit. | [Mentions légales](https://www.ariegepyrenees.com/mentions-legales/) : reproduction électronique avec attribution et droits réservés pour certains usages non commerciaux ; extraction de la base encadrée. Pas de licence ouverte globale ni d'autorisation d'extraction automatique établie. Annuaire + import volontaire uniquement. |
| [Pyrénées 31](https://www.pyrenees31.com/randonnees) | Catalogue pédestre autour du Luchonnais et du Comminges. Bouton « Télécharger le tracé GPX » observé sur la fiche [Chemin d'Oô à la Moraine](https://www.pyrenees31.com/randonnees/70-chemin-d-oo-a-la-moraine). Pas de validation automatique des fichiers de l'ensemble du catalogue. | [Mentions légales](https://www.pyrenees31.com/mentions-legales) : reprise soumise à autorisation expresse. Annuaire + import volontaire, aucune extraction du catalogue. |
| [Rando Vallées de Gavarnie](https://rando.valleesdegavarnie.com/) | [Gaube](https://rando.valleesdegavarnie.com/trek/10146-Le-lac-de-Gaube) : lien réel GPX vers `geotrek65admin.openig.org`. Téléchargement testé HTTP 200, 36 751 octets, 329 points et 329 altitudes ; CORS autorise l'origine de contrôle. | [Mentions légales](https://rando.valleesdegavarnie.com/information/4-Mentions-Legales) principalement consacrées à la confidentialité ; aucune licence de réutilisation du catalogue établie. La possibilité technique de télécharger n'est pas une autorisation de constituer une copie du catalogue. Annuaire + import volontaire. |
| [Vallée du Louron](https://www.vallee-du-louron.com/fr/sentiers-de-randonnees) | Le site annonce 31 parcours et renvoie à Louron Bike & Trail. La fiche [cap de Toudous](https://louronbikeandtrail.com/fr/parcours/185334) propose un GPX, mais le lien observé conduit au formulaire de connexion : un compte peut être nécessaire. Aucun contournement. | Droits de reprise non établis. La consultation des [mentions Louron Bike & Trail](https://louronbikeandtrail.com/fr/mentions) a répondu HTTP 429 lors de cet audit. Pas de collecte ni de récupération automatique. |
| [Peyragudes](https://peyragudes.com/randonnees-trail/) | Liste locale de randonnées et trails, versants 31/65. GPX de la cabane du Bois : HTTP 200, 14 132 octets, 114 points et 114 altitudes. Aucun en-tête CORS autorisant la lecture depuis RandoVista dans le test. | Pas de droit de redistribution globale du catalogue établi. Annuaire + téléchargement sur le site puis import local. Attention aux parcours utilisant les remontées mécaniques : le GPX ne prouve pas leur ouverture. |
| [Mairie de Lherm](https://www.mairie-lherm.fr/decouvrir/se-promener/) | Quatre boucles proposées avec liens GPX observés sur le site municipal. Téléchargements non vérifiés un à un. | Site avec droits réservés, aucune licence globale de réutilisation établie. Annuaire + import volontaire. |

## Autre donnée examinée en Haute-Garonne

L'[open data PDIPR de Haute-Garonne](https://www.data.gouv.fr/datasets/plan-departemental-des-itineraires-de-promenade-et-de-randonnee-pdipr-2) est sous Licence Ouverte 2.0. Il fournit des **segments de réseau**, pas un catalogue de GPX complets. L'API du portail a aussi été vérifiée : les données d'aménagements ENS contiennent des géométries et des liens d'information, sans champ GPX. Aucune de ces géométries n'a été assemblée en trace ni utilisée pour attribuer une difficulté GPX.

## Limites

Les catalogues externes restent soumis à leurs conditions, comptes éventuels et disponibilité. L'annuaire ne garantit pas que chaque randonnée possède un GPX. L'application n'automatise aucune connexion et n'envoie aucun message aux producteurs. Une éventuelle reprise directe de leurs catalogues reste à négocier avec les titulaires des droits.

Les filtres de distance, paysages et rayon de la recherche intégrée 64/Écrins ne sont pas appliqués à cet annuaire : les recherches de parcours se font chez les producteurs. Un simple lien ou la sélection d'une source n'attribue jamais de score. Le moteur analyse seulement le GPX local réel. Les altitudes insuffisantes et traces partielles conservent leurs alertes stables.

Le GPX sauvegardé reste original. Le nom choisi est conservé dans la bibliothèque compatible V11 ; la source déclarée dans le formulaire n'est pas ajoutée au format de synchronisation. La sauvegarde utilise le compte partagé existant si l'utilisateur l'a activé. Ne pas confondre usage personnel du fichier et autorisation de le republier.
