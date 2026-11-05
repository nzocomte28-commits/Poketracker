// PokéTracker V38 — catalogue complet (toutes les séries FR + JP) depuis TCGdex.
// Un fichier JSON par extension (catalog/sets/<clé>.json), un index et un fichier de recherche.
// Les images ne sont PAS copiées : elles sont chargées depuis assets.tcgdex.net.
// Incrémental : une extension déjà générée n'est pas retéléchargée (relancer le workflow complète le reste).
import fs from 'node:fs/promises';

const API = 'https://api.tcgdex.net/v2', LANGS = ['fr', 'ja'];
const LEGACY = {'fr:me01': 'meg-fr'};
const MAX_MS = 5 * 60 * 60 * 1000, START = Date.now();
const delay = ms => new Promise(r => setTimeout(r, ms));
const keyOf = (lang, id) => LEGACY[lang + ':' + id] || id.toLowerCase().replace(/[^a-z0-9]+/g, '') + (lang === 'ja' ? '-jp' : '');

async function get(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, {headers: {'user-agent': 'PokeTracker/38'}});
      if (r.ok) return await r.json();
      if (r.status === 404) return null;
    } catch {}
    await delay(600 * (i + 1));
  }
  return null;
}
async function pool(items, limit, task) {
  let i = 0;
  await Promise.all(Array.from({length: limit}, async () => { while (i < items.length) await task(items[i++]); }));
}

await fs.mkdir('catalog/sets', {recursive: true});
const index = [], search = [], failed = [], sinfo = {};

for (const lang of LANGS) {
  const series = await get(`${API}/${lang}/series`) || [];
  for (const s of series) {
    const serie = await get(`${API}/${lang}/series/${encodeURIComponent(s.id)}`);
    if (lang === 'fr' && !sinfo[s.id]) sinfo[s.id] = {id: s.id, name: s.name, logo: s.logo || serie?.logo || ''};
    if (String(s.id).toLowerCase() === 'tcgp') continue; // Pokémon TCG Pocket : hors périmètre
    for (const b of serie?.sets || []) {
      const key = keyOf(lang, b.id), file = `catalog/sets/${key}.json`;
      let cards = null;
      try { cards = JSON.parse(await fs.readFile(file, 'utf8')); } catch {}
      if (!cards && Date.now() - START < MAX_MS) {
        const d = await get(`${API}/${lang}/sets/${encodeURIComponent(b.id)}`);
        if (d?.cards?.length) {
          const out = [];
          await pool(d.cards, 6, async c => {
            const f = await get(`${API}/${lang}/cards/${encodeURIComponent(c.id)}`);
            if (!f) return;
            const cat = String(f.category || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            if (cat === 'energy' || cat === 'energie') return; // les cartes Dresseur « Énergie » sont conservées
            const o = {number: String(f.localId ?? c.localId), name: f.name || c.name};
            if (f.image) o.image = f.image + '/low.webp';
            if (f.rarity) o.rarity = f.rarity;
            if (f.category) o.category = f.category;
            if (f.types?.length) o.types = f.types;
            if (f.hp) o.hp = f.hp;
            if (f.illustrator) o.illustrator = f.illustrator;
            if (f.variants) o.variants = f.variants;
            out.push(o);
          });
          if (out.length) {
            out.sort((x, y) => x.number.localeCompare(y.number, undefined, {numeric: true}));
            await fs.writeFile(file, JSON.stringify(out));
            cards = out;
          }
        }
      }
      if (!cards) { failed.push(`${lang}/${b.id}`); continue; }
      index.push({key, lang, serie: s.id, id: b.id, name: b.name, count: cards.length, logo: b.logo || ''});
      for (const c of cards) search.push([key, c.number, c.name]);
      console.log(`✔ ${key} (${cards.length})`);
    }
  }
}

if (!index.length) { console.error('Aucune extension récupérée.'); process.exit(1); }
await fs.writeFile('catalog/index.json', JSON.stringify({generated: new Date().toISOString(), series: Object.values(sinfo), sets: index}));
await fs.writeFile('catalog/search.json', JSON.stringify(search));
console.log(`${index.length} extensions, ${search.length} cartes.`);
if (failed.length) console.log(`À relancer (non récupérées) : ${failed.join(', ')}`);
