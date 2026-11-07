/* PokéTracker V44 — prix Cardmarket, fiches complètes, synchronisation Supabase, noms anglais pour le japonais.
   Sauvegarde conservée : poketracker-v3. */
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
 'm1l-jp':S('Mega Brave',JP,'M1L · édition japonaise','🇯🇵','jp'),'m1s-jp':S('Mega Symphonia',JP,'M1S · édition japonaise','🇯🇵','jp'),
 '30-fr':S('30 ans Pokémon','30E ANNIVERSAIRE · FRANÇAIS','30C · édition française','🇫🇷','fr'),'30-jp':S('30th Celebration','30E ANNIVERSAIRE · JAPONAIS','M6a · édition japonaise','🇯🇵','jp')};
const mega=Object.keys(sets),meta={},kids={},kidOf={};
const T=(id,name,desc,tone,s=[])=>({id,name,desc,tone,sets:s});
const blocks=[T('mega','Méga-Évolution','Les nouvelles aventures Méga','lime',mega),T('sv','Écarlate et Violet','L’ère Écarlate et Violet','violet'),T('swsh','Épée et Bouclier','L’ère Épée et Bouclier','pink'),T('sm','Soleil et Lune','L’ère Soleil et Lune','orange'),T('xy','XY','L’ère XY','red'),T('bw','Noir et Blanc','L’ère Noir et Blanc','slate'),T('older','Ères précédentes','Diamant et Perle, Platine et plus','gold')];

/* ---------- Données : seuls « possédée », prix et cartes à l'unité sont stockés ---------- */
function migrate(){
 const d={owned:{},prices:{},singles:[]},o=read(OLD);
 if(o&&Array.isArray(o.cards)){
  const al={'meg-fr':['meg-fr','me01','MEG'],'m1l-jp':['m1l-jp','M1L'],'m1s-jp':['m1s-jp','M1S'],'30-fr':['30-fr'],'30-jp':['30-jp','M6a']};
  for(const c of o.cards){const legacySet=String(c.set||'');const k=mega.find(k=>(al[k]||[k]).includes(legacySet));if(!k||c.number==null||c.number==='')continue;
   const id=k+':'+c.number;if(c.owned)d.owned[id]=1;if(c.priceFR||c.priceJP)d.prices[id]={fr:+c.priceFR||0,jp:+c.priceJP||0,t:0}}
  if(Array.isArray(o.singles))d.singles=o.singles}
 return d}
let db=read(KEY)||migrate();db={owned:{},prices:{},singles:[],...db};
function save(push=true){if(push)db._t=Date.now();try{localStorage.setItem(KEY,JSON.stringify(db))}catch{alert('Sauvegarde impossible : stockage plein ou bloqué par le navigateur. Exporte ta collection depuis Statistiques.')}if(push)pushSoon()}
const cache={};
const cardsOf=k=>cache[k]||(cache[k]=[k,...(kids[k]||[])].flatMap(s=>(CAT[s]||[]).map(c=>({...c,key:s+':'+(c.number??''),number:String(c.number??'')}))));
const isOwned=c=>!!db.owned[c.key];
const price=c=>db.prices[c.key]||{};
const deal=c=>{const p=price(c);return p.t>0&&p.fr>0&&p.fr<=p.t};
const ownedN=k=>{const g=[k,...(kids[k]||[])];return Object.keys(db.owned).filter(x=>g.some(s=>x.startsWith(s+':'))).length};
const totalN=k=>[k,...(kids[k]||[])].reduce((n,s)=>n+((CAT[s]?.length)||meta[s]?.count||0),0);
const started=()=>Object.keys(sets).filter(k=>!kidOf[k]&&ownedN(k)>0);
const SB={me:'mega',m:'mega',sv:'sv',swsh:'swsh',s:'swsh',sm:'sm',xy:'xy',bw:'bw'};
const blockOf=k=>mega.includes(k)?'mega':(SB[String(meta[k]?.serie||'').toLowerCase()]||'older');
const blockSets=b=>Object.keys(sets).filter(k=>!kidOf[k]&&blockOf(k)===b.id);
const SL={};let langF=(()=>{try{return localStorage.getItem('poketracker-lang')}catch{return null}})()==='jp'?'jp':'fr';
const toneOf=k=>(blocks.find(b=>b.id===blockOf(k))||{}).tone||'slate';
const BLOCK_BASE={mega:'meg-fr',sv:'sv01',swsh:'swsh1',sm:'sm1',xy:'xy1',bw:'bw1',older:'base1'};
const logoOf=b=>meta[BLOCK_BASE[b.id]]?.logo||SL[b.id==='mega'?'me':b.id]||'';
const codeOf=k=>meta[k]?.id||String(sets[k].code).split(' ·')[0];
const imgTag=(u,c,alt='',fb='',fbc='set-codebig',cover='')=>u?`<img class="${c}" src="${esc(u)}.webp" alt="${esc(alt)}" loading="lazy" decoding="async" data-fb="${esc(fb)}" data-fbc="${fbc}" data-cover="${esc(cover)}">`:'';
/* Carte sans image dans TCGdex : on essaie l'adresse standard (FR puis EN) avant d'afficher ✦ */
function cardImg(c,cls){
 if(c.image)return `<img ${cls?`class="${cls}" `:''}loading="lazy" decoding="async" src="${esc(c.image)}" alt="${esc(c.name)}">`;
 const m=meta[keySet(c.key)],ph=cls?'v23-detail-placeholder':'album-no-image',empty=cls?`<div class="${ph}">✦</div>`:`<span class="${ph}">✦</span>`;
 if(!m||m.lang!=='fr')return empty;
 const u=l=>`https://assets.tcgdex.net/${l}/${m.serie}/${m.id}/${c.number}/low.webp`;
 return `<img ${cls?`class="${cls}" `:''}loading="lazy" decoding="async" src="${esc(u('fr'))}" data-alt="${esc(u('en'))}" data-noimg="${ph}" alt="${esc(c.name)}">`}
