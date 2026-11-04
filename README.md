# PokéTracker V17

## Ce qui change
- Suppression de l'ajout manuel de cartes et de la fenêtre de saisie.
- L'accueil conserve « Mes séries » et le bouton « Explorer les collections ».
- Les checklists sont alimentées par le catalogue généré automatiquement.
- Le générateur récupère noms, numéros, raretés, catégories, types, PV, illustrateurs, variantes et images.
- Les cartes de catégorie Énergie/Energy sont exclues ; les cartes Dresseur contenant le mot « Énergie » sont conservées.
- Identifiants séparés : MEG français (`me01`), M1L japonais et M1S japonais.

## Important : catalogue pas encore préchargé dans ce ZIP
`catalog-data.js` est encore vide au départ. Pour récupérer les cartes et images :
1. Importer les fichiers dans le dépôt GitHub.
2. Ouvrir Actions > « Générer le catalogue PokéTracker » > Run workflow.
3. Vérifier le journal de l'action : le workflow échoue si une série ne peut pas être récupérée.
4. Après le commit automatique, ouvrir le site avec `?v=17`.

La clé localStorage `poketracker-v2` est conservée. Ne pas effacer les données Safari.
