
/* V22 navigation layer — preserves KEY='poketracker-v2' and existing checklist data */
const v22Blocks=[
 {id:'mega',name:'Méga-Évolution',desc:'Les nouvelles aventures Méga',tone:'red',sets:['meg-fr','me02','me025','me03','me04','me05','mep','m1l-jp','m1s-jp','30-fr','30-jp']},
 {id:'sv',name:'Écarlate et Violet',desc:'L’ère Écarlate et Violet',tone:'violet',sets:[]},
 {id:'swsh',name:'Épée et Bouclier',desc:'L’ère Épée et Bouclier',tone:'blue',sets:[]},
 {id:'sm',name:'Soleil et Lune',desc:'L’ère Soleil et Lune',tone:'orange',sets:[]},
 {id:'xy',name:'XY',desc:'L’ère XY',tone:'cyan',sets:[]},
 {id:'bw',name:'Noir et Blanc',desc:'L’ère Noir et Blanc',tone:'green',sets:[]},
 {id:'older',name:'Ères précédentes',desc:'Diamant et Perle, Platine et plus',tone:'gold',sets:[]}
];
let v22CurrentBlock='mega';
const v22Pages=['landing','blocksPage','blockSetsPage','collectionShelf','pokedexPage','statsPage','collection'];
function v22Show(id){v22Pages.forEach(x=>{const el=$(x);if(el)el.hidden=x!==id});window.scrollTo(0,0);document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('nav-active',b.id==='navMenu'))}
function v22OpenBlocks(){v22Show('blocksPage');$('blocksGrid').innerHTML=v22Blocks.map(b=>`<button class="block-tile ${b.tone}" data-v22-block="${b.id}"><span class="block-mark">✦</span><b>${b.name}</b><small>${b.desc}</small><i>${b.sets.length} série(s) référencée(s)　→</i></button>`).join('');}
function v22OpenBlock(id){const b=v22Blocks.find(x=>x.id===id);if(!b)return;v22CurrentBlock=id;$('blockEyebrow').textContent='BLOC · '+b.name;$('blockTitle').textContent=b.name;const keys=b.sets.filter(k=>sets[k]);$('blockSetsGrid').innerHTML=keys.length?keys.map(k=>{const s=sets[k],n=collectionCards(k).filter(c=>c.owned).length;return `<button class="set-tile" data-v22-set="${k}"><span class="set-art">${s.flag}</span><b>${s.title}</b><small>${s.code}</small><em>${n} carte(s) possédée(s)　→</em></button>`}).join(''):'<p class="muted">Les extensions de cette ère seront ajoutées au catalogue au fur et à mesure, avec leurs informations vérifiées.</p>';v22Show('blockSetsPage');}
function v22OpenShelf(){const startedSets=Object.keys(sets).filter(k=>collectionCards(k).length>0);$('shelfList').innerHTML=startedSets.map(k=>{const s=sets[k],a=collectionCards(k),o=a.filter(c=>c.owned).length,p=a.length?Math.round(o/a.length*100):0;return `<button class="set-tile" data-v22-set="${k}"><span class="set-art">${s.flag}</span><b>${s.title}</b><small>${s.code}</small><div class="mini-progress"><i style="width:${p}%"></i></div><em>${o}/${a.length} cartes possédées　→</em></button>`}).join('');$('emptyShelf').hidden=startedSets.length>0;v22Show('collectionShelf');}
function v22CatalogMatches(q){const all=[];const cat=window.CATALOG||{};Object.entries(cat).forEach(([setKey,list])=>{if(!Array.isArray(list))return;list.forEach(c=>{const name=String(c.name||'');if(!q||name.toLowerCase().includes(q)||String(c.number||c.n||'').toLowerCase().includes(q))all.push({setKey,c})})});return all.slice(0,40);}
function v22SingleCardHtml(x){const c=x.c,s=sets[x.setKey]||{};return `<article class="single-card">${(c.image||c.img)?`<img src="${c.image||c.img}" loading="lazy" alt="">`:'<div class="single-placeholder">✦</div>'}<div><b>${esc(c.name||'Carte Pokémon')}</b><small>${esc(s.title||x.setKey)} · ${esc(c.number||c.n||'')}</small><button data-add-single="${esc(x.setKey+'|'+(c.number||c.n||c.name))}">Ajouter à mon Pokédex +</button></div></article>`}
function v22Search(q,target){const matches=v22CatalogMatches(q.toLowerCase());$(target).innerHTML=matches.map(v22SingleCardHtml).join('')||'<p class="muted">Aucun résultat dans les catalogues actuellement intégrés.</p>';}
function v22Singles(){if(!Array.isArray(db.singles))db.singles=[];$('singlesOwned').innerHTML=db.singles.map(x=>`<article class="single-card">${x.image?`<img src="${esc(x.image)}" alt="">`:'<div class="single-placeholder">✦</div>'}<div><b>${esc(x.name)}</b><small>${esc(x.setName)} · ${esc(x.number)}</small><button data-remove-single="${esc(x.id)}">Retirer</button></div></article>`).join('');$('emptySingles').hidden=db.singles.length>0;}
function v22Stats(){const startedSets=Object.keys(sets).filter(k=>collectionCards(k).length>0);$('statOwned').textContent=db.cards.filter(c=>c.owned).length;$('statSets').textContent=startedSets.length;$('statSingles').textContent=(db.singles||[]).length;}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-v22-block]');if(b)v22OpenBlock(b.dataset.v22Block);
 const s=e.target.closest('[data-v22-set]');if(s)openSet(s.dataset.v22Set);
 const add=e.target.closest('[data-add-single]');if(add){const [setKey,identifier]=add.dataset.addSingle.split('|');const found=v22CatalogMatches(identifier.toLowerCase()).find(x=>x.setKey===setKey);if(found){if(!Array.isArray(db.singles))db.singles=[];const c=found.c,id=setKey+'-'+(c.number||c.n||c.name);if(!db.singles.some(x=>x.id===id))db.singles.push({id,name:c.name||'Carte Pokémon',number:c.number||c.n||'',image:c.image||c.img||'',setName:sets[setKey]?.title||setKey});localStorage.setItem(KEY,JSON.stringify(db));v22Singles();v22Stats();}}
 const rem=e.target.closest('[data-remove-single]');if(rem){db.singles=(db.singles||[]).filter(x=>x.id!==rem.dataset.removeSingle);localStorage.setItem(KEY,JSON.stringify(db));v22Singles();v22Stats();}
 if(e.target.closest('[data-home]')){v22Show('landing');}
});
$('tileSeries').addEventListener('click',v22OpenBlocks);
$('tileCollection').addEventListener('click',v22OpenShelf);
$('tilePokedex').addEventListener('click',()=>{v22Show('pokedexPage');v22Singles();});
$('tileStats').addEventListener('click',()=>{v22Stats();v22Show('statsPage');});
$('navMenu').addEventListener('click',()=>v22Show('landing'));
$('navSearch').addEventListener('click',()=>{$('searchOverlay').hidden=false;$('globalSearch').focus();});
$('closeSearch').addEventListener('click',()=>$('searchOverlay').hidden=true);
$('globalSearch').addEventListener('input',e=>v22Search(e.target.value.trim(),'globalResults'));
$('singleSearch').addEventListener('input',e=>v22Search(e.target.value.trim(),'singleResults'));
$('backBlocks').addEventListener('click',v22OpenBlocks);
$('back').addEventListener('click',()=>v22OpenBlock(v22CurrentBlock));
/* Replace the old landing actions with the V22 navigation. */
$('exploreCollections').addEventListener('click',v22OpenBlocks);
$('home').addEventListener('click',()=>v22Show('landing'));
const v22OldRenderHome=renderHome;
renderHome=()=>{v22OldRenderHome();v22Stats();};
v22Show('landing');renderHome();
