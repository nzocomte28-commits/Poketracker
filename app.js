/* PokéTracker V13 — catalogue FR/JP enrichi, données locales conservées */
const KEY='poketracker-v2';
function readStore(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}}
let db=readStore(KEY);if(!db||typeof db!=='object'||Array.isArray(db))db={};if(!Array.isArray(db.cards))db.cards=[];
// Migration non destructive : les anciennes clés restent reconnues, aucune carte n'est supprimée.
const aliases={
 'meg-fr':['meg-fr','me01','MEG'], 'm1l-jp':['m1l-jp','M1L'], 'm1s-jp':['m1s-jp','M1S'],
 '30-fr':['30-fr','fr'], '30-jp':['30-jp','jp'],
 'me02':['me02'], 'me025':['me025'], 'me03':['me03'], 'me04':['me04'], 'me05':['me05'], 'mep':['mep']
};
const sets={
 'meg-fr':{title:'Méga-Évolution',label:'BLOC MÉGA-ÉVOLUTION · FRANÇAIS',code:'MEG · collection française',flag:'🇫🇷',lang:'fr',catalog:'meg-fr'},
 'm1l-jp':{title:'Méga-Brave',label:'BLOC MÉGA-ÉVOLUTION · JAPONAIS',code:'M1L · collection japonaise',flag:'🇯🇵',lang:'jp',catalog:'m1l-jp'},
 'm1s-jp':{title:'Méga-Symphonia',label:'BLOC MÉGA-ÉVOLUTION · JAPONAIS',code:'M1S · collection japonaise',flag:'🇯🇵',lang:'jp',catalog:'m1s-jp'},
 '30-fr':{title:'30 ans Pokémon',label:'30E ANNIVERSAIRE · FRANÇAIS',code:'30C · édition française',flag:'🇫🇷',lang:'fr'},
 '30-jp':{title:'30th Anniversary',label:'30E ANNIVERSAIRE · JAPONAIS',code:'M6a · édition japonaise',flag:'🇯🇵',lang:'jp'},
 'me02':{title:'Flammes Fantasmagoriques',label:'BLOC MÉGA-ÉVOLUTION · FRANÇAIS',code:'ME02 · édition française',flag:'🇫🇷',lang:'fr'},
 'me025':{title:'Héros Transcendants',label:'BLOC MÉGA-ÉVOLUTION · FRANÇAIS',code:'ME02.5 · édition française',flag:'🇫🇷',lang:'fr'},
 'me03':{title:'Équilibre Parfait',label:'BLOC MÉGA-ÉVOLUTION · FRANÇAIS',code:'ME03 · édition française',flag:'🇫🇷',lang:'fr'},
 'me04':{title:'Chaos Ascendant',label:'BLOC MÉGA-ÉVOLUTION · FRANÇAIS',code:'ME04 · édition française',flag:'🇫🇷',lang:'fr'},
 'me05':{title:'Nuit Noire',label:'BLOC MÉGA-ÉVOLUTION · FRANÇAIS',code:'ME05 · édition française',flag:'🇫🇷',lang:'fr'},
 'mep':{title:'Promos Méga-Évolution',label:'PROMOS · FRANÇAIS',code:'Promos françaises',flag:'🇫🇷',lang:'fr'}
};
const blocks=[{title:'Bloc Méga-Évolution',description:'Les extensions françaises et japonaises du bloc.',series:[['meg-fr'],['me02'],['me025'],['me03'],['me04'],['me05'],['mep'],['m1l-jp'],['m1s-jp']]},{title:'30e anniversaire',description:'Les collections anniversaire, dans chaque langue.',series:[['30-fr','30-jp']]}];
let current='meg-fr',filter='all',editing=null;
const $=id=>document.getElementById(id);
const eur=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n||0);
const jpy=n=>new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(n||0);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function keys(k){return aliases[k]||[k]}
function collectionCards(k=current){return db.cards.filter(c=>keys(k).includes(String(c.set||c.language||'')))}
function started(k){return collectionCards(k).some(c=>c.owned)}
function save(){localStorage.setItem(KEY,JSON.stringify(db));renderHome();if(!$('collection').hidden)renderCollection()}
function languageCard(k){let s=sets[k],owned=collectionCards(k).filter(c=>c.owned).length;return `<button class="catalogue-card" data-open-set="${k}"><span class="catalogue-lang">${s.flag} ${s.lang==='fr'?'Français':'Japonais'}</span><b>${s.title}</b><small>${s.code} · ${owned} carte(s) possédée(s)</small></button>`}
function renderHome(){
 const startedSets=Object.keys(sets).filter(started);
 $('myCollections').innerHTML=startedSets.length?blocks.map(b=>{let entries=b.series.flat().filter(k=>started(k));return entries.length?`<article class="catalogue-group"><h3>${b.title}</h3><div class="catalogue-languages">${entries.map(languageCard).join('')}</div></article>`:''}).join(''):'';
 $('noCollections').hidden=startedSets.length>0;
 $('availableBlocks').innerHTML=blocks.map((b,i)=>{let remaining=b.series.map(group=>group.filter(k=>!started(k))).filter(g=>g.length);if(!remaining.length)return '';return `<article class="block-card"><div class="block-heading"><span class="eyebrow">COLLECTIONS</span><h3>${b.title}</h3><p>${b.description}</p></div><div class="catalogue-group-list">${remaining.map(group=>group.length===1?languageCard(group[0]):`<button class="series-entry" data-open-group="${group.join(',')}"><b>${sets[group[0]].title.replace('30 ans Pokémon','30e anniversaire')}</b><span>Choisir une langue <i>›</i></span></button>`).join('')}</div></article>`}).join('');
 document.querySelectorAll('[data-open-set]').forEach(b=>b.onclick=()=>openSet(b.dataset.openSet));
 document.querySelectorAll('[data-open-group]').forEach(b=>b.onclick=()=>openLanguageGroup(b.dataset.openGroup.split(',')));
}
function openLanguageGroup(group){$('landing').hidden=true;$('collection').hidden=true;$('languagePicker').hidden=false;$('languageTitle').textContent='30e anniversaire';$('languageOptions').innerHTML=group.map(languageCard).join('');document.querySelectorAll('[data-open-set]').forEach(b=>b.onclick=()=>openSet(b.dataset.openSet));window.scrollTo(0,0)}
function openSet(k){current=k;$('landing').hidden=true;$('languagePicker').hidden=true;$('collection').hidden=false;$('add').hidden=false;$('search').value='';filter='all';document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('selected',b.dataset.filter==='all'));renderCollection();loadCatalog(false);window.scrollTo(0,0)}
function goHome(){$('landing').hidden=false;$('languagePicker').hidden=true;$('collection').hidden=true;$('add').hidden=true;renderHome();window.scrollTo(0,0)}
function renderCollection(){
 let a=collectionCards(),owned=a.filter(c=>c.owned),missing=a.filter(c=>!c.owned),pct=a.length?Math.round(owned.length/a.length*100):0,s=sets[current];
 $('setLabel').textContent=s.label;$('setTitle').textContent=s.title;$('setSubtitle').textContent=s.code;
 $('pct').textContent=pct+' %';$('owned').textContent=owned.length;$('missing').textContent=missing.length;$('bar').style.width=pct+'%';
 const price=(c,key)=>Number(c[key]||0);let value=owned.reduce((n,c)=>n+price(c,'priceFR'),0),remaining=missing.reduce((n,c)=>n+price(c,'priceFR'),0),valueJP=owned.reduce((n,c)=>n+price(c,'priceJP'),0),remainingJP=missing.reduce((n,c)=>n+price(c,'priceJP'),0);
 $('value').textContent=value?eur(value):'—';$('remain').textContent=remaining?eur(remaining):'—';$('valueJP').textContent=valueJP?jpy(valueJP):'—';$('remainJP').textContent=remainingJP?jpy(remainingJP):'—';
 $('valueJPWrap').hidden=s.lang!=='jp';$('remainJPWrap').hidden=s.lang!=='jp';$('valueWrap').firstChild.textContent=s.lang==='jp'?'Valeur possédée EUR':'Valeur possédée';$('remainWrap').firstChild.textContent=s.lang==='jp'?'Budget restant EUR':'Budget restant';$('priceJPLabel').hidden=s.lang!=='jp';
 let q=$('search').value.toLowerCase(),shown=a.filter(c=>(filter==='all'||(filter==='owned'?c.owned:!c.owned))&&[c.name,c.number,c.notes,c.rarity].join(' ').toLowerCase().includes(q));
 $('cards').innerHTML=shown.map(c=>`<article class="card">${c.image?`<img loading="lazy" src="${esc(c.image)}" alt="${esc(c.name)}">`:'<div class="placeholder">✦</div>'}<div class="info"><b>${esc(c.name)}</b><div class="meta">${esc(c.number||'Numéro non renseigné')}${c.rarity?' · '+esc(c.rarity):''}${c.category?' · '+esc(c.category):''}${c.types?.length?' · '+esc(c.types.join(', ')):''}${c.illustrator?' · '+esc(c.illustrator):''}${c.variants&&Object.keys(c.variants).filter(k=>c.variants[k]).length?' · '+esc(Object.keys(c.variants).filter(k=>c.variants[k]).join(' / ')):''}</div><div class="prices">${c.priceFR?`<strong>${eur(+c.priceFR)}</strong>`:'Prix EUR —'}${s.lang==='jp'?' · '+(c.priceJP?`<strong>${jpy(+c.priceJP)}</strong>`:'Prix JPY —'):''}</div><label class="own"><input type="checkbox" data-own="${esc(c.id)}" ${c.owned?'checked':''}> Possédée <button type="button" class="edit" data-edit="${esc(c.id)}">Modifier</button></label></div></article>`).join('');
 $('empty').hidden=a.length>0;$('cards').hidden=!shown.length;if(a.length&&!shown.length)$('cards').innerHTML='<p class="meta">Aucun résultat.</p>';
}
function openForm(c){editing=c?.id||null;$('form').reset();$('dlgTitle').textContent=c?'Modifier la carte':'Ajouter une carte';if(c)Object.entries(c).forEach(([k,v])=>{let el=$('form').elements[k];if(el){if(el.type==='checkbox')el.checked=!!v;else el.value=v??''}});$('priceJPLabel').hidden=sets[current].lang!=='jp';$('dlg').showModal()}
function closeForm(){$('dlg').close();editing=null}
$('home').onclick=$('back').onclick=goHome;$('add').onclick=$('firstAdd').onclick=()=>openForm();$('close').onclick=$('cancel').onclick=closeForm;
$('languageBack').onclick=goHome;
$('form').onsubmit=e=>{e.preventDefault();let f=new FormData(e.target),old=db.cards.find(x=>x.id===editing),c={...(old||{}),id:editing||crypto.randomUUID(),set:old?.set||current,name:String(f.get('name')||'').trim(),number:String(f.get('number')||'').trim(),image:String(f.get('image')||'').trim(),priceFR:f.get('priceFR')||'',priceJP:sets[current].lang==='jp'?(f.get('priceJP')||''):'',owned:f.has('owned'),notes:String(f.get('notes')||'').trim()};db.cards=editing?db.cards.map(x=>x.id===editing?c:x):[...db.cards,c];closeForm();save()};
$('cards').onclick=e=>{let id=e.target.dataset.edit;if(id)openForm(db.cards.find(c=>c.id===id))};$('cards').onchange=e=>{let id=e.target.dataset.own;if(id){let c=db.cards.find(x=>String(x.id)===String(id));if(c){c.owned=e.target.checked;save()}}};
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('selected',x===b));renderCollection()});$('search').oninput=renderCollection;
function loadCatalog(manual){const list=(window.CATALOG||{})[sets[current].catalog||current];if(!list?.length){$('apiStatus').textContent=current==='meg-fr'?'Le catalogue français sera disponible après génération depuis GitHub Actions. Les autres listes japonaises seront ajoutées avec une source vérifiée.':'Cette checklist est prête. Le catalogue complet de cette série reste à intégrer ; tu peux déjà ajouter tes cartes manuellement.';return 0}
 const existing=new Set(collectionCards().map(c=>String(c.number))),toAdd=list.filter(c=>!existing.has(String(c.number??c.n??'')));for(const c of toAdd)db.cards.push({id:crypto.randomUUID(),set:current,name:c.name,number:c.number??c.n??'',image:c.image??c.img??'',rarity:c.rarity??c.r??'',category:c.category||'',types:c.types||[],hp:c.hp||'',illustrator:c.illustrator||'',variants:c.variants||{},priceFR:'',priceJP:'',owned:false,notes:''});if(toAdd.length)save();$('apiStatus').textContent=`${list.length} cartes référencées · ${toAdd.length} ajoutée(s) à ta checklist. Les cartes déjà cochées sont conservées.`;return toAdd.length}
$('checkApi').onclick=()=>loadCatalog(true);renderHome();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
