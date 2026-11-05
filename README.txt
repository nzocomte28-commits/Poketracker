POKÉTRACKER V22 — PACK COMPLET DE MISE EN PAGE ET NAVIGATION

Contenu :
- index.html : accueil en 4 tuiles, pages blocs/extensions, classeurs, Pokédex, statistiques, barre flottante et recherche.
- styles.css : identité noire/rouge, typographies rétro, navigation translucide.
- v22-navigation.js : couche de navigation à ajouter à la fin de app.js actuel.

IMPORTANT :
Ce pack est une maquette fonctionnelle de navigation, pas une mise à jour déjà publiée.
Pour protéger les cartes cochées, ne remplace PAS app.js par un fichier neuf.
La clé de sauvegarde reste poketracker-v2.

Installation prudente :
1. Faire une copie de sauvegarde des fichiers GitHub actuels.
2. Remplacer index.html par celui du pack.
3. Remplacer styles.css par celui du pack.
4. Ouvrir app.js, aller à la fin et ajouter le contenu de v22-navigation.js.
5. Dans index.html, vérifier que les scripts catalog-data.js puis app.js sont chargés en bas.
6. Commit les changements, puis tester le site.

LIMITES DE CETTE MAQUETTE :
- Le catalogue actuel contient uniquement les séries déjà présentes dans l'application ; les autres ères sont des emplacements visuels, pas des extensions inventées.
- La recherche à l'unité ne trouve que les cartes des catalogues déjà intégrés.
- Les cartes ajoutées au Pokédex sont stockées dans db.singles, dans la même sauvegarde poketracker-v2.
- Les prix et la synchronisation des données de marché ne sont pas ajoutés dans cette version.
