/**
 * Fameuxarte Sitemap Registry
 * Modular sitemap generator registry capable of generating XML indices and sub-sitemaps.
 */

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: Array<{ loc: string; title?: string; caption?: string }>;
}

export type SitemapCategory = 'main' | 'artworks' | 'artists' | 'collections' | 'blog' | 'images' | 'videos';

export class SitemapRegistry {
  private static registries: Map<SitemapCategory, SitemapEntry[]> = new Map();

  /**
   * Registers URLs into a sitemap category
   */
  public static registerUrls(category: SitemapCategory, entries: SitemapEntry[]): void {
    const existing = this.registries.get(category) || [];
    this.registries.set(category, [...existing, ...entries]);
  }

  /**
   * Retrieves registered sitemap entries for a category
   */
  public static getEntries(category: SitemapCategory): SitemapEntry[] {
    return this.registries.get(category) || [];
  }

  /**
   * Builds XML sitemap string for a category
   */
  public static buildSitemapXml(entries: SitemapEntry[]): string {
    const xmlEntries = entries.map(entry => {
      let xml = `  <url>\n    <loc>${entry.url}</loc>\n`;
      if (entry.lastmod) xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
      if (entry.changefreq) xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      if (entry.priority !== undefined) xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;

      if (entry.images && entry.images.length > 0) {
        entry.images.forEach(img => {
          xml += `    <image:image>\n      <image:loc>${img.loc}</image:loc>\n`;
          if (img.title) xml += `      <image:title>${this.escapeXml(img.title)}</image:title>\n`;
          if (img.caption) xml += `      <image:caption>${this.escapeXml(img.caption)}</image:caption>\n`;
          xml += `    </image:image>\n`;
        });
      }

      xml += `  </url>`;
      return xml;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${xmlEntries}\n</urlset>`;
  }

  /**
   * Builds XML sitemap index string referencing all sitemap files
   */
  public static buildSitemapIndexXml(baseUrl: string, categories: SitemapCategory[]): string {
    const sitemaps = categories.map(cat => `  <sitemap>\n    <loc>${baseUrl}/sitemap-${cat}.xml</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n  </sitemap>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps}\n</sitemapindex>`;
  }

  private static escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }
}
