import { DiscoveryAuditPlugin, AuditResult, AuditIssue } from './types';

export class CrawlabilityEnginePlugin implements DiscoveryAuditPlugin {
  name = 'crawlability';
  weight = 1.0;

  run(url: string, documentContext?: Document): AuditResult {
    const issues: AuditIssue[] = [];
    let score = 100;

    if (!documentContext) {
      return { score: 0, passed: false, issues: [{ type: 'critical', message: 'No document context provided' }] };
    }

    // 1. Meta Robots
    const robots = documentContext.querySelector('meta[name="robots"]');
    if (robots) {
      const content = robots.getAttribute('content')?.toLowerCase() || '';
      if (content.includes('noindex')) {
        issues.push({ type: 'warning', message: 'Page has a noindex directive. It will not appear in search results.', element: 'meta[name="robots"]' });
        score -= 50; // Heavily penalize for discovery engine purposes
      }
      if (content.includes('nofollow')) {
        issues.push({ type: 'warning', message: 'Page has a nofollow directive. Internal links will not pass value.', element: 'meta[name="robots"]' });
        score -= 30;
      }
    } else {
      issues.push({ type: 'info', message: 'No explicit meta robots tag. Defaulting to index, follow.' });
    }

    // 2. Canonical URL validation
    const canonical = documentContext.querySelector('link[rel="canonical"]');
    if (canonical) {
      const href = canonical.getAttribute('href');
      // If we are given a URL, check if canonical matches
      if (url && href && !href.includes(url.split('?')[0]) && !url.includes(href.split('?')[0])) {
         issues.push({ type: 'warning', message: `Canonical URL (${href}) does not match current path (${url}). Ensure this is intentional.`, element: 'link[rel="canonical"]' });
         score -= 10;
      }
    }

    // 3. Client-side routing redirects (simulated)
    const hasRedirectMeta = documentContext.querySelector('meta[http-equiv="refresh"]');
    if (hasRedirectMeta) {
      issues.push({ type: 'critical', message: 'Avoid using meta refresh for redirects. Use 301 server redirects.', element: 'meta[http-equiv="refresh"]' });
      score -= 20;
    }

    return {
      score: Math.max(0, score),
      passed: score >= 80,
      issues,
    };
  }
}
