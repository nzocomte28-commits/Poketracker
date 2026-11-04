# V17 — étape indispensable
Le ZIP ne contient pas les images téléchargées : GitHub Actions doit exécuter `scripts/build-catalog.mjs` pour remplir `catalog-data.js` et `catalog/images/`.
Vérifier les logs pour chaque série. Si un identifiant n'existe pas, le script essaie le nom de série (FR ou JP). Les séries manquantes sont signalées par un workflow rouge plutôt que de prétendre que le catalogue est complet.
