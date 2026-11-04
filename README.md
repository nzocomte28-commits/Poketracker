# PokéTracker V13

Cette version prépare le catalogue complet pour les trois éditions dont les identifiants TCGdex sont définis et séparés :
- Français : Méga-Évolution (`MEG`, identifiant TCGdex `me01`)
- Japonais : Méga-Brave (`M1L`)
- Japonais : Méga-Symphonia (`M1S`)

Le catalogue et les images sont récupérés par GitHub Actions, puis enregistrés dans le dépôt. Le ZIP contient le générateur, pas les 372 images déjà téléchargées : elles seront générées lors de l'exécution de l'action, sur GitHub.

## Installation
1. Décompresser le ZIP.
2. Importer les fichiers et dossiers dans le dépôt GitHub, en remplaçant les fichiers existants.
3. Ouvrir l'onglet **Actions** du dépôt.
4. Sélectionner **Générer le catalogue PokéTracker** puis **Run workflow**.
5. Attendre la fin verte de l'action. Le bot ajoute `catalog-data.js` et `catalog/images/` au dépôt.
6. Ouvrir le site avec `?v=13`.

## Conservation des données
La clé `poketracker-v2` est volontairement conservée. Ne pas supprimer les données du site dans Safari. Les cartes déjà présentes et cochées ne sont pas remplacées par l'import.

## Filtrage
Les cartes de catégorie `Energy` sont exclues. Les cartes Dresseur, même si leur nom contient « Énergie », restent dans le catalogue.

## Champs importés
Numéro, nom dans la langue du set, catégorie, rareté, types, PV, illustrateur, variantes et image locale. Les prix ne sont pas inventés : ils restent à renseigner ou à connecter à une source de prix distincte.
