import { DiscoveryAuditPlugin, AuditResult, AuditIssue } from './types';

export class InternalLinkAuditPlugin implements DiscoveryAuditPlugin {
  name = 'internalLinking';
  weight = 0.8;

  run(url: string, documentContext?: Document): AuditResult {
    const issues: AuditIssue[] = [];
    let score = 100;

    if (!documentContext) {
      return { score: 0, passed: false, issues: [{ type: 'critical', message: 'No document context provided' }] };
    }

    const allLinks = Array.from(documentContext.querySelectorAll('a[href]'));
    let internalLinksCount = 0;
    let externalLinksCount = 0;
    let missingHref = 0;
    let hashLinks = 0;

    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href === '' || href === '#') {
        missingHref++;
      } else if (href.startsWith('#')) {
        hashLinks++;
      } else if (href.startsWith('http') && !href.includes('fameuxarte.com')) {
        externalLinksCount++;
      } else {
        internalLinksCount++;
      }
    });

    if (missingHref > 0) {
      issues.push({
        type: 'warning',
        message: `${missingHref} links have empty or placeholder ('#') href attributes.`,
        element: 'a[href=""], a[href="#"]'
      });
      score -= Math.min(20, missingHref * 2);
    }

    if (internalLinksCount === 0) {
      issues.push({
        type: 'critical',
        message: 'No internal links found on this page. This could be an orphan node in the discovery graph.',
        element: 'body'
      });
      score -= 30;
    } else if (internalLinksCount < 5) {
      issues.push({
        type: 'warning',
        message: 'Low internal link count. Consider increasing connections to other discovery pages.',
        element: 'body'
      });
      score -= 10;
    }

    // Check for Discovery Graph participation
    const hasBreadcrumbs = documentContext.querySelector('nav[aria-label="Breadcrumb"]') !== null || documentContext.querySelector('nav[aria-label="breadcrumb"]') !== null;
    if (!hasBreadcrumbs) {
      issues.push({
        type: 'info',
        message: 'No visible breadcrumbs navigation detected. Breadcrumbs strengthen the discovery graph.'
      });
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      passed: score >= 80,
      issues,
      metrics: {
        totalLinks: allLinks.length,
        internalLinks: internalLinksCount,
        externalLinks: externalLinksCount,
        hashLinks
      }
    };
  }
}
