const OLD='poketracker-v1',KEY='poketracker-v2';
function readStore(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
const old=readStore(OLD);
let db=readStore(KEY);
if(!db||typeof db!=='object'||Array.isArray(db))db={};
if(!Array.isArray(db.cards)){
 const legacy=Array.isArray(old?.cards)?old.cards:[];
 db.cards=legacy.map(c=>({...c,set:c.set||c.language||'jp',priceFR:c.priceFR??'',priceJP:c.priceJP??(c.language==='jp'?c.price:'')}));
}

let set='jp',filter='all',editing=null;
const $=x=>document.getElementById(x),sets={
 jp:['COLLECTION JAPONAISE','30th Anniversary','M6a · 30e anniversaire','ja','30th anniversary'],
 fr:['COLLECTION FRANÇAISE','30 ans Pokémon','30C · édition française','fr','30 ans']
};
const eur=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n),
jpy=n=>new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(n),
esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function cards(){return db.cards.filter(c=>(c.set||c.language)===set)}
function started(k){return db.cards.some(c=>c.set===k&&c.owned)}
function langCard(k){const s=sets[k],n=db.cards.filter(c=>c.set===k&&c.owned).length;return `<button class="catalogue-card" data-open-lang="${k}"><span class="catalogue-lang">${k==='fr'?'🇫🇷 Français':'🇯🇵 Japonais'}</span><b>${s.title}</b><small>${s.code} · ${n} carte(s) possédée(s)</small></button>`}
function renderHome(){
 const begun=seriesCatalog.filter(x=>x.languages.some(started));
 $('myCollections').innerHTML=begun.map(x=>`<article class="catalogue-group"><h3>${x.title}</h3><div class="catalogue-languages">${x.languages.filter(started).map(langCard).join('')}</div></article>`).join('');
 $('noCollections').hidden=begun.length>0;
 $('availableBlocks').innerHTML=Object.entries(blocks).map(([id,b])=>{
  const list=seriesCatalog.filter(x=>x.block===id&&x.languages.some(k=>!started(k)));
  if(!list.length)return '';
  return `<article class="block-card"><div class="block-heading"><span class="eyebrow">BLOC</span><h3>${b.title}</h3><p>${b.description}</p></div><div class="catalogue-group-list">${list.map(x=>`<button class="series-entry" data-open-series="${x.id}"><b>${x.title}</b><span>Choisir une version <i>›</i></span></button>`).join('')}</div></article>`;
 }).join('');
 document.querySelectorAll('[data-open-lang]').forEach(b=>b.onclick=()=>openSet(b.dataset.openLang));
 document.querySelectorAll('[data-open-series]').forEach(b=>b.onclick=()=>openSeries(b.dataset.openSeries));
}
function openSeries(id){const s=seriesCatalog.find(x=>x.id===id);if(!s)return;$('landing').hidden=true;$('collection').hidden=true;$('languagePicker').hidden=false;$('languageTitle').textContent=s.title;$('languageOptions').innerHTML=s.languages.filter(k=>!started(k)).map(langCard).join('');document.querySelectorAll('[data-open-lang]').forEach(b=>b.onclick=()=>openSet(b.dataset.openLang));window.scrollTo(0,0)}
function homeStats(){renderHome()}
function save(){localStorage.setItem(KEY,JSON.stringify(db));homeStats();if(!$('collection').hidden)render()}
function openSet(k){set=k;$('landing').hidden=true;$('languagePicker').hidden=true;$('collection').hidden=false;$('add').hidden=false;$('search').value='';filter='all';document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('selected',b.dataset.filter==='all'));render();window.scrollTo(0,0)}
function goHome(){$('landing').hidden=false;$('languagePicker').hidden=true;$('collection').hidden=true;$('add').hidden=true;homeStats();window.scrollTo(0,0)}
function render(){
 let a=cards(),o=a.filter(c=>c.owned),m=a.filter(c=>!c.owned),p=a.length?Math.round(o.length/a.length*100):0;
 $('setLabel').textContent=sets[set].label;$('setTitle').textContent=sets[set].title;$('setSubtitle').textContent=sets[set].code+' · 30e anniversaire';
 $('pct').textContent=p+' %';$('owned').textContent=o.length;$('missing').textContent=m.length;$('bar').style.width=p+'%';
 let v=o.reduce((s,c)=>s+(+c.priceFR||0),0),r=m.reduce((s,c)=>s+(+c.priceFR||0),0),
 jv=o.reduce((s,c)=>s+(+c.priceJP||0),0),j=m.reduce((s,c)=>s+(+c.priceJP||0),0);
 $('value').textContent=v?eur(v):'—';$('remain').textContent=r?eur(r):'—';
 $('remainJP').textContent=j?jpy(j):'—';$('valueJP').textContent=jv?jpy(jv):'—';
 $('remainJPWrap').hidden=set!=='jp';$('valueJPWrap').hidden=set!=='jp';
 $('valueWrap').firstChild.textContent=set==='jp'?'Valeur possédée EUR':'Valeur possédée';
 $('remainWrap').firstChild.textContent=set==='jp'?'Budget restant EUR':'Budget restant';
 let q=$('search').value.toLowerCase(),shown=a.filter(c=>(filter==='all'||(filter==='owned'?c.owned:!c.owned))&&[c.name,c.number,c.notes].join(' ').toLowerCase().includes(q));
 $('cards').innerHTML=shown.map(c=>'<article class="card">'+(c.image?'<img src="'+esc(c.image)+'" alt="">':'<div class="placeholder">✦</div>')+'<div class="info"><b>'+esc(c.name)+'</b><div class="meta">'+esc(c.number||'Numéro non renseigné')+'</div><div class="prices">'+(c.priceFR?'<strong>'+eur(+c.priceFR)+'</strong>':'Prix EUR —')+(set==='jp'?'　·　'+(c.priceJP?'<strong>'+jpy(+c.priceJP)+'</strong>':'Prix JPY —'):'')+'</div><label class="own"><input type="checkbox" data-own="'+c.id+'" '+(c.owned?'checked':'')+'> Possédée <button class="edit" data-edit="'+c.id+'">Modifier</button></label></div></article>').join('');
 $('empty').hidden=a.length>0;$('cards').hidden=!shown.length;if(a.length&&!shown.length)$('cards').innerHTML='<p class="meta">Aucun résultat.</p>';
 $('priceJPLabel').hidden=set!=='jp';
}
function form(c){editing=c?.id||null;$('form').reset();$('dlgTitle').textContent=c?'Modifier la carte':'Ajouter une carte';if(c)Object.entries(c).forEach(([k,v])=>{let e=$('form').elements[k];if(e){if(e.type==='checkbox')e.checked=!!v;else e.value=v??''}});$('priceJPLabel').hidden=set!=='jp';$('dlg').showModal()}
function close(){ $('dlg').close();editing=null}
document.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>openSet(b.dataset.set));
$('home').onclick=$('back').onclick=goHome;$('add').onclick=$('firstAdd').onclick=()=>form();
$('close').onclick=$('cancel').onclick=close;
$('form').onsubmit=e=>{e.preventDefault();let f=new FormData(e.target),c={id:editing||crypto.randomUUID(),set,name:f.get('name').trim(),number:f.get('number').trim(),image:f.get('image').trim(),priceFR:f.get('priceFR'),priceJP:set==='jp'?f.get('priceJP'):'',owned:f.has('owned'),notes:f.get('notes').trim()};db.cards=editing?db.cards.map(x=>x.id===editing?c:x):[...db.cards,c];close();save()};
$('cards').onclick=e=>{let id=e.target.dataset.edit;if(id)form(db.cards.find(c=>c.id===id))};
$('cards').onchange=e=>{let id=e.target.dataset.own;if(id){let c=db.cards.find(c=>c.id===id);c.owned=e.target.checked;save()}};
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('selected',x===b));render()});
$('search').oninput=render;
$('checkApi').onclick=async()=>{
 const lang=sets[set].lang;$('apiStatus').textContent='Vérification des séries disponibles dans TCGdex…';
 try{
  const response=await fetch('https://api.tcgdex.net/v2/'+lang+'/sets');if(!response.ok)throw Error('API indisponible');
  const all=await response.json(),hits=all.filter(x=>(x.name+' '+x.id).toLowerCase().includes(sets[set].search));
  if(!hits.length){$('apiStatus').textContent='Cette extension exacte n’est pas référencée dans TCGdex pour le moment. Aucun catalogue approximatif n’a été importé. Tu peux conserver tes cartes et les ajouter manuellement.';return}
  if(hits.length>1){$('apiStatus').textContent='Plusieurs extensions candidates trouvées : '+hits.map(x=>x.name+' ('+x.id+')').join(', ')+'. Import suspendu pour éviter un mauvais catalogue.';return}
  const chosen=hits[0],detail=await fetch('https://api.tcgdex.net/v2/'+lang+'/sets/'+chosen.id).then(r=>{if(!r.ok)throw Error();return r.json()});
  const list=(detail.cards||[]).filter(c=>!String(c.name||'').toLowerCase().includes('energy'));
  const known=new Set(db.cards.filter(c=>(c.set||c.language)===set).map(c=>String(c.number)));
  let added=0;
  for(const c of list){if(known.has(String(c.localId)))continue;db.cards.push({id:crypto.randomUUID(),set,name:c.name,number:c.localId,image:c.image?c.image+'/high.webp':'',priceFR:'',priceJP:'',owned:false,notes:'Import TCGdex · '+chosen.name});added++}
  save();$('apiStatus').textContent=added+' cartes importées depuis TCGdex ('+chosen.name+'). Vérifie le total et les cartes spéciales : les variantes et promos peuvent être dans des extensions séparées.';
 }catch(e){$('apiStatus').textContent='TCGdex est momentanément indisponible. Aucun catalogue n’a été modifié.'}
};
homeStats();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
