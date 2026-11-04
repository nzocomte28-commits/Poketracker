# PokéTracker — première version

Application web progressive (PWA), pensée pour iPhone et ajoutable à l'écran d'accueil.

## Inclus
- Deux catégories : 30th japonais et 30th français
- Checklist personnelle : ajout, modification, suppression, possédée / non possédée
- Prix saisi en yens, conversion en euros avec taux modifiable
- Prix cible, notes, recherche, statistiques
- Sauvegarde locale dans le navigateur
- Mise en cache de l'interface pour une utilisation hors ligne après première visite

## Installation sur iPhone
1. Héberger le contenu de ce dossier sur un site HTTPS (par exemple GitHub Pages ou Netlify).
2. Ouvrir l'adresse dans Safari sur l'iPhone.
3. Appuyer sur Partager → Sur l'écran d'accueil → Ajouter.

## Limites actuelles
- Aucune liste officielle de cartes n'est préchargée : on doit d'abord valider la checklist exacte des éditions japonaises et françaises.
- Les prix ne sont pas récupérés automatiquement. Le champ de prix est manuel dans cette version.
- Le taux JPY/EUR est manuel. Une prochaine étape pourra connecter une source de change et des sources de prix autorisées, si leur accès technique le permet.
- Les données sont stockées sur l'appareil et ne sont pas synchronisées entre plusieurs appareils.

## Lancer en local
Servir ce dossier via un serveur HTTP local. Ouvrir `index.html` directement ne suffit pas pour tester le service worker.
