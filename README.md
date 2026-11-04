# PokéTracker V12

Application web progressive (PWA) de suivi de collection Pokémon, pensée pour mobile.

## Ce que contient cette version
- Accueil séparant les collections commencées des collections disponibles.
- Navigation par bloc, extension et langue.
- Français et japonais séparés, avec M1L et M1S comme extensions distinctes.
- Checklist, recherche, cartes possédées/manquantes et progression.
- Prix EUR et JPY, sans conversion de prix inventée.
- Sauvegarde locale dans `localStorage` sous la clé `poketracker-v2`.
- Catalogue local générable via GitHub Actions pour la série française MEG.

## Générer le catalogue français MEG
Dans GitHub : onglet **Actions** → **Générer le catalogue** → **Run workflow**. Le workflow télécharge les données disponibles depuis TCGdex et commit le résultat dans le dépôt.

Le script filtre uniquement les cartes dont la catégorie est `Energy`. Il ne filtre pas sur le texte du nom : les cartes Dresseur telles que « Échange d'Énergie » ne sont donc pas exclues.

Les catalogues japonais M1L et M1S sont affichés séparément dans l'application, mais ne sont pas remplis automatiquement par ce workflow : leur source de données doit être vérifiée avant import. Aucune traduction ni carte supposée n'est injectée.

## Publication GitHub Pages
Décompresser l'archive et téléverser les fichiers/dossiers dans le dépôt en remplaçant les fichiers du même nom. Ne pas supprimer le dépôt ni effacer les données du navigateur. Après publication, ouvrir l'application avec `?v=12` pour forcer le rechargement.
