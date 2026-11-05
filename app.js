/* PokéTracker V26 — script unique. Sauvegarde : poketracker-v3 (migrée depuis poketracker-v2, l'ancienne clé n'est jamais supprimée). */
'use strict';
const KEY='poketracker-v3',OLD='poketracker-v2',CAT=window.CATALOG||{};
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eur=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n||0);
const jpy=n=>new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(n||0);
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
const deb=(f,ms=150)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>f(...a),ms)}};
const S=(title,label,code,flag,lang)=>({title,label,code,flag,lang});
const FR='BLOC MÉGA-ÉVOLUTION · FRANÇAIS',JP='BLOC MÉGA-ÉVOLUTION · JAPONAIS';
const sets={
 'meg-fr':S('Méga-Évolution',FR,'MEG · édition française','🇫🇷','fr'),'me02':S('Flammes Fantasmagoriques',FR,'ME02 · édition française','🇫🇷','fr'),
 'me025':S('Héros Transcendants',FR,'ME02.5 · édition française','🇫🇷','fr'),'me03':S('Équilibre Parfait',FR,'ME03 · édition française','🇫🇷','fr'),
 'me04':S('Chaos Ascendant',FR,'ME04 · édition française','🇫🇷','fr'),'me05':S('Nuit Noire',FR,'ME05 · édition française','🇫🇷','fr'),
 'mep':S('Promos Méga-Évolution','PROMOS · FRANÇAIS','Promos françaises','🇫🇷','fr'),
 'm1l-jp':S('Méga-Brave',JP,'M1L · édition japonaise','🇯🇵','jp'),'m1s-jp':S('Méga-Symphonia',JP,'M1S · édition japonaise','🇯🇵','jp'),
 '30-fr':S('30 ans Pokémon','30E ANNIVERSAIRE · FRANÇAIS','30C · édition française','🇫🇷','fr'),'30-jp':S('30th Anniversary','30E ANNIVERSAIRE · JAPONAIS','M6a · édition japonaise','🇯🇵','jp')};
const mega=Object.keys(sets),meta={};
const T=(id,name,desc,tone,s=[])=>({id,name,desc,tone,sets:s});
const blocks=[T('mega','Méga-Évolution','Les nouvelles aventures Méga','red',mega),T('sv','Écarlate et Violet','L’ère Écarlate et Violet','violet'),T('swsh','Épée et Bouclier','L’ère Épée et Bouclier','blue'),T('sm','Soleil et Lune','L’ère Soleil et Lune','orange'),T('xy','XY','L’ère XY','cyan'),T('bw','Noir et Blanc','L’ère Noir et Blanc','green'),T('older','Ères précédentes','Diamant et Perle, Platine et plus','gold')];

/* ---------- Données : seuls « possédée », prix et cartes à l'unité sont stockés ---------- */
function migrate(){
 const d={owned:{},prices:{},singles:[]},o=read(OLD);
 if(o&&Array.isArray(o.cards)){
  const al={'meg-fr':['meg-fr','me01','MEG'],'m1l-jp':['m1l-jp','M1L'],'m1s-jp':['m1s-jp','M1S'],'30-fr':['30-fr','fr'],'30-jp':['30-jp','jp']};
  for(const c of o.cards){const k=mega.find(k=>(al[k]||[k]).includes(String(c.set||c.language||'')));if(!k||c.number==null||c.number==='')continue;
   const id=k+':'+c.number;if(c.owned)d.owned[id]=1;if(c.priceFR||c.priceJP)d.prices[id]={fr:+c.priceFR||0,jp:+c.priceJP||0,t:0}}
  if(Array.isArray(o.singles))d.singles=o.singles}
 return d}
let db=read(KEY)||migrate();db={owned:{},prices:{},singles:[],...db};
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch{alert('Sauvegarde impossible : stockage plein ou bloqué par le navigateur. Exporte ta collection depuis Statistiques.')}}
const cache={};
const cardsOf=k=>cache[k]||(cache[k]=(CAT[k]||[]).map(c=>({...c,key:k+':'+(c.number??''),number:String(c.number??'')})));
const isOwned=c=>!!db.owned[c.key];
const price=c=>db.prices[c.key]||{};
const deal=c=>{const p=price(c);return p.t>0&&p.fr>0&&p.fr<=p.t};
const ownedN=k=>Object.keys(db.owned).filter(x=>x.startsWith(k+':')).length;
const totalN=k=>(CAT[k]?.length)||meta[k]?.count||0;
const started=()=>Object.keys(sets).filter(k=>ownedN(k)>0);
const SB={me:'mega',m:'mega',sv:'sv',swsh:'swsh',s:'swsh',sm:'sm',xy:'xy',bw:'bw'};
const blockOf=k=>mega.includes(k)?'mega':(SB[String(meta[k]?.serie||'').toLowerCase()]||'older');
const blockSets=b=>Object.keys(sets).filter(k=>blockOf(k)===b.id);