addEventListener('error',e=>{const i=e.target;if(i&&i.tagName==='IMG'&&i.dataset.alt){const a=i.dataset.alt;i.dataset.alt='';i.src=a;return}
 if(i&&i.tagName==='IMG'&&i.dataset.noimg){const s=document.createElement(i.dataset.noimg==='album-no-image'?'span':'div');s.className=i.dataset.noimg;s.textContent='✦';i.replaceWith(s);return}
 if(i&&i.tagName==='IMG'&&i.dataset.cover){const c=document.createElement('img');c.className='set-cover';c.src=i.dataset.cover;c.alt='';c.loading='lazy';i.replaceWith(c);return}
 if(i&&i.tagName==='IMG'&&i.dataset.fbc){const s=document.createElement('span');s.className=i.dataset.fbc;s.textContent=i.dataset.fb||'';i.replaceWith(s)}},true);
function chips(b){const all=blockSets(b),cnt=l=>all.filter(k=>sets[k].lang===l).length;let c=$('langChips');if(!c){c=document.createElement('div');c.id='langChips';c.className='seg';$('blockSetsGrid').before(c)}
 c.innerHTML=[['fr','🇫🇷 Français · '+cnt('fr')],['jp','🇯🇵 Japonais · '+cnt('jp')]].map(([v,l])=>`<button data-lang="${v}" class="${langF===v?'selected':''}">${l}</button>`).join('')}

/* ---------- Navigation ---------- */
const pages=['landing','blocksPage','blockSetsPage','collectionShelf','pokedexPage','statsPage','collection'];
let cur='meg-fr',curBlock='mega',filter='all';
let activePage='landing',setReturnPage='blockSetsPage',setReturnScroll=0;
function show(id){pages.forEach(p=>$(p).hidden=p!==id);activePage=id;
 $('navMenu').classList.toggle('nav-active',id==='landing');
 $('navProfile').classList.toggle('nav-active',id==='statsPage');
 window.scrollTo(0,0)}
function tile(k){const s=sets[k],t=totalN(k),n=ownedN(k),p=t?Math.round(n/t*100):0;
 return `<button class="set-card tone-${toneOf(k)}${t&&n>=t?' is-complete':''}" data-set="${k}"><span class="set-stage">${imgTag(meta[k]?.logo,'set-logo',s.title,codeOf(k),'set-codebig',meta[k]?.cover)||`<span class="set-codebig">${esc(codeOf(k))}</span>`}</span><span class="set-foot"><span class="set-text"><b>${esc(s.title)}</b><small>${s.flag} ${t?n+' / '+t:'Bientôt'}</small></span>${t?`<span class="ring" style="--p:${p}"><i>${p}</i></span>`:''}</span></button>`}
function renderHome(){const ks=started();$('myCollections').innerHTML=ks.map(tile).join('');$('noCollections').hidden=ks.length>0;
 const total=Object.values(meta).reduce((n,x)=>n+(Number(x.count)||0),0)||Object.values(CAT).reduce((n,x)=>n+(Array.isArray(x)?x.length:0),0);
 $('pokedexOwnedCount').textContent=db.singles.length.toLocaleString('fr-FR');
}
function openBlocks(){$('blocksGrid').innerHTML=blocks.map(b=>{const ks=blockSets(b),t=ks.reduce((a,k)=>a+totalN(k),0),n=ks.reduce((a,k)=>a+ownedN(k),0),p=t?Math.round(n/t*100):0;
 return `<button class="block-card tone-${b.tone}" data-block="${b.id}"><span class="block-stage">${imgTag(logoOf(b),'block-logo',b.name,b.name,'block-name-big')||`<span class="block-name-big">${esc(b.name)}</span>`}</span><span class="block-foot"><span class="set-text"><b>${esc(b.name)}</b><small>${ks.length?ks.length+' séries · '+n.toLocaleString('fr-FR')+' / '+t.toLocaleString('fr-FR')+' cartes':'Catalogue à venir'}</small></span>${t?`<span class="ring" style="--p:${p}"><i>${p}</i></span>`:''}</span></button>`}).join('');show('blocksPage')}
function openBlock(id){const b=blocks.find(x=>x.id===id);if(!b)return;curBlock=id;$('blockEyebrow').textContent='BLOC · '+b.name;$('blockTitle').innerHTML=imgTag(logoOf(b),'hero-logo',b.name,b.name,'hero-name')||esc(b.name);$('blockSetsPage').dataset.tone=b.tone;
 const ks=blockSets(b).filter(k=>sets[k].lang===langF);chips(b);$('blockSetsGrid').innerHTML=ks.length?ks.map(tile).join(''):'<p class="muted">Aucune série dans cette langue pour le moment.</p>';show('blockSetsPage')}
function openShelf(){const ks=started();$('shelfList').innerHTML=ks.map(tile).join('');$('emptyShelf').hidden=ks.length>0;show('collectionShelf')}
const ensureJobs={};
async function ensure(k){return(await Promise.all([k,...(kids[k]||[])].map(ensureOne))).every(Boolean)}
async function ensureOne(k){if(CAT[k])return true;if(ensureJobs[k])return ensureJobs[k];
 ensureJobs[k]=(async()=>{try{const r=await fetch('catalog/sets/'+k+'.json');if(!r.ok)throw 0;CAT[k]=await r.json();delete cache[k];delete cache[kidOf[k]];return true}catch{return false}finally{delete ensureJobs[k]}})();return ensureJobs[k]}
