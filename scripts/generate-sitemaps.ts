/**
 * Fameuxarte Sitemap Generator CLI Script
 * Node script to generate XML sitemaps and robots.txt into public/ directory.
 */

import fs from 'fs';
import path from 'path';
import { SitemapRegistry, SitemapCategory } from '../src/platform/discovery/sitemapRegistry';
import { RobotsEngine } from '../src/platform/discovery/robotsEngine';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const BASE_URL = 'https://gallery-canvas-commerce.vercel.app';

console.log('Generating Fameuxarte Discovery Platform Sitemaps & Robots.txt...');

// Register Main static pages
SitemapRegistry.registerUrls('main', [
  { url: `${BASE_URL}/`, priority: 1.0, changefreq: 'daily' },
  { url: `${BASE_URL}/artworks`, priority: 0.9, changefreq: 'daily' },
  { url: `${BASE_URL}/artists`, priority: 0.9, changefreq: 'daily' },
  { url: `${BASE_URL}/collections`, priority: 0.8, changefreq: 'weekly' },
  { url: `${BASE_URL}/blog`, priority: 0.8, changefreq: 'weekly' },
  { url: `${BASE_URL}/for-artists`, priority: 0.7, changefreq: 'monthly' },
  { url: `${BASE_URL}/our-story`, priority: 0.6, changefreq: 'monthly' },
  { url: `${BASE_URL}/contact-us`, priority: 0.5, changefreq: 'monthly' },
  { url: `${BASE_URL}/faq`, priority: 0.6, changefreq: 'monthly' }
]);

const categories: SitemapCategory[] = ['main', 'artworks', 'artists', 'collections', 'blog'];

// Write individual category sitemaps
categories.forEach(cat => {
  const entries = SitemapRegistry.getEntries(cat);
  const xml = SitemapRegistry.buildSitemapXml(entries);
  const filePath = path.join(PUBLIC_DIR, `sitemap-${cat}.xml`);
  fs.writeFileSync(filePath, xml, 'utf8');
  console.log(`✓ Wrote ${filePath}`);
});

// Write Sitemap Index
const indexXml = SitemapRegistry.buildSitemapIndexXml(BASE_URL, categories);
const indexPath = path.join(PUBLIC_DIR, 'sitemap-index.xml');
fs.writeFileSync(indexPath, indexXml, 'utf8');
console.log(`✓ Wrote ${indexPath}`);

// Write Robots.txt
const robotsTxt = RobotsEngine.generateRobotsTxt('production', BASE_URL);
const robotsPath = path.join(PUBLIC_DIR, 'robots.txt');
fs.writeFileSync(robotsPath, robotsTxt, 'utf8');
console.log(`✓ Wrote ${robotsPath}`);

console.log('Fameuxarte Sitemaps & Robots.txt generation complete!');
