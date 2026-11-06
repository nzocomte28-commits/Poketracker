# PokéTracker
Suivi de collection de cartes Pokémon (FR/JP). Site statique : `index.html` + `app.js`.

- **Catalogue** : généré depuis TCGdex par `scripts/build-catalog.mjs` (Actions → « Générer le catalogue »). Un fichier par extension dans `catalog/sets/`.
- **Données utilisateur** : `localStorage` (`poketracker-v3`), export/import JSON dans Profil.
- **Prix** : Cardmarket via TCGdex (cartes françaises). Cartes japonaises : prix saisi en ¥, converti en €.
- **Compte** : Supabase, optionnel (voir `SUPABASE.txt`).