async function openSet(k){setReturnPage=activePage==='collectionShelf'?'collectionShelf':'blockSetsPage';setReturnScroll=window.scrollY;
 $('back').textContent=setReturnPage==='collectionShelf'?'← Retour à ma collection':'← Retour aux séries';
 cur=k;filter='all';$('search').value='';
 document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('selected',b.dataset.filter==='all'));
 show('collection');const s=sets[k];$('setLabel').textContent=s.label;$('setTitle').textContent=s.title;$('setSubtitle').textContent=s.code;
 if(!CAT[k]||(kids[k]||[]).some(s=>!CAT[s])){$('cards').hidden=false;$('cards').innerHTML='<p class="muted">Chargement des cartes…</p>';$('empty').hidden=true}
 const ok=await ensure(k);if(cur!==k)return;
 if(!ok){const soon=!meta[k];$('cards').innerHTML=soon?'':'<p class="muted">Catalogue indisponible. Vérifie ta connexion.</p>';$('empty').hidden=!soon;return}
 const r=[...new Set(cardsOf(k).map(c=>c.rarity).filter(Boolean))];
 $('rarityFilter').innerHTML='<option value="">Toutes les raretés</option>'+r.map(x=>`<option>${esc(x)}</option>`).join('');$('rarityFilter').hidden=!r.length;render()}

/* ---------- Album ---------- */
function renderHead(){const s=sets[cur],all=cardsOf(cur);
 let v=0,rem=0,vj=0,rj=0;for(const c of all){const p=price(c),x=priceOf(c.key);if(isOwned(c)){v+=x;vj+=p.jp||0}else{rem+=x;rj+=p.jp||0}}
 const n=all.filter(isOwned).length,pc=all.length?Math.round(n/all.length*100):0;
 $('setLabel').textContent=s.label;$('setTitle').textContent=s.title;$('setSubtitle').textContent=s.code;
 $('pct').textContent=pc+' %';$('owned').textContent=n;$('missing').textContent=all.length-n;$('bar').style.width=pc+'%';
 $('value').textContent=v?eur(v):'—';$('remain').textContent=rem?eur(rem):'—';
 $('valueJP').textContent=vj?jpy(vj)+(fxRate?' · ≈ '+jpyEUR(vj):''):'—';$('remainJP').textContent=rj?jpy(rj)+(fxRate?' · ≈ '+jpyEUR(rj):''):'—';
 $('valueJPWrap').hidden=$('remainJPWrap').hidden=s.lang!=='jp';
}
function render(){
 const s=sets[cur],all=cardsOf(cur),q=norm($('search').value),r=$('rarityFilter').value;
 let shown=all.filter(c=>(filter==='all'||(filter==='owned'&&isOwned(c))||(filter==='missing'&&!isOwned(c))||(filter==='deal'&&deal(c)))&&(!r||c.rarity===r)&&norm([c.name,c.number,c.rarity,c.category].join(' ')).includes(q));
 const so=$('sortSel')?.value||'num';
 if(so!=='num'){const up=so==='priceAsc',pr=c=>priceOf(c.key)||(up?1e9:-1);shown=[...shown].sort((a,b)=>up?pr(a)-pr(b):pr(b)-pr(a))}
 renderHead();
 $('cards').classList.add('album-grid');
 $('cards').innerHTML=shown.map(c=>`<button class="album-card ${isOwned(c)?'is-owned':'is-missing'}" data-card="${esc(c.key)}"><span class="info-dot" data-detail="${esc(c.key)}" aria-label="Fiche">ⓘ</span><span class="album-art">${cardImg(c,'')}</span><span class="album-number">#${esc(c.number)}</span><span class="album-name">${esc(c.name)}</span>${deal(c)?'<span class="deal" title="Sous ton prix cible">🎯</span>':''}</button>`).join('');
 $('cards').hidden=!shown.length;$('empty').hidden=all.length>0;
 if(all.length&&!shown.length){$('cards').hidden=false;$('cards').innerHTML='<p class="meta">Aucun résultat.</p>'}}
function detail(key){
 const c=cardsOf(cur).find(x=>x.key===key);if(!c)return;const s=sets[cur],p=price(c);
 let d=$('cardDialog');if(!d){d=document.createElement('dialog');d.id='cardDialog';d.className='v23-dialog';document.body.appendChild(d)}
 const f=(k,l,v)=>`<label class="field">${l}<input type="number" inputmode="decimal" min="0" step="any" data-p="${k}" value="${v||''}" placeholder="—"></label>`;
 const vr=Object.keys(c.variants||{}).filter(x=>c.variants[x]===true).join(', ');
 d.innerHTML=`<div class="v23-dialog-head"><b>FICHE CARTE</b><button data-close aria-label="Fermer">✕</button></div><div class="v23-detail-body">${cardImg(c,'v23-detail-image')}<div class="v23-detail-info"><h2>${esc(c.name)}</h2><p>${esc((sets[keySet(key)]||s).title)} · ${esc(c.number)}</p><dl><dt>Rareté</dt><dd>${esc(c.rarity||'Non renseignée')}</dd><dt>Type</dt><dd>${esc((c.types||[]).join(', ')||c.category||'—')}</dd><dt>PV</dt><dd>${esc(c.hp||'—')}</dd><dt>Illustrateur</dt><dd>${esc(c.illustrator||'Non renseigné')}</dd>${vr?`<dt>Variantes</dt><dd>${esc(vr)}</dd>`:''}</dl>${priceBlock(key)}<label class="v23-own-toggle"><input id="v23Own" type="checkbox" ${isOwned(c)?'checked':''}> Je possède cette carte</label><div class="fields">${f('fr','Mon prix observé (€)',p.fr)}${s.lang==='jp'?f('jp','Prix observé (¥)',p.jp)+`<small class="muted" id="jpEuroEstimate">Équivalent : ${p.jp?jpyEUR(p.jp):'—'}</small>`:''}${f('t','Prix cible (€)',p.t)}</div></div></div>`;
 d.onchange=e=>{const t=e.target;
  if(t.id==='v23Own'){t.checked?db.owned[key]=1:delete db.owned[key]}
  else if(t.dataset.p){const o=db.prices[key]=db.prices[key]||{};o[t.dataset.p]=Math.max(0,parseFloat(String(t.value).replace(',','.'))||0);if(t.dataset.p==='jp'&&$('jpEuroEstimate'))$('jpEuroEstimate').textContent='Équivalent : '+(o.jp?jpyEUR(o.jp):'—')}
  save();render();renderHome()};
 d.querySelector('[data-close]').onclick=()=>d.close();d.showModal();fillPrice(key)}