/* ---------- Navigation ---------- */
const pages=['landing','blocksPage','blockSetsPage','collectionShelf','pokedexPage','statsPage','collection'];
let cur='meg-fr',curBlock='mega',filter='all';
function show(id){pages.forEach(p=>$(p).hidden=p!==id);$('navMenu').classList.toggle('nav-active',id==='landing');window.scrollTo(0,0)}
function tile(k){const s=sets[k],t=totalN(k),n=ownedN(k),p=t?Math.round(n/t*100):0;
 return `<button class="set-tile" data-set="${k}"><span class="set-art">${s.flag}</span><b>${s.title}</b><small>${s.code}</small>${t?`<div class="mini-progress"><i style="width:${p}%"></i></div><em>${n}/${t} cartes →</em>`:'<em>Catalogue à venir</em>'}</button>`}
function renderHome(){const ks=started();$('myCollections').innerHTML=ks.map(tile).join('');$('noCollections').hidden=ks.length>0}
function openBlocks(){$('blocksGrid').innerHTML=blocks.map(b=>`<button class="block-tile ${b.tone}" data-block="${b.id}"><span class="block-mark">✦</span><b>${b.name}</b><small>${b.desc}</small><i>${blockSets(b).length?blockSets(b).length+' séries':'Catalogue à venir'} →</i></button>`).join('');show('blocksPage')}
function openBlock(id){const b=blocks.find(x=>x.id===id);if(!b)return;curBlock=id;$('blockEyebrow').textContent='BLOC · '+b.name;$('blockTitle').textContent=b.name;
 const ks=blockSets(b);$('blockSetsGrid').innerHTML=ks.length?ks.map(tile).join(''):'<p class="muted">Les extensions de cette ère seront ajoutées avec leurs données vérifiées.</p>';show('blockSetsPage')}
function openShelf(){const ks=started();$('shelfList').innerHTML=ks.map(tile).join('');$('emptyShelf').hidden=ks.length>0;show('collectionShelf')}
async function ensure(k){if(CAT[k])return true;try{const r=await fetch('catalog/sets/'+k+'.json');if(!r.ok)throw 0;CAT[k]=await r.json();delete cache[k];return true}catch{return false}}
async function openSet(k){cur=k;filter='all';$('search').value='';
 document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('selected',b.dataset.filter==='all'));
 show('collection');const s=sets[k];$('setLabel').textContent=s.label;$('setTitle').textContent=s.title;$('setSubtitle').textContent=s.code;
 if(!CAT[k]){$('cards').hidden=false;$('cards').innerHTML='<p class="muted">Chargement des cartes…</p>';$('empty').hidden=true}
 const ok=await ensure(k);if(cur!==k)return;
 if(!ok){const soon=!meta[k];$('cards').innerHTML=soon?'':'<p class="muted">Catalogue indisponible. Vérifie ta connexion.</p>';$('empty').hidden=!soon;return}
 const r=[...new Set(cardsOf(k).map(c=>c.rarity).filter(Boolean))];
 $('rarityFilter').innerHTML='<option value="">Toutes les raretés</option>'+r.map(x=>`<option>${esc(x)}</option>`).join('');$('rarityFilter').hidden=!r.length;render()}

/* ---------- Album ---------- */
function render(){
 const s=sets[cur],all=cardsOf(cur),q=norm($('search').value),r=$('rarityFilter').value;
 const shown=all.filter(c=>(filter==='all'||(filter==='owned')===isOwned(c))&&(!r||c.rarity===r)&&norm([c.name,c.number,c.rarity,c.category].join(' ')).includes(q));
 let v=0,rem=0,vj=0,rj=0;for(const c of all){const p=price(c);if(isOwned(c)){v+=p.fr||0;vj+=p.jp||0}else{rem+=p.fr||0;rj+=p.jp||0}}
 const n=all.filter(isOwned).length,pc=all.length?Math.round(n/all.length*100):0;
 $('setLabel').textContent=s.label;$('setTitle').textContent=s.title;$('setSubtitle').textContent=s.code;
 $('pct').textContent=pc+' %';$('owned').textContent=n;$('missing').textContent=all.length-n;$('bar').style.width=pc+'%';
 $('value').textContent=v?eur(v):'—';$('remain').textContent=rem?eur(rem):'—';$('valueJP').textContent=vj?jpy(vj):'—';$('remainJP').textContent=rj?jpy(rj):'—';
 $('valueJPWrap').hidden=$('remainJPWrap').hidden=s.lang!=='jp';
 $('cards').classList.add('album-grid');
 $('cards').innerHTML=shown.map(c=>`<button class="album-card ${isOwned(c)?'is-owned':'is-missing'}" data-detail="${esc(c.key)}"><span class="album-art">${c.image?`<img loading="lazy" decoding="async" src="${esc(c.image)}" alt="${esc(c.name)}">`:'<span class="album-no-image">✦</span>'}</span><span class="album-number">#${esc(c.number)}</span><span class="album-name">${esc(c.name)}</span>${deal(c)?'<span class="deal" title="Sous ton prix cible">🎯</span>':''}</button>`).join('');
 $('cards').hidden=!shown.length;$('empty').hidden=all.length>0;
 if(all.length&&!shown.length){$('cards').hidden=false;$('cards').innerHTML='<p class="meta">Aucun résultat.</p>'}}
