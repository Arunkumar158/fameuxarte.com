import { DiscoveryAuditPlugin, AuditResult, AuditIssue } from './types';

export class SeoEnginePlugin implements DiscoveryAuditPlugin {
  name = 'seo';
  weight = 1.0;

  run(url: string, documentContext?: Document): AuditResult {
    const issues: AuditIssue[] = [];
    let score = 100;

    if (!documentContext) {
      return { score: 0, passed: false, issues: [{ type: 'critical', message: 'No document context provided for SEO audit' }] };
    }

    // 1. Title tag
    const title = documentContext.querySelector('title');
    if (!title || !title.textContent) {
      issues.push({ type: 'critical', message: 'Missing <title> tag', element: 'head > title' });
      score -= 20;
    } else if (title.textContent.length < 10 || title.textContent.length > 70) {
      issues.push({ type: 'warning', message: 'Title tag length is outside optimal range (10-70 chars)', element: 'head > title' });
      score -= 5;
    }

    // 2. Meta Description
    const metaDesc = documentContext.querySelector('meta[name="description"]');
    if (!metaDesc || !metaDesc.getAttribute('content')) {
      issues.push({ type: 'critical', message: 'Missing meta description', element: 'meta[name="description"]' });
      score -= 20;
    } else {
      const content = metaDesc.getAttribute('content') || '';
      if (content.length < 50 || content.length > 160) {
        issues.push({ type: 'warning', message: 'Meta description length is outside optimal range (50-160 chars)', element: 'meta[name="description"]' });
        score -= 5;
      }
    }

    // 3. OpenGraph Tags
    const ogTitle = documentContext.querySelector('meta[property="og:title"]');
    const ogImage = documentContext.querySelector('meta[property="og:image"]');
    if (!ogTitle || !ogImage) {
      issues.push({ type: 'warning', message: 'Missing critical OpenGraph tags (og:title or og:image)', element: 'meta[property^="og:"]' });
      score -= 10;
    }

    // 4. Canonical Tag
    const canonical = documentContext.querySelector('link[rel="canonical"]');
    if (!canonical || !canonical.getAttribute('href')) {
      issues.push({ type: 'critical', message: 'Missing canonical URL', element: 'link[rel="canonical"]' });
      score -= 15;
    }

    // 5. H1 Tag
    const h1s = documentContext.querySelectorAll('h1');
    if (h1s.length === 0) {
      issues.push({ type: 'critical', message: 'Missing <h1> tag on page', element: 'h1' });
      score -= 15;
    } else if (h1s.length > 1) {
      issues.push({ type: 'warning', message: 'Multiple <h1> tags found. Consider using only one.', element: 'h1' });
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      passed: score >= 80,
      issues,
    };
  }
}
