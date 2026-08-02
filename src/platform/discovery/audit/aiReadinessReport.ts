import { DiscoveryAuditPlugin, AuditResult, AuditIssue } from './types';

export class AiReadinessPlugin implements DiscoveryAuditPlugin {
  name = 'aiReadiness';
  weight = 1.0;

  run(url: string, documentContext?: Document): AuditResult {
    const issues: AuditIssue[] = [];
    let score = 100;

    if (!documentContext) {
      return { score: 0, passed: false, issues: [{ type: 'critical', message: 'No document context provided' }] };
    }

    // 1. Semantic HTML elements
    const hasMain = documentContext.querySelector('main') !== null;
    const hasHeader = documentContext.querySelector('header') !== null;
    const hasFooter = documentContext.querySelector('footer') !== null;
    const hasArticle = documentContext.querySelector('article') !== null;

    if (!hasMain) {
      issues.push({ type: 'warning', message: 'Missing <main> tag. AI struggles to identify primary content.' });
      score -= 10;
    }
    if (!hasHeader || !hasFooter) {
      issues.push({ type: 'info', message: 'Missing <header> or <footer> tags.' });
      score -= 5;
    }

    // 2. Clear concise title and descriptions (checked in SEO, but AI requires context)
    const title = documentContext.querySelector('title')?.textContent || '';
    if (title.split('|').length > 3) {
      issues.push({ type: 'warning', message: 'Title tag has too many segments. Keep it semantic and focused for LLMs.' });
      score -= 5;
    }

    // 3. Schema.org validation for AI entities
    const scriptTags = Array.from(documentContext.querySelectorAll('script[type="application/ld+json"]'));
    let hasAiEntities = false;
    let hasFAQ = false;

    scriptTags.forEach(script => {
      try {
        const parsed = JSON.parse(script.textContent || '{}');
        const checkEntity = (schema: any) => {
          const type = schema['@type'];
          if (['Person', 'Organization', 'Product', 'VisualArtwork'].includes(type)) {
            hasAiEntities = true;
          }
          if (type === 'FAQPage') hasFAQ = true;
        };

        if (Array.isArray(parsed)) parsed.forEach(checkEntity);
        else checkEntity(parsed);
      } catch (e) {
        // Handled by structured data validator
      }
    });

    if (!hasAiEntities) {
      issues.push({ type: 'warning', message: 'Missing core semantic entities (Person, Organization, Product) for AI understanding.' });
      score -= 15;
    }

    if (!hasFAQ) {
      issues.push({ type: 'info', message: 'No FAQPage schema detected. FAQs are highly valuable for AI answers.' });
      // Not a penalty, just info
    }

    // 4. Content length / substance
    const mainContent = documentContext.querySelector('main')?.textContent || documentContext.body.textContent || '';
    const wordCount = mainContent.split(/\s+/).filter(word => word.length > 1).length;
    
    if (wordCount < 100) {
      issues.push({ type: 'critical', message: 'Very low word count. LLMs may deem this page thin or unhelpful.' });
      score -= 20;
    }

    return {
      score: Math.max(0, score),
      passed: score >= 80,
      issues,
      metrics: {
        semanticTags: { main: hasMain, header: hasHeader, footer: hasFooter, article: hasArticle },
        wordCount,
        hasAiEntities
      }
    };
  }
}
