# V18 — correction de navigation + catalogue

Cette version corrige les actions du bouton « Explorer les collections », du choix de langue, du retour à l’accueil, des filtres et des cases « Possédée ». Elle conserve la clé localStorage `poketracker-v2` et ne supprime aucune carte déjà enregistrée.

Le ZIP contient le générateur du catalogue. Les listes et images ne sont pas préchargées dans le ZIP : il faut que GitHub Actions exécute `scripts/build-catalog.mjs` pour remplir `catalog-data.js` et `catalog/images/`.

Après l’envoi des fichiers sur la branche `main`, vérifier les journaux de l’action Catalogue. Un workflow rouge signifie qu’au moins une série n’a pas pu être récupérée.
