import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DISCOVERY_REGISTRY } from '../src/lib/discovery/registry';
import { TaxonomyEngine } from '../src/platform/discovery/taxonomyEngine';
import { CombinationScorer } from '../src/platform/discovery/combinationScorer';
import { SlugGenerator } from '../src/platform/discovery/slugGenerator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_URLS_PER_SITEMAP = 50000;
const PUBLIC_DIR = path.join(__dirname, '../public');

async function generateProgrammaticSitemaps() {
  console.log('Generating Programmatic Discovery Sitemaps...');
  
  const entities = Object.values(DISCOVERY_REGISTRY);
  const validCombinations: string[] = [];

  // Generate Pairs (Depth 2) for simplicity
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const combo = [entities[i], entities[j]];
      if (TaxonomyEngine.validateCombination(combo) && CombinationScorer.isIndexable(combo)) {
        const slug = SlugGenerator.generateSlug(combo);
        validCombinations.push(`https://fameuxarte.com/discover/${slug}`);
      }
    }
  }

  // Generate Triples (Depth 3) if they pass the scorer
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      for (let k = j + 1; k < entities.length; k++) {
        const combo = [entities[i], entities[j], entities[k]];
        if (TaxonomyEngine.validateCombination(combo) && CombinationScorer.isIndexable(combo)) {
          const slug = SlugGenerator.generateSlug(combo);
          validCombinations.push(`https://fameuxarte.com/discover/${slug}`);
        }
      }
    }
  }

  // Deduplicate
  const uniqueUrls = Array.from(new Set(validCombinations));
  console.log(`Generated ${uniqueUrls.length} valid programmatic URLs.`);

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  let fileIndex = 1;
  for (let i = 0; i < uniqueUrls.length; i += MAX_URLS_PER_SITEMAP) {
    const chunk = uniqueUrls.slice(i, i + MAX_URLS_PER_SITEMAP);
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    for (const url of chunk) {
      xml += `  <url>\n`;
      xml += `    <loc>${url}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }
    
    xml += `</urlset>`;
    
    const sitemapPath = path.join(PUBLIC_DIR, `sitemap-programmatic-${fileIndex}.xml`);
    fs.writeFileSync(sitemapPath, xml);
    console.log(`Wrote ${sitemapPath}`);
    fileIndex++;
  }

  console.log('Finished generating sitemaps.');
}

generateProgrammaticSitemaps().catch(console.error);
