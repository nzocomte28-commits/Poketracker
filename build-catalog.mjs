// Construit un catalogue local à partir de TCGdex.
// Important : le filtrage se fait sur la catégorie de carte, jamais sur son nom.
// Ainsi, les cartes Dresseur contenant le mot « Énergie » sont conservées.
import fs from 'node:fs/promises';
import path from 'node:path';
const API='https://api.tcgdex.net/v2/';
const sets=JSON.parse(await fs.readFile('catalog-sets.json','utf8'));
const safe=s=>String(s).replace(/[^a-zA-Z0-9._-]/g,'_');
async function getJson(url){const r=await fetch(url);if(!r.ok)throw new Error(`${r.status} ${url}`);return r.json();}
async function pool(items,size,fn){let i=0;await Promise.all(Array.from({length:size},async()=>{while(i<items.length){const n=i++;await fn(items[n],n)}}));}
let out={};
try{const raw=await fs.readFile('catalog-data.js','utf8');out=JSON.parse(raw.slice(raw.indexOf('=')+1,raw.lastIndexOf(';')))}catch{}
for(const s of sets){
 try{
  const detail=await getJson(`${API}${s.lang}/sets/${encodeURIComponent(s.id)}`);
  if(!Array.isArray(detail.cards)||!detail.cards.length)throw new Error('La série ne contient aucune carte listée');
  const cards=[];
  await pool(detail.cards,6,async brief=>{
   const full=await getJson(`${API}${s.lang}/cards/${encodeURIComponent(brief.id)}`);
   if(String(full.category||'').toLowerCase()==='energy')return;
   let img='';
   if(brief.image){const rel=`catalog/images/${s.key}/${safe(brief.localId)}.webp`;await fs.mkdir(path.dirname(rel),{recursive:true});
    try{await fs.access(rel);img=rel}catch{try{const r=await fetch(`${brief.image}/low.webp`);if(r.ok){await fs.writeFile(rel,Buffer.from(await r.arrayBuffer()));img=rel}}catch{}}
   }
   cards.push({n:brief.localId,name:full.name||brief.name,r:full.rarity||'',category:full.category||'',img});
  });
  cards.sort((a,b)=>String(a.n).localeCompare(String(b.n),'en',{numeric:true}));
  if(!cards.length)throw new Error('Aucune carte exploitable après vérification des catégories');
  out[s.key]=cards;console.log(`${s.displayCode||s.key}: ${cards.length} cartes conservées`);
 }catch(err){console.error(`${s.key}: catalogue inchangé — ${err.message}`)}
}
await fs.writeFile('catalog-data.js','window.CATALOG='+JSON.stringify(out)+';\n');