/* ---------- Pokédex / recherche ---------- */
let SX=null;
async function loadSearch(){if(SX)return SX;let a=null;try{const r=await fetch('catalog/search.json');if(r.ok)a=await r.json()}catch{}
 SX=(a||Object.keys(CAT).flatMap(k=>CAT[k].map(c=>[k,String(c.number),c.name]))).map(e=>({k:e[0],n:e[1],name:e[2],t:norm(e[2]+' '+e[1])}));return SX}
function sameCardNumber(a,b){const x=String(a??''),y=String(b??'');return x===y||(/^\d+$/.test(x)&&/^\d+$/.test(y)&&Number(x)===Number(y))}
async function search(q,target){
 q=norm(q.trim());const el=$(target);
 if(q.length<2){el.innerHTML='<p class="muted">Tape au moins 2 lettres.</p>';return}
 const res=(await loadSearch()).filter(x=>x.t.includes(q)).slice(0,40);
 const keys=[...new Set(res.map(x=>x.k))];await Promise.all(keys.map(ensure));
 el.innerHTML=res.map(x=>{const c=cardsOf(x.k).find(c=>String(c.number)===String(x.n));const im=c?.image||'';const key=x.k+':'+x.n;
 return `<article class="single-card single-result-card" data-single-detail="${esc(key)}"><div class="single-card-image">${im?`<img src="${esc(im)}" alt="${esc(x.name)}" loading="lazy" decoding="async">`:'<div class="single-placeholder">✦</div>'}</div><b>${esc(x.name)}</b><small>${esc(sets[x.k]?.title||x.k)} · ${esc(x.n)}</small><button data-add="${esc(key)}">Ajouter +</button></article>`}).join('')||'<p class="muted">Aucun résultat.</p>'
}
async function addSingle(key){const i=key.indexOf(':'),k=key.slice(0,i),n=key.slice(i+1);
 if(db.singles.some(z=>z.id===key))return;
 const btn=document.querySelector(`[data-add="${CSS.escape(key)}"]`);if(btn){btn.disabled=true;btn.textContent='Ajout…'}
 if(!(await ensure(k))){if(btn){btn.disabled=false;btn.textContent='Réessayer'}return}
 const c=cardsOf(k).find(x=>x.number===n);if(!c)return;
 db.singles.push({id:key,name:c.name,number:c.number,image:c.image||'',setName:sets[k]?.title||k});save();renderSingles();stats();
}
function renderSingles(){
 $('singlesOwned').innerHTML=db.singles.map(x=>`<article class="single-card single-owned-card" data-single-detail="${esc(x.id)}"><div class="single-card-image">${x.image?`<img src="${esc(x.image)}" alt="${esc(x.name)}" loading="lazy" decoding="async">`:'<div class="single-placeholder">✦</div>'}</div><b>${esc(x.name)}</b><small>${esc(x.setName)} · ${esc(x.number)}</small><button data-rm="${esc(x.id)}">Retirer</button></article>`).join('');
 $('emptySingles').hidden=db.singles.length>0;updatePokedexTile();
}
function updatePokedexTile(){const a=$('pokedexOwnedCount');if(a)a.textContent=db.singles.length.toLocaleString('fr-FR')}
async function singleDetail(key){
 const i=key.indexOf(':'),k=key.slice(0,i),n=key.slice(i+1);if(!(await ensure(k)))return;
 const c=cardsOf(k).find(x=>x.number===n);if(!c)return;
 let d=$('singleCardDialog');if(!d){d=document.createElement('dialog');d.id='singleCardDialog';d.className='v23-dialog';document.body.appendChild(d)}
 const owned=db.singles.some(x=>x.id===key),p=db.prices[key]||{};
 d.innerHTML=`<div class="v23-dialog-head"><b>FICHE CARTE · POKÉDEX</b><button data-close aria-label="Retour au Pokédex">✕</button></div><div class="v23-detail-body">${cardImg(c,'v23-detail-image')}<div class="v23-detail-info"><h2>${esc(c.name)}</h2><p>${esc(sets[k]?.title||k)} · ${esc(c.number)}</p><dl><dt>Rareté</dt><dd>${esc(c.rarity||'Non renseignée')}</dd><dt>Type</dt><dd>${esc((c.types||[]).join(', ')||c.category||'—')}</dd><dt>PV</dt><dd>${esc(c.hp||'—')}</dd><dt>Illustrateur</dt><dd>${esc(c.illustrator||'Non renseigné')}</dd><dt>Évolution</dt><dd>${esc((Array.isArray(c.evolveFrom)?c.evolveFrom:[c.evolveFrom].filter(Boolean)).join(', ')||'—')}</dd></dl>${priceBlock(key)}<label class="field">Prix de ma carte (€)<input type="number" inputmode="decimal" min="0" step="0.01" id="singleCardPrice" value="${p.fr||''}" placeholder="Saisir un prix"></label><p class="muted">Tu peux renseigner ici le prix estimé ou la valeur à laquelle tu l’as achetée.</p><button class="btn" data-dialog-add="${esc(key)}" ${owned?'disabled':''}>${owned?'Déjà dans mon Pokédex':'Ajouter à mon Pokédex +'}</button></div></div>`;
 d.querySelector('[data-close]').onclick=()=>d.close();const priceInput=d.querySelector('#singleCardPrice');priceInput.onchange=()=>{const v=Math.max(0,parseFloat(String(priceInput.value).replace(',','.'))||0);db.prices[key]=db.prices[key]||{};db.prices[key].fr=v;save();stats()};const add=d.querySelector('[data-dialog-add]');if(add)add.onclick=()=>{add.disabled=true;addSingle(key).then(()=>{add.textContent='Ajoutée ✓'})};d.showModal();fillPrice(key);
}

