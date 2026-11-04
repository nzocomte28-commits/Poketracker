// PokéTracker V13 — catalogue FR/JP depuis TCGdex.
// Les données sont téléchargées par GitHub Actions puis stockées dans le dépôt.
// Filtrage par catégorie uniquement : les cartes Dresseur contenant « Énergie » restent.
import fs from 'node:fs/promises';
import path from 'node:path';

const API = 'https://api.tcgdex.net/v2';
const config = JSON.parse(await fs.readFile('catalog-sets.json', 'utf8'));
const safe = value => String(value ?? '').replace(/[^a-zA-Z0-9._-]/g, '_');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getJson(url, attempts = 3) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(url, {headers:{'user-agent':'PokeTracker/13'}});
      if (!response.ok) throw new Error(`HTTP ${response.status} — ${url}`);
      return await response.json();
    } catch (error) {
      last = error;
      await delay(500 * (i + 1));
    }
  }
  throw last;
}

async function pool(items, limit, task) {
  let next = 0;
  const workers = Array.from({length:limit}, async () => {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      await task(items[index], index);
    }
  });
  await Promise.all(workers);
}

let catalog = {};
try {
  const source = await fs.readFile('catalog-data.js','utf8');
  const start = source.indexOf('=');
  const end = source.lastIndexOf(';');
  if (start >= 0 && end > start) catalog = JSON.parse(source.slice(start+1,end));
} catch {}

let failures = [];
for (const set of config) {
  try {
    const details = await getJson(`${API}/${set.lang}/sets/${encodeURIComponent(set.id)}`);
    if (!Array.isArray(details.cards) || details.cards.length === 0) {
      throw new Error('Aucune carte renvoyée par TCGdex pour cet identifiant');
    }

    const cards = [];
    await pool(details.cards, 5, async brief => {
      const full = await getJson(`${API}/${set.lang}/cards/${encodeURIComponent(brief.id)}`);
      const category = String(full.category || '').toLowerCase();
      if (category === 'energy') return; // ne supprime pas les cartes Dresseur « Énergie »

      let image = '';
      if (brief.image) {
        const relative = `catalog/images/${set.key}/${safe(brief.localId)}.webp`;
        await fs.mkdir(path.dirname(relative), {recursive:true});
        try {
          await fs.access(relative);
          image = relative;
        } catch {
          try {
            const response = await fetch(`${brief.image}/low.webp`);
            if (response.ok) {
              await fs.writeFile(relative, Buffer.from(await response.arrayBuffer()));
              image = relative;
            } else {
              const fallback = await fetch(`${brief.image}/low.png`);
              if (fallback.ok) {
                const png = `catalog/images/${set.key}/${safe(brief.localId)}.png`;
                await fs.writeFile(png, Buffer.from(await fallback.arrayBuffer()));
                image = png;
              }
            }
          } catch (error) {
            console.warn(`Image non téléchargée ${brief.id}: ${error.message}`);
          }
        }
      }

      cards.push({
        id: brief.id,
        number: String(brief.localId ?? ''),
        name: full.name || brief.name || '',
        category: full.category || '',
        rarity: full.rarity || '',
        types: full.types || [],
        hp: full.hp || '',
        illustrator: full.illustrator || '',
        variants: full.variants || {},
        image,
        imageSource: brief.image || ''
      });
    });

    cards.sort((a,b) => a.number.localeCompare(b.number, undefined, {numeric:true}));
    if (!cards.length) throw new Error('Toutes les entrées ont été filtrées');
    if (set.expectedCards && cards.length !== set.expectedCards) {
      console.warn(`${set.displayCode}: ${cards.length} cartes reçues, ${set.expectedCards} attendues selon la référence catalogue. Vérifier les données.`);
    }
    catalog[set.key] = cards;
    console.log(`${set.displayCode}: ${cards.length} cartes ajoutées au catalogue.`);
  } catch (error) {
    failures.push(`${set.displayCode}: ${error.message}`);
    console.error(`${set.displayCode}: échec — ${error.message}`);
  }
}

await fs.writeFile('catalog-data.js', `window.CATALOG=${JSON.stringify(catalog)};\\n`);
if (failures.length) {
  console.error('\\nCertaines séries n’ont pas été actualisées :\\n' + failures.join('\\n'));
  process.exitCode = 1;
}
