const KEY='poketracker-v1';
let state=JSON.parse(localStorage.getItem(KEY)||'null')||{cards:[],rate:165};
let filter='all', editing=null;
const $=id=>document.getElementById(id);
const euro=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(n);
const yen=n=>new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(n);
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function render(){
 const cards=state.cards, owned=cards.filter(c=>c.owned).length;
 $('tracked').textContent=cards.length;$('owned').textContent=owned;
 $('completion').textContent=(cards.length?Math.round(owned/cards.length*100):0)+' % de complétion';
 const total=cards.filter(c=>c.owned&&Number.isFinite(+c.price)&&c.price!=='').reduce((s,c)=>s+(+c.price),0);
 $('totalValue').textContent=total?euro(total/state.rate):'—';
 $('rate').value=state.rate;
 const q=$('search').value.toLowerCase();
 const shown=cards.filter(c=>(filter==='all'||c.language===filter)&&(`${c.name} ${c.number} ${c.notes}`).toLowerCase().includes(q));
 $('cards').innerHTML=shown.map(c=>`<article class="card"><div class="card-art">✦</div><div class="card-info"><div class="card-title">${esc(c.name)} ${c.owned?'<span class="owned-tag">✓ POSSÉDÉE</span>':''}</div><div class="meta">${c.language==='jp'?'30th japonais':'30th français'}${c.number?' · '+esc(c.number):''}</div><div class="price">${c.price!==''&&c.price!=null?yen(+c.price)+' <em>· '+euro(+c.price/state.rate)+'</em>':'Prix non renseigné'}</div>${c.target?`<div class="meta">Objectif : ${yen(+c.target)} · ${euro(+c.target/state.rate)}</div>`:''}<div class="card-actions"><button class="mini" data-edit="${c.id}">Modifier</button><button class="mini" data-own="${c.id}">${c.owned?'Retirer':'Possédée'}</button><button class="mini" data-delete="${c.id}">Supprimer</button></div></div></article>`).join('');
 $('empty').style.display=cards.length?'none':'block';$('cards').style.display=shown.length?'grid':'none';
 if(cards.length&&shown.length===0){$('cards').style.display='block';$('cards').innerHTML='<p class="empty">Aucun résultat pour cette recherche.</p>'}
}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function openForm(card=null){editing=card?.id??null;$('cardForm').reset();$('dialogTitle').textContent=card?'Modifier la carte':'Ajouter une carte';if(card){for(const [k,v] of Object.entries(card)){const el=$('cardForm').elements[k];if(el){if(el.type==='checkbox')el.checked=!!v;else el.value=v??''}}}$('cardDialog').showModal()}
function close(){ $('cardDialog').close();editing=null}
$('addCard').onclick=$('emptyAdd').onclick=()=>openForm();
$('closeDialog').onclick=$('cancelDialog').onclick=close;
$('cardForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),card={id:editing||crypto.randomUUID(),name:f.get('name').trim(),language:f.get('language'),number:f.get('number').trim(),price:f.get('price'),target:f.get('target'),owned:f.has('owned'),notes:f.get('notes').trim()};if(editing)state.cards=state.cards.map(c=>c.id===editing?card:c);else state.cards.push(card);close();save()};
$('cards').onclick=e=>{const b=e.target.closest('button');if(!b)return;const id=b.dataset.edit||b.dataset.own||b.dataset.delete;const c=state.cards.find(x=>x.id===id);if(b.dataset.edit)openForm(c);if(b.dataset.own){c.owned=!c.owned;save()}if(b.dataset.delete&&confirm('Supprimer cette carte du suivi ?')){state.cards=state.cards.filter(x=>x.id!==id);save()}};
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));render()});
$('search').oninput=render;$('saveRate').onclick=()=>{const r=+$('rate').value;if(r>0){state.rate=r;save();$('rateNote').textContent='Taux enregistré : 1 € = '+r+' JPY.'}};
render();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