function detail(key){
 const c=cardsOf(cur).find(x=>x.key===key);if(!c)return;const s=sets[cur],p=price(c);
 let d=$('cardDialog');if(!d){d=document.createElement('dialog');d.id='cardDialog';d.className='v23-dialog';document.body.appendChild(d)}
 const f=(k,l,v)=>`<label class="field">${l}<input type="number" inputmode="decimal" min="0" step="any" data-p="${k}" value="${v||''}" placeholder="—"></label>`;
 d.innerHTML=`<div class="v23-dialog-head"><b>FICHE CARTE</b><button data-close aria-label="Fermer">✕</button></div><div class="v23-detail-body">${c.image?`<img class="v23-detail-image" src="${esc(c.image)}" alt="">`:'<div class="v23-detail-placeholder">✦</div>'}<div class="v23-detail-info"><h2>${esc(c.name)}</h2><p>${esc(s.title)} · ${esc(c.number)}</p><dl><dt>Rareté</dt><dd>${esc(c.rarity||'Non renseignée')}</dd><dt>Type</dt><dd>${esc((c.types||[]).join(', ')||c.category||'—')}</dd><dt>PV</dt><dd>${esc(c.hp||'—')}</dd><dt>Illustrateur</dt><dd>${esc(c.illustrator||'Non renseigné')}</dd></dl><label class="v23-own-toggle"><input id="v23Own" type="checkbox" ${isOwned(c)?'checked':''}> Je possède cette carte</label><div class="fields">${f('fr','Prix observé (€)',p.fr)}${s.lang==='jp'?f('jp','Prix observé (¥)',p.jp):''}${f('t','Prix cible (€)',p.t)}</div></div></div>`;
 d.onchange=e=>{const t=e.target;
  if(t.id==='v23Own'){t.checked?db.owned[key]=1:delete db.owned[key]}
  else if(t.dataset.p){const o=db.prices[key]=db.prices[key]||{};o[t.dataset.p]=Math.max(0,parseFloat(String(t.value).replace(',','.'))||0)}
  save();render();renderHome()};
 d.querySelector('[data-close]').onclick=()=>d.close();d.showModal()}

/* ---------- Pokédex / recherche (accents ignorés, index construit une fois) ---------- */
let SX=null;
async function loadSearch(){if(SX)return SX;let a=null;try{const r=await fetch('catalog/search.json');if(r.ok)a=await r.json()}catch{}
 SX=(a||Object.keys(CAT).flatMap(k=>CAT[k].map(c=>[k,String(c.number),c.name]))).map(e=>({k:e[0],n:e[1],name:e[2],t:norm(e[2]+' '+e[1])}));return SX}
async function search(q,target){
 q=norm(q.trim());const el=$(target);
 if(q.length<2){el.innerHTML='<p class="muted">Tape au moins 2 lettres.</p>';return}
 const res=(await loadSearch()).filter(x=>x.t.includes(q)).slice(0,40);
 el.innerHTML=res.map(x=>{const im=(CAT[x.k]||[]).find(c=>String(c.number)===x.n)?.image;return `<article class="single-card">${im?`<img src="${esc(im)}" alt="" loading="lazy" decoding="async">`:'<div class="single-placeholder">✦</div>'}<div><b>${esc(x.name)}</b><small>${esc(sets[x.k]?.title||x.k)} · ${esc(x.n)}</small><button data-add="${esc(x.k+':'+x.n)}">Ajouter à mon Pokédex +</button></div></article>`}).join('')||'<p class="muted">Aucun résultat.</p>'}
async function addSingle(key){const i=key.indexOf(':'),k=key.slice(0,i),n=key.slice(i+1);
 if(db.singles.some(z=>z.id===key)||!(await ensure(k)))return;const c=cardsOf(k).find(x=>x.number===n);if(!c)return;
 db.singles.push({id:key,name:c.name,number:c.number,image:c.image||'',setName:sets[k]?.title||k});save();renderSingles();stats()}
