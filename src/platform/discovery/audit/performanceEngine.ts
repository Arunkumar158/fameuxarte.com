import { DiscoveryAuditPlugin, AuditResult, AuditIssue } from './types';

export class PerformanceEnginePlugin implements DiscoveryAuditPlugin {
  name = 'performance';
  weight = 1.0;

  run(url: string, documentContext?: Document): AuditResult {
    const issues: AuditIssue[] = [];
    let score = 100;

    if (!documentContext) {
      return { score: 0, passed: false, issues: [{ type: 'critical', message: 'No document context provided' }] };
    }

    // 1. Image Lazy Loading Optimization (LCP / CLS prevention)
    const images = Array.from(documentContext.querySelectorAll('img'));
    let imagesWithoutLazy = 0;
    images.forEach(img => {
      // Ignore very small tracking images or icons
      if (img.width < 50 || img.height < 50) return;
      if (img.getAttribute('loading') !== 'lazy') {
        imagesWithoutLazy++;
      }
    });

    if (imagesWithoutLazy > 0) {
      issues.push({
        type: 'warning',
        message: `${imagesWithoutLazy} images are missing loading="lazy" attribute.`,
        element: 'img:not([loading="lazy"])'
      });
      score -= Math.min(20, imagesWithoutLazy * 2);
    }

    // 2. Preconnect / Preload checks
    const preloads = documentContext.querySelectorAll('link[rel="preload"]');
    const preconnects = documentContext.querySelectorAll('link[rel="preconnect"]');
    
    if (preloads.length === 0 && preconnects.length === 0) {
      issues.push({
        type: 'info',
        message: 'No preload or preconnect tags found. Consider adding them for critical assets.',
        element: 'head'
      });
      score -= 5;
    }

    // 3. Duplicate script tags (Code splitting check proxy)
    const scripts = Array.from(documentContext.querySelectorAll('script[src]'));
    const srcMap = new Set();
    let duplicates = 0;
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && srcMap.has(src)) duplicates++;
      else if (src) srcMap.add(src);
    });

    if (duplicates > 0) {
      issues.push({
        type: 'critical',
        message: `${duplicates} duplicate script tags found.`,
        element: 'script'
      });
      score -= Math.min(30, duplicates * 10);
    }

    return {
      score: Math.max(0, score),
      passed: score >= 80,
      issues,
      metrics: {
        totalImages: images.length,
        totalScripts: scripts.length
      }
    };
  }
}
