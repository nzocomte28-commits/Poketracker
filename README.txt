POKETRACKER V21 — PATCH GAME BOY

Cette première mise à jour applique le thème Game Boy / Pokédex et ajoute un petit tableau de statistiques sur l'accueil.
Elle conserve impérativement la clé localStorage poketracker-v2.

1) Dans GitHub, ouvre le dépôt Poketracker puis styles.css.
2) Appuie sur le crayon, va tout en bas, colle le contenu de v21-gameboy.css, puis Commit changes.
3) Ouvre index.html, remplace le paragraphe d'introduction exact :
<p class="muted">Retrouve tes collections et complète tes Master Sets, carte après carte.</p>
par :
<p class="muted">Retrouve tes collections et complète tes Master Sets, carte après carte.</p>
<div class="gb-screen-label"><span>POKÉDEX · MODE COLLECTION</span><i>● GAME BOY STYLE</i></div>
<div class="gb-stats"><div class="gb-stat"><span>Cartes possédées</span><b id="globalOwned">0</b></div><div class="gb-stat"><span>Cartes suivies</span><b id="globalTotal">0</b></div><div class="gb-stat"><span>Progression</span><b id="globalPct">0%</b></div></div>
Puis remplace les deux références en bas de page :
catalog-data.js?v=18 -> catalog-data.js?v=21
app.js?v=18 -> app.js?v=21
4) Ouvre app.js. Dans la fonction renderHome(), juste après la ligne :
function renderHome(){
ajoute :
 const globalOwned=db.cards.filter(c=>c.owned).length,globalTotal=db.cards.length,globalPct=globalTotal?Math.round(globalOwned/globalTotal*100):0;
 if($('globalOwned'))$('globalOwned').textContent=globalOwned;
 if($('globalTotal'))$('globalTotal').textContent=globalTotal;
 if($('globalPct'))$('globalPct').textContent=globalPct+'%';
5) Ouvre sw.js et remplace poketracker-v18 par poketracker-v21.

IMPORTANT : ne supprime pas localStorage, ne modifie pas KEY='poketracker-v2', ne remplace pas catalog-data.js.
