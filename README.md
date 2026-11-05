# PokéTracker
Suivi de collection de cartes Pokémon (FR/JP). Site statique : `index.html` + `app.js` + `catalog-data.js`.

- **Catalogue** : généré depuis TCGdex par `scripts/build-catalog.mjs` (GitHub Actions → « Générer le catalogue »). Séries listées dans `catalog-sets.json`.
- **Données utilisateur** : `localStorage` (clé `poketracker-v3`, migration automatique depuis `poketracker-v2`). Export/import JSON dans Statistiques.
- **À ajouter** : 30th Anniversary (FR/JP) dès que l'identifiant TCGdex est confirmé → nouvelle entrée dans `catalog-sets.json`.