function renderSingles(){
 $('singlesOwned').innerHTML=db.singles.map(x=>`<article class="single-card">${x.image?`<img src="${esc(x.image)}" alt="" loading="lazy">`:'<div class="single-placeholder">✦</div>'}<div><b>${esc(x.name)}</b><small>${esc(x.setName)} · ${esc(x.number)}</small><button data-rm="${esc(x.id)}">Retirer</button></div></article>`).join('');
 $('emptySingles').hidden=db.singles.length>0}

/* ---------- Statistiques, export / import ---------- */
function stats(){
 const ks=started(),own=Object.keys(db.owned);let value=0;own.forEach(x=>value+=db.prices[x]?.fr||0);
 $('statOwned').textContent=own.length;$('statSets').textContent=ks.length;$('statSingles').textContent=db.singles.length;
 $('statValue').textContent=value?eur(value):'—';
 $('statsSets').innerHTML=ks.map(k=>{const t=totalN(k),n=ownedN(k);return `<div class="stat-row"><span>${sets[k].flag} ${esc(sets[k].title)}</span><div class="mini-progress"><i style="width:${t?Math.round(n/t*100):0}%"></i></div><small>${n}/${t||'?'}</small></div>`}).join('')}
$('exportBtn').onclick=()=>{
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({app:'poketracker',version:3,date:new Date().toISOString(),data:db})],{type:'application/json'}));
 a.download='poketracker-sauvegarde-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500)};
$('importFile').onchange=async e=>{
 const f=e.target.files[0];e.target.value='';if(!f)return;
 try{const j=JSON.parse(await f.text()),d=j.data||j;
  if(!d||typeof d.owned!=='object'||typeof d.prices!=='object')throw new Error('format');
  if(!confirm('Remplacer ta collection actuelle par cette sauvegarde ?'))return;
  db={owned:d.owned,prices:d.prices,singles:Array.isArray(d.singles)?d.singles:[]};save();renderHome();renderSingles();stats();alert('Sauvegarde importée.')}
 catch{alert('Fichier invalide : choisis une sauvegarde PokéTracker (.json).')}};

/* ---------- Cartes par ligne (4 à 8) ---------- */
let cols=+(()=>{try{return localStorage.getItem('poketracker-cols')}catch{return 0}})()||4;
function applyCols(){const c=$('cards');c.style.setProperty('--cols',cols);c.classList.toggle('compact',cols>=6);document.querySelectorAll('[data-cols]').forEach(b=>b.classList.toggle('selected',+b.dataset.cols===cols))}
document.querySelectorAll('[data-cols]').forEach(b=>b.onclick=()=>{cols=+b.dataset.cols;try{localStorage.setItem('poketracker-cols',cols)}catch{}applyCols()});
applyCols();

/* ---------- Événements ---------- */
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-block],[data-set],[data-detail],[data-add],[data-rm],[data-home]');if(!t)return;const d=t.dataset;
 if(d.block)openBlock(d.block);else if(d.set)openSet(d.set);else if(d.detail)detail(d.detail);else if(d.add)addSingle(d.add);
 else if(d.rm){db.singles=db.singles.filter(x=>x.id!==d.rm);save();renderSingles();stats()}
 else{show('landing');renderHome()}});
$('tileSeries').onclick=openBlocks;$('tileCollection').onclick=openShelf;
$('tilePokedex').onclick=()=>{renderSingles();show('pokedexPage')};$('tileStats').onclick=()=>{stats();show('statsPage')};
$('navMenu').onclick=$('home').onclick=()=>{show('landing');renderHome()};
$('navSearch').onclick=()=>{$('searchOverlay').hidden=false;$('globalSearch').focus()};
$('closeSearch').onclick=()=>$('searchOverlay').hidden=true;
addEventListener('keydown',e=>{if(e.key==='Escape')$('searchOverlay').hidden=true});
$('globalSearch').oninput=deb(e=>search(e.target.value,'globalResults'));$('singleSearch').oninput=deb(e=>search(e.target.value,'singleResults'));
$('backBlocks').onclick=openBlocks;$('back').onclick=()=>openBlock(curBlock);
$('search').oninput=deb(render,100);$('rarityFilter').onchange=render;
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('selected',x===b));render()});
if(!read(KEY))save();
navigator.storage?.persist?.().catch(()=>{});
(async()=>{try{const r=await fetch('catalog/index.json');if(!r.ok)return;const x=await r.json();
 for(const e of x.sets||[]){meta[e.key]={serie:e.serie,count:e.count};if(sets[e.key])continue;
  const fr=e.lang!=='ja';sets[e.key]={title:e.name,label:'BLOC · '+String(e.serie).toUpperCase()+(fr?' · FRANÇAIS':' · JAPONAIS'),code:e.id+(fr?' · édition française':' · édition japonaise'),flag:fr?'🇫🇷':'🇯🇵',lang:fr?'fr':'jp'}}
 renderHome()}catch{}})();
renderHome();show('landing');
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