/* ---------- Statistiques, export / import ---------- */
function stats(){
 const ks=started(),own=Object.keys(db.owned);let value=0,budget=0;
 own.forEach(x=>value+=priceOf(x));db.singles.forEach(x=>value+=priceOf(x.id));
 const rows=ks.map(k=>{const t=totalN(k),n=ownedN(k);let rem=0;if(CAT[k])for(const c of cardsOf(k))if(!isOwned(c))rem+=priceOf(c.key);budget+=rem;
  return `<div class="stat-row"><span>${sets[k].flag} ${esc(sets[k].title)}</span><div class="mini-progress"><i style="width:${t?Math.round(n/t*100):0}%"></i></div><small>${n}/${t||'?'}${rem?' · '+eur(rem):''}</small></div>`});
 $('statOwned').textContent=own.length;$('statSets').textContent=ks.length;$('statSingles').textContent=db.singles.length;
 $('statValue').textContent=value?eur(value):'—';$('statBudget').textContent=budget?eur(budget):'—';$('statsSets').innerHTML=rows.join('')}
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

/* ---------- Noms anglais des extensions japonaises ---------- */
const JPN={"PMCG1":"Expansion Pack","PMCG2":"Pokémon Jungle","PMCG3":"Mystery of the Fossils","PMCG4":"Team Rocket","PMCG5":"Leaders' Stadium","PMCG6":"Challenge from the Darkness","neo1":"Gold, Silver, to a New World","neo2":"Crossing the Ruins","neo3":"Awakening Legends","neo4":"Darkness, and to Light","VS1":"Pokémon Card VS","web1":"Pokémon Card web","E1":"Expedition Expansion Pack","E2":"The Town on No Map","E3":"Wind from the Sea","E4":"Split Earth","E5":"Mysterious Mountains","PCG1":"Flight of Legends","PCG2":"Clash of the Blue Sky","PCG3":"Rocket Gang Strikes Back","PCG4":"Golden Sky, Silvery Ocean","PCG5":"Mirage Forest","PCG6":"Holon Research Tower","PCG7":"Holon Phantoms","PCG8":"Miracle Crystal","PCG9":"Offense and Defense of the Furthest Ends","CP1":"Magma Gang vs Aqua Gang: Double Crisis","CP2":"Legendary Shine Collection","SM1M":"Collection Moon","SM1S":"Collection Sun","SM2K":"Islands Await You","SM2L":"Alolan Moonlight","SM3N":"Darkness That Consumes Light","SM3H":"To Have Seen the Battle Rainbow","SM4A":"Ultradimensional Beasts","SM4S":"Awakened Heroes","SM5M":"Ultra Moon","SM5S":"Ultra Sun","SM6":"Forbidden Light","SM6a":"Dragon Storm","SM6b":"Champion Road","SM7":"Charisma of the Wrecked Sky","SM7a":"Thunderclap Spark","SM7b":"Fairy Rise","SM8":"Super-Burst Impact","SM8a":"Dark Order","SM8b":"GX Ultra Shiny","SM9":"Tag Bolt","SM9a":"Night Unison","SM9b":"Full Metal Wall","SM10":"Double Blaze","SM10a":"GG End","SM10b":"Sky Legend","SM11":"Miracle Twins","SM11a":"Remix Bout","SM11b":"Dream League","SM12":"Alter Genesis","SM12a":"Tag All Stars","SM4p":"GX Battle Boost","SM5p":"Ultra Force","SM1p":"Sun & Moon","SM3p":"Shining Legends","SM2p":"Facing a New Trial","S10P":"Space Juggler","S12":"Paradigm Trigger","S8":"Fusion Arts","S7D":"Skyscraping Perfection","S9":"Star Birth","S11a":"Incandescent Arcana","S11":"Lost Abyss","S6H":"Silver Lance","S10a":"Dark Phantasma","S5I":"Single Strike Master","S9a":"Battle Region","S12a":"VSTAR Universe","S8b":"VMAX Climax","S6K":"Jet-Black Spirit","M4":"Ninja Spinner","M1S":"Mega Symphonia","M2":"Inferno X","M-P":"Mega Promo Cards","MC":"Start Deck 100 Battle Collection","M5":"Abyss Eye","M6":"Storm Emeralda","M3":"Nihil Zero","M2a":"MEGA Dream ex","M1L":"Mega Brave","SV5K":"Wild Force","SV2D":"Clay Burst","SV11W":"White Flare","SV4K":"Ancient Roar","SV1S":"Scarlet ex","SV7a":"Paradise Dragona","SV8":"Super Electric Breaker","SV10":"Glory of Team Rocket","SV5M":"Cyber Judge","SV2a":"Pokémon Card 151","SV7":"Stellar Miracle","SV2P":"Snow Hazard","SVK":"Deck Build Box Stellar Miracle","SVLS":"Starter Set Stellar Ceruledge ex","SVLN":"Starter Set Stellar Sylveon ex","SV1a":"Triplet Beat","SV8a":"Terastal Fest ex","SV5a":"Crimson Haze","SV3":"Ruler of the Black Flame","SV9a":"Hot Wind Arena","SV6a":"Night Wanderer","SV3a":"Raging Surf","SV6":"Transformation Mask","SV-P":"Scarlet & Violet Promo Cards","SV4a":"Shiny Treasure ex","SV4M":"Future Flash","SV11B":"Black Bolt","SV9":"Battle Partners","SV1V":"Violet ex","M6a":"30th Celebration"};

