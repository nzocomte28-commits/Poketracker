# Suite du projet PokéTracker

## Périmètre validé
- 30th japonais + 30th français
- Inclure les Pokémon/cartes de l'extension principale, variantes, promos et cartes de la Collection Classique selon les listes officielles retenues
- Exclure toutes les cartes Énergie
- Les 3 Mew RGB sont exclus du suivi

## Comment l'utiliser maintenant
Le ZIP contient une première maquette fonctionnelle. Pour l'instant, les cartes sont ajoutées manuellement et les prix sont saisis manuellement.

## Pour obtenir l'icône sur l'iPhone
Il faut d'abord publier le dossier sur une adresse HTTPS :
1. Créer un compte GitHub si nécessaire.
2. Créer un dépôt public nommé `poketracker`.
3. Décompresser le ZIP puis envoyer les fichiers du dossier `poketracker` à la racine du dépôt.
4. Dans GitHub : Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save.
5. Attendre que GitHub Pages affiche l'adresse du site.
6. Sur l'iPhone, ouvrir cette adresse dans Safari → Partager → Sur l'écran d'accueil → Ajouter.

Alternative : Netlify permet aussi de publier le dossier en glissant-déposant le dossier du projet dans son interface de déploiement.

## Avant de charger la checklist
Il faut consolider une liste vérifiée carte par carte pour les deux langues, en séparant clairement :
- cartes numérotées de l'extension principale ;
- variantes / cartes parallèles ;
- cartes promotionnelles ;
- cartes de la Collection Classique ;
- exclusions (Énergies et Mew RGB).

Ne pas utiliser un simple nombre total comme checklist : les variantes et promos peuvent être comptées différemment selon les bases.

## Prix
Le champ JPY et la conversion EUR fonctionnent déjà. Le taux est actuellement manuel (valeur initiale 165 JPY pour 1 EUR). Le suivi automatique nécessitera une source de prix qui autorise l'accès automatisé et une fréquence de mise à jour définie. Une actualisation quotidienne est un objectif réaliste à étudier ; du temps réel n'est pas garanti.
