/**
 * Fameuxarte Robots Architecture
 * Environment-aware robots.txt rules generator.
 */

export type Environment = 'production' | 'preview' | 'staging' | 'development';

export class RobotsEngine {
  /**
   * Generates robots.txt rules content based on the target deployment environment
   */
  public static generateRobotsTxt(env: Environment = 'production', siteUrl = 'https://gallery-canvas-commerce.vercel.app'): string {
    if (env !== 'production') {
      return `# Fameuxarte Robots.txt - Non-Production Environment (${env})
User-agent: *
Disallow: /
`;
    }

    return `# Fameuxarte Robots.txt - Production Environment
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /collector/
Disallow: /checkout/
Disallow: /cart/
Disallow: /account/
Disallow: /profile/

# AI Crawlers & LLM Indexers Access Directives
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bytespider
Allow: /

# Sitemap Index
Sitemap: ${siteUrl}/sitemap-index.xml
`;
  }
}