/* ---------- Prix du marché (Cardmarket via TCGdex) ---------- */
const MK='poketracker-market',HK='poketracker-hist';
let market=read(MK)||{},hist=read(HK)||{};
const saveMK=()=>{try{localStorage.setItem(MK,JSON.stringify(market));localStorage.setItem(HK,JSON.stringify(hist))}catch{}};
const today=()=>new Date().toISOString().slice(0,10);
const keySet=key=>key.slice(0,key.indexOf(':'));
/* Prix retenu en € : ton prix saisi, sinon ¥ converti, sinon prix Cardmarket. */
const priceOf=key=>{const p=db.prices[key]||{};if(p.fr>0)return p.fr;if(p.jp>0&&fxRate)return p.jp*fxRate;return market[key]?.eur||0};
async function fetchPrice(key,force){
 const k=keySet(key),m=meta[k],n=key.slice(k.length+1);
 if(!m||sets[k]?.lang==='jp')return null;
 const c=market[key];if(c&&!force&&c.d===today())return c;
 try{const r=await fetch(`https://api.tcgdex.net/v2/${m.lang}/cards/${encodeURIComponent(m.id+'-'+n)}`);if(!r.ok)throw 0;
  const cm=(await r.json()).pricing?.cardmarket;if(!cm){market[key]={none:1,d:today()};saveMK();return market[key]}
  const e={eur:cm.trend??cm.avg??0,low:cm.low,avg1:cm.avg1,avg7:cm.avg7,avg30:cm.avg30,holo:cm['trend-holo'],d:today(),u:cm.updated};
  market[key]=e;const h=hist[key]=hist[key]||[];if(!h.length||h[h.length-1][0]!==e.d)h.push([e.d,e.eur]);if(h.length>120)h.shift();
  saveMK();pushPrice(key,e);return e}
 catch{return c||null}}
