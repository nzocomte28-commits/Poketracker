const OLD='poketracker-v1', KEY='poketracker-v2';
const $=id=>document.getElementById(id);
let db={cards:[]}, set='jp', filter='all', editing=null;
const sets={
 jp:['COLLECTION JAPONAISE','30th Anniversary','M6a · 30e anniversaire','ja','30th anniversary'],
 fr:['COLLECTION FRANÇAISE','30 ans Pokémon','30C · édition française','fr','30 ans']
};
const eur=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n||0);
const jpy=n=>new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(n||0);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function loadData(){
 try{
  let raw=localStorage.getItem(KEY), parsed=raw?JSON.parse(raw):null;
  if(!parsed){
   const legacy=JSON.parse(localStorage.getItem(OLD)||'null');
   parsed={cards:Array.isArray(legacy?.cards)?legacy.cards.map(c=>({...c,set:c.set||c.language||'jp',priceFR:c.priceFR??'',priceJP:c.priceJP??(c.language==='jp'?c.price:'')})) : []};
  }
  if(!parsed||typeof parsed!=='object')parsed={};
  if(!Array.isArray(parsed.cards))parsed.cards=[];
  parsed.cards=parsed.cards.filter(c=>c&&typeof c==='object').map((c,i)=>({
   id:c.id||('card-'+i+'-'+Date.now()),set:(c.set||c.language)==='fr'?'fr':'jp',
   name:String(c.name||'Carte sans nom'),number:String(c.number||''),image:String(c.image||''),
   priceFR:c.priceFR??'',priceJP:c.priceJP??'',owned:!!c.owned,notes:String(c.notes||'')
  }));
  db=parsed;
 }catch(err){ db={cards:[]}; console.error('PokéTracker : données locales illisibles',err); }
}
function cards(){return db.cards.filter(c=>c.set===set)}
function started(k){return db.cards.some(c=>c.set===k&&c.owned)}
function seriesButton(k){
 return `<button data-set="${k}"><small>${k==='jp'?'JAPONAIS':'FRANÇAIS'}</small><b>${sets[k][1]}</b><span>${sets[k][2]}</span><em>${db.cards.filter(c=>c.set===k&&c.owned).length} possédée(s)</em></button>`;
}
function homeStats(){
 const own=db.cards.filter(c=>c.owned);
 const budget=db.cards.filter(c=>!c.owned&&c.priceFR!=='').reduce((s,c)=>s+(Number(c.priceFR)||0),0);
 if($('allOwned'))$('allOwned').textContent=own.length;
 if($('allBudget'))$('allBudget').textContent=budget?eur(budget):'—';
 const begun=['jp','fr'].filter(started), available=['jp','fr'].filter(k=>!started(k));
 if($('myCollections'))$('myCollections').innerHTML=begun.map(seriesButton).join('');
 if($('availableSeries'))$('availableSeries').innerHTML=available.map(seriesButton).join('');
 if($('noCollections'))$('noCollections').hidden=begun.length>0;
 document.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>openSet(b.dataset.set));
}
function save(){localStorage.setItem(KEY,JSON.stringify(db));homeStats();if($('collection')&&!$('collection').hidden)render()}
function openSet(k){
 set=k;$('landing').hidden=true;$('collection').hidden=false;$('add').hidden=false;
 $('search').value='';filter='all';
 document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('selected',b.dataset.filter==='all'));
 render();window.scrollTo(0,0);
}
function goHome(){$('landing').hidden=false;$('collection').hidden=true;$('add').hidden=true;homeStats();window.scrollTo(0,0)}
function render(){
 const a=cards(),o=a.filter(c=>c.owned),m=a.filter(c=>!c.owned),p=a.length?Math.round(o.length/a.length*100):0;
 $('setLabel').textContent=sets[set][0];$('setTitle').textContent=sets[set][1];$('setSubtitle').textContent=sets[set][2];
 $('pct').textContent=p+' %';$('owned').textContent=o.length;$('missing').textContent=m.length;$('bar').style.width=p+'%';
 const v=o.reduce((s,c)=>s+(Number(c.priceFR)||0),0),r=m.reduce((s,c)=>s+(Number(c.priceFR)||0),0);
 const jv=o.reduce((s,c)=>s+(Number(c.priceJP)||0),0),j=m.reduce((s,c)=>s+(Number(c.priceJP)||0),0);
 $('value').textContent=v?eur(v):'—';$('remain').textContent=r?eur(r):'—';
 $('remainJP').textContent=j?jpy(j):'—';$('valueJP').textContent=jv?jpy(jv):'—';
 $('remainJPWrap').hidden=set!=='jp';$('valueJPWrap').hidden=set!=='jp';
 $('valueWrap').firstChild.textContent=set==='jp'?'Valeur possédée EUR':'Valeur possédée';
 $('remainWrap').firstChild.textContent=set==='jp'?'Budget restant EUR':'Budget restant';
 const q=$('search').value.toLowerCase();
 const shown=a.filter(c=>(filter==='all'||(filter==='owned'?c.owned:!c.owned))&&[c.name,c.number,c.notes].join(' ').toLowerCase().includes(q));
 $('cards').innerHTML=shown.map(c=>'<article class="card">'+(c.image?'<img src="'+esc(c.image)+'" alt="">':'<div class="placeholder">✦</div>')+'<div class="info"><b>'+esc(c.name)+'</b><div class="meta">'+esc(c.number||'Numéro non renseigné')+'</div><div class="prices">'+(c.priceFR?'<strong>'+eur(Number(c.priceFR))+'</strong>':'Prix EUR —')+(set==='jp'?'　·　'+(c.priceJP?'<strong>'+jpy(Number(c.priceJP))+'</strong>':'Prix JPY —'):'')+'</div><label class="own"><input type="checkbox" data-own="'+esc(c.id)+'" '+(c.owned?'checked':'')+'> Possédée <button type="button" class="edit" data-edit="'+esc(c.id)+'">Modifier</button></label></div></article>').join('');
 $('empty').hidden=a.length>0;$('cards').hidden=!shown.length;
 if(a.length&&!shown.length)$('cards').innerHTML='<p class="meta">Aucun résultat.</p>';
 $('priceJPLabel').hidden=set!=='jp';
}
function form(c){
 editing=c?.id||null;$('form').reset();$('dlgTitle').textContent=c?'Modifier la carte':'Ajouter une carte';
 if(c)Object.entries(c).forEach(([k,v])=>{const e=$('form').elements[k];if(e){if(e.type==='checkbox')e.checked=!!v;else e.value=v??''}});
 $('priceJPLabel').hidden=set!=='jp';$('dlg').showModal();
}
function close(){$('dlg').close();editing=null}
function init(){
 loadData();
 $('home').onclick=goHome;$('back').onclick=goHome;$('add').onclick=$('firstAdd').onclick=()=>form();
 $('close').onclick=$('cancel').onclick=close;
 $('form').onsubmit=e=>{
  e.preventDefault();const f=new FormData(e.target);
  const c={id:editing||('c-'+Date.now()+'-'+Math.random().toString(36).slice(2)),set,name:f.get('name').trim(),number:f.get('number').trim(),image:f.get('image').trim(),priceFR:f.get('priceFR'),priceJP:set==='jp'?f.get('priceJP'):'',owned:f.has('owned'),notes:f.get('notes').trim()};
  db.cards=editing?db.cards.map(x=>x.id===editing?c:x):[...db.cards,c];close();save();
 };
 $('cards').onclick=e=>{const id=e.target.dataset.edit;if(id)form(db.cards.find(c=>c.id===id))};
 $('cards').onchange=e=>{const id=e.target.dataset.own;if(id){const c=db.cards.find(c=>c.id===id);if(c){c.owned=e.target.checked;save()}}};
 document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('selected',x===b));render()});
 $('search').oninput=render;
 $('checkApi').onclick=async()=>{
  const lang=sets[set][3];$('apiStatus').textContent='Vérification des séries disponibles dans TCGdex…';
  try{
   const response=await fetch('https://api.tcgdex.net/v2/'+lang+'/sets');if(!response.ok)throw Error('API indisponible');
   const all=await response.json(),hits=all.filter(x=>(x.name+' '+x.id).toLowerCase().includes(sets[set][4]));
   if(!hits.length){$('apiStatus').textContent='Cette extension exacte n’est pas référencée dans TCGdex pour le moment. Aucun catalogue approximatif n’a été importé.';return}
   if(hits.length>1){$('apiStatus').textContent='Plusieurs extensions candidates trouvées : '+hits.map(x=>x.name+' ('+x.id+')').join(', ')+'. Import suspendu pour éviter un mauvais catalogue.';return}
   const chosen=hits[0],detail=await fetch('https://api.tcgdex.net/v2/'+lang+'/sets/'+chosen.id).then(r=>{if(!r.ok)throw Error();return r.json()});
   const list=(detail.cards||[]).filter(c=>!String(c.name||'').toLowerCase().includes('energy'));
   const known=new Set(db.cards.filter(c=>c.set===set).map(c=>String(c.number)));let added=0;
   for(const c of list){if(known.has(String(c.localId)))continue;db.cards.push({id:'tcg-'+set+'-'+c.localId,set,name:c.name,number:c.localId,image:c.image?c.image+'/high.webp':'',priceFR:'',priceJP:'',owned:false,notes:'Import TCGdex · '+chosen.name});added++}
   save();$('apiStatus').textContent=added+' cartes importées depuis TCGdex ('+chosen.name+'). Les promos et variantes peuvent être dans des extensions séparées.';
  }catch(err){$('apiStatus').textContent='TCGdex est momentanément indisponible. Aucun catalogue n’a été modifié.'}
 };
 homeStats();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