const pct=(a,b)=>(b>0&&a>=0)?Math.round((a-b)/b*1000)/10:null;
const chg=v=>v==null?'—':`<b class="${v>=0?'up':'down'}">${v>=0?'+':''}${v} %</b>`;
function spark(a){if(a.length<2)return'';const mn=Math.min(...a),mx=Math.max(...a),r=mx-mn||1,w=260,h=56;
 const pts=a.map((v,i)=>`${(i/(a.length-1)*w).toFixed(1)},${(h-4-(v-mn)/r*(h-8)).toFixed(1)}`).join(' ');
 return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`}
const cardByKey=key=>{const k=keySet(key),n=key.slice(k.length+1);return(CAT[k]||[]).find(c=>String(c.number)===n)};
function marketLinks(key){const c=cardByKey(key);if(!c)return'';
 const q=encodeURIComponent((c.name+' '+String(c.number).replace(/^0+(?=\d)/,'')).trim()),fr=sets[keySet(key)]?.lang!=='jp';
 return `<div class="market-links">${fr?`<a class="btn" target="_blank" rel="noopener" href="https://www.cardmarket.com/fr/Pokemon/Products/Singles?searchString=${q}">Vérifier sur Cardmarket ↗</a>`:''}<a class="btn" target="_blank" rel="noopener" href="https://www.ebay.fr/sch/i.html?_nkw=${q}&LH_Sold=1&LH_Complete=1">Ventes eBay terminées ↗</a></div>`}
function priceBlock(key){
 if(sets[keySet(key)]?.lang==='jp')return '<div class="pricebox"><h3>Prix du marché</h3><p class="muted">Pas de prix automatique pour les cartes japonaises : saisis ton prix en ¥, il est converti en € au taux du jour.</p>'+marketLinks(key)+'</div>';
 return '<div class="pricebox"><h3>Prix du marché · Cardmarket</h3><div id="priceBody">Chargement…</div>'+marketLinks(key)+'</div>'}
async function fillPrice(key,force){
 if(!$('priceBody'))return;const e=await fetchPrice(key,force),el=$('priceBody');if(!el)return;
 if(!e){el.innerHTML='Prix indisponible (connexion ou service). <button class="btn" data-refresh-price="'+esc(key)+'">Réessayer</button>';return}
 if(e.none){el.textContent='Aucun prix Cardmarket pour cette carte.';return}
 const h=hist[key]||[],pts=[e.avg30,e.avg7,e.avg1,e.eur].filter(v=>v>=0),fm=v=>v!=null?eur(v):'—',dt=String(e.u||e.d).slice(0,10).split('-').reverse().join('/');
 const row=(l,v,c)=>`<tr><td>${l}</td><td>${fm(v)}</td><td>${c==null?'':chg(c)}</td></tr>`;
 el.innerHTML=`<div class="price-main"><strong>${eur(e.eur)}</strong><small>Tendance des prix</small></div><table class="price-table">${row('Prix moyen 30 jours',e.avg30,pct(e.eur,e.avg30))}${row('Prix moyen 7 jours',e.avg7,pct(e.eur,e.avg7))}${row('Prix moyen 1 jour',e.avg1,null)}</table>${spark(h.length>1?h.map(x=>x[1]):pts)}<small class="muted">Source : Cardmarket via TCGdex, relevé du ${esc(dt)}. Ces chiffres suivent les libellés de Cardmarket mais peuvent différer un peu de la page (mise à jour quotidienne, filtres de langue et d'état).${h.length>1?' Historique suivi sur cet appareil : '+h.length+' relevés.':''}</small>${e.holo?`<small>Variante holo / reverse : ${eur(e.holo)}</small>`:''}<button class="btn" data-refresh-price="${esc(key)}">Actualiser</button>`}

/* ---------- Compte et synchronisation (Supabase, optionnel) ---------- */
const CFG=window.POKETRACKER_CONFIG||{},cloudOn=!!(CFG.SUPABASE_URL&&CFG.SUPABASE_ANON_KEY);
let sb=null,user=null,pushTimer=null;
function cloudUI(msg){const el=$('cloudBox');if(!el)return;
 if(!cloudOn)el.innerHTML='<p class="muted">Synchronisation non configurée : ajoute ton URL et ta clé Supabase dans config.js (voir SUPABASE.txt).</p>';
 else el.innerHTML=user?`<p>Connecté : <b>${esc(user.email)}</b></p><div class="backup"><button class="btn" id="cloudSync">Synchroniser</button><button class="btn" id="cloudOut">Se déconnecter</button></div>`:'<input id="cloudEmail" class="searchbox" type="email" placeholder="ton@email.fr" autocomplete="email"><button class="btn" id="cloudIn">Recevoir un lien de connexion</button>';
 if(msg)el.insertAdjacentHTML('beforeend',`<p class="muted">${esc(msg)}</p>`)}
async function pushNow(){if(!sb||!user)return;const t=Date.now();db._t=t;save(false);
 const{error}=await sb.from('collections').upsert({user_id:user.id,data:db,updated_at:new Date(t).toISOString()});if(error)throw error}
function pushSoon(){if(!sb||!user)return;clearTimeout(pushTimer);pushTimer=setTimeout(()=>pushNow().catch(()=>{}),1500)}
function pushPrice(key,e){if(!sb||!user)return;sb.from('price_history').upsert({user_id:user.id,card_key:key,day:e.d,eur:e.eur,trend:e.eur,avg7:e.avg7??null,avg30:e.avg30??null}).then(()=>{},()=>{})}
async function cloudSync(manual){if(!sb||!user)return;
 try{const{data,error}=await sb.from('collections').select('data,updated_at').eq('user_id',user.id).maybeSingle();if(error)throw error;
  if(data?.data){const r=data.data,rt=new Date(data.updated_at).getTime();
   if(!db._s)db={owned:{...r.owned,...db.owned},prices:{...r.prices,...db.prices},singles:[...db.singles,...(r.singles||[]).filter(x=>!db.singles.some(y=>y.id===x.id))],_t:db._t};
   else if(rt>(db._t||0))db={owned:r.owned||{},prices:r.prices||{},singles:r.singles||[],_t:rt}}
  db._s=1;await pushNow();
  const ph=await sb.from('price_history').select('card_key,day,eur').eq('user_id',user.id).order('day');
  for(const x of ph.data||[]){const h=hist[x.card_key]=hist[x.card_key]||[];if(!h.some(y=>y[0]===x.day))h.push([x.day,Number(x.eur)])}
  for(const k in hist)hist[k].sort((a,b)=>a[0]<b[0]?-1:1);saveMK();
  renderHome();renderSingles();stats();if(manual)cloudUI('Synchronisé ✓')}
 catch(e){cloudUI('Échec de la synchronisation : '+(e.message||e))}}
async function cloudInit(){cloudUI();if(!cloudOn)return;
 try{await new Promise((ok,ko)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';s.onload=ok;s.onerror=ko;document.head.appendChild(s)});
  sb=window.supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_ANON_KEY);
  user=(await sb.auth.getSession()).data.session?.user||null;
  sb.auth.onAuthStateChange((_e,s)=>{const u=s?.user||null;if(u?.id!==user?.id){user=u;cloudUI();if(u)cloudSync()}});
  cloudUI();if(user)cloudSync()}
 catch{cloudUI('Service de connexion indisponible.')}}
$('cloudBox').onclick=async e=>{const id=e.target.id;
 if(id==='cloudIn'){const em=$('cloudEmail').value.trim();if(!em)return;
  const{error}=await sb.auth.signInWithOtp({email:em,options:{emailRedirectTo:location.origin+location.pathname}});cloudUI(error?'Erreur : '+error.message:'Lien envoyé. Ouvre-le depuis cet appareil.')}
 else if(id==='cloudOut'){await sb.auth.signOut();user=null;cloudUI()}
 else if(id==='cloudSync')cloudSync(true)};

/* ---------- Actualiser les prix d'une série ---------- */
$('refreshSetPrices').onclick=async()=>{const k=cur,out=$('priceProgress');
 if(sets[k]?.lang==='jp'){out.textContent='Pas de source automatique pour le japonais : saisis les prix en ¥ dans chaque fiche.';return}
 const keys=cardsOf(k).map(c=>c.key),b=$('refreshSetPrices');let i=0,done=0;b.disabled=true;
 await Promise.all(Array.from({length:6},async()=>{while(i<keys.length){await fetchPrice(keys[i++]);out.textContent=`Prix récupérés : ${++done} / ${keys.length}`}}));
 b.disabled=false;out.textContent='Prix à jour ✓';if(cur===k)render();stats()};

/* ---------- Cochage rapide : un appui coche, un appui long ouvre la fiche ---------- */
let pressT=null,pressed=false,tapMode=(()=>{try{return localStorage.getItem('poketracker-tap')}catch{return null}})()==='detail'?'detail':'own';
function toggleOwned(key,el){if(db.owned[key])delete db.owned[key];else db.owned[key]=1;save();navigator.vibrate?.(8);
 if(filter==='all'&&el&&el.classList){el.classList.toggle('is-owned');el.classList.toggle('is-missing');renderHead()}else{const y=window.scrollY;render();window.scrollTo(0,y)}renderHome()}
document.addEventListener('pointerdown',e=>{const t=e.target.closest('[data-card]');if(!t||e.target.closest('[data-detail]'))return;pressed=false;clearTimeout(pressT);pressT=setTimeout(()=>{pressed=true;detail(t.dataset.card)},450)});
['pointerup','pointercancel'].forEach(ev=>document.addEventListener(ev,()=>clearTimeout(pressT)));
document.addEventListener('contextmenu',e=>{if(e.target.closest('[data-card]'))e.preventDefault()});
function applyTap(){document.querySelectorAll('[data-tap]').forEach(b=>b.classList.toggle('selected',b.dataset.tap===tapMode))}
document.querySelectorAll('[data-tap]').forEach(b=>b.onclick=()=>{tapMode=b.dataset.tap;try{localStorage.setItem('poketracker-tap',tapMode)}catch{}applyTap()});
applyTap();$('sortSel').onchange=render;

/* ---------- Événements ---------- */
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-block],[data-set],[data-detail],[data-single-detail],[data-add],[data-rm],[data-home],[data-lang],[data-refresh-price],[data-card]');if(!t)return;const d=t.dataset;
 if(d.card){if(pressed){pressed=false;return}tapMode==='detail'?detail(d.card):toggleOwned(d.card,t);return}
 if(d.refreshPrice){const b=$('priceBody');if(b)b.textContent='Chargement…';fillPrice(d.refreshPrice,true);return}
 if(d.rm){e.preventDefault();e.stopPropagation();db.singles=db.singles.filter(z=>z.id!==d.rm);save();renderSingles();stats();return;}
 if(d.block)openBlock(d.block);else if(d.set)openSet(d.set);else if(d.detail)detail(d.detail);else if(d.singleDetail)singleDetail(d.singleDetail);else if(d.add){e.preventDefault();e.stopPropagation();addSingle(d.add,t);}
 else if(d.rm){db.singles=db.singles.filter(z=>z.id!==d.rm);save();renderSingles();stats()}
 else if(d.lang!==undefined){langF=d.lang;try{localStorage.setItem('poketracker-lang',langF)}catch{}openBlock(curBlock)}else{show('landing');renderHome()}});
$('tileSeries').onclick=openBlocks;$('tileCollection').onclick=openShelf;
$('tilePokedex').onclick=()=>{renderSingles();show('pokedexPage')};$('tileStats').onclick=()=>{stats();show('statsPage')};
$('navMenu').onclick=$('home').onclick=()=>{show('landing');renderHome()};
$('navSearch').onclick=()=>{$('searchOverlay').hidden=false;$('globalSearch').focus()};
$('closeSearch').onclick=()=>$('searchOverlay').hidden=true;
addEventListener('keydown',e=>{if(e.key==='Escape')$('searchOverlay').hidden=true});
$('globalSearch').oninput=deb(e=>search(e.target.value,'globalResults'));
$('singleSearch').oninput=deb(e=>{const c=$('clearSingleSearch');if(c)c.hidden=!e.target.value;search(e.target.value,'singleResults')});
$('clearSingleSearch').onclick=()=>{$('singleSearch').value='';$('singleResults').innerHTML='';$('clearSingleSearch').hidden=true;$('singleSearch').focus()};
$('singleSearch').addEventListener('focus',()=>{if($('singleResults').innerHTML.trim()==='')$('singleResults').innerHTML='<p class="muted">Tape au moins 2 lettres.</p>'});
$('backBlocks').onclick=openBlocks;$('back').onclick=()=>{show(setReturnPage);requestAnimationFrame(()=>window.scrollTo(0,setReturnScroll))};
$('search').oninput=deb(render,100);$('rarityFilter').onchange=render;
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('selected',x===b));render()});
if(!read(KEY))save();
navigator.storage?.persist?.().catch(()=>{});
/* Taux JPY/EUR : conserve le dernier taux connu hors connexion. */
let fxRate=(()=>{try{return Number(localStorage.getItem('poketracker-jpy-eur'))||0}catch{return 0}})();
const jpyEUR=n=>fxRate?eur((Number(n)||0)*fxRate):'Conversion indisponible';
async function refreshFx(){try{const r=await fetch('https://api.frankfurter.app/latest?from=JPY&to=EUR');if(!r.ok)throw 0;const x=await r.json(),v=Number(x.rates?.EUR);if(!(v>0))throw 0;fxRate=v;try{localStorage.setItem('poketracker-jpy-eur',String(v));localStorage.setItem('poketracker-jpy-eur-date',x.date||'')}catch{}stats();if(!$('collection').hidden&&sets[cur]?.lang==='jp')render()}catch{}}
(async()=>{try{const r=await fetch('catalog/index.json');if(!r.ok)return;const x=await r.json();
 for(const s of x.series||[])if(s.logo)SL[s.id]=s.logo;
 for(const e of x.sets||[]){meta[e.key]={serie:e.serie,count:e.count,id:e.id,lang:e.lang,cover:e.cover||'',logo:e.logo||`https://assets.tcgdex.net/${e.lang}/${e.serie}/${e.id}/logo`};if(e.lang==='ja'&&JPN[e.id]&&sets[e.key])sets[e.key].title=JPN[e.id];if(sets[e.key])continue;
  const fr=e.lang!=='ja';sets[e.key]={title:(e.lang==='ja'&&JPN[e.id])||e.name,label:'BLOC · '+String(e.serie).toUpperCase()+(fr?' · FRANÇAIS':' · JAPONAIS'),code:e.id+(fr?' · édition française':' · édition japonaise'),flag:fr?'🇫🇷':'🇯🇵',lang:fr?'fr':'jp'}}
 const byId={};for(const e of x.sets||[])byId[e.lang+':'+e.id]=e;
 for(const e of x.sets||[]){const m=e.id.match(/^(.+?)(tg|gg|cc|sv)$/i),pid=({sma:'sm115',exu:'ex10','30th-c':'30th'})[e.id]||(m&&m[1]),p=pid&&byId[e.lang+':'+pid];if(p&&p.key!==e.key){(kids[p.key]=kids[p.key]||[]).push(e.key);kidOf[e.key]=p.key}}
 if(meta['30th'])delete sets['30-fr'];if(meta['m6a-jp'])delete sets['30-jp'];
 renderHome()}catch{}})();
renderHome();show('landing');
refreshFx();
cloudInit();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
