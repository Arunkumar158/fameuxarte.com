import { DiscoveryAuditPlugin, AuditResult, AuditIssue } from './types';

export class AccessibilityEnginePlugin implements DiscoveryAuditPlugin {
  name = 'accessibility';
  weight = 1.0;

  run(url: string, documentContext?: Document): AuditResult {
    const issues: AuditIssue[] = [];
    let score = 100;

    if (!documentContext) {
      return { score: 0, passed: false, issues: [{ type: 'critical', message: 'No document context provided' }] };
    }

    // 1. Image alt texts
    const images = Array.from(documentContext.querySelectorAll('img'));
    let missingAlt = 0;
    images.forEach(img => {
      // Role presentation doesn't need alt
      if (img.getAttribute('role') === 'presentation') return;
      if (!img.hasAttribute('alt')) {
        missingAlt++;
      }
    });

    if (missingAlt > 0) {
      issues.push({
        type: 'critical',
        message: `${missingAlt} images are missing 'alt' attributes.`,
        element: 'img:not([alt])'
      });
      score -= Math.min(30, missingAlt * 5);
    }

    // 2. Button ARIA or accessible name
    const buttons = Array.from(documentContext.querySelectorAll('button'));
    let inaccessibleButtons = 0;
    buttons.forEach(btn => {
      if (!btn.textContent?.trim() && !btn.getAttribute('aria-label') && !btn.getAttribute('aria-labelledby')) {
        inaccessibleButtons++;
      }
    });

    if (inaccessibleButtons > 0) {
      issues.push({
        type: 'critical',
        message: `${inaccessibleButtons} buttons have no accessible name (text or aria-label).`,
        element: 'button'
      });
      score -= Math.min(20, inaccessibleButtons * 5);
    }

    // 3. Heading hierarchy (H1 -> H2 -> H3)
    const headings = Array.from(documentContext.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let previousLevel = 0;
    let skippedLevels = 0;

    headings.forEach(heading => {
      const level = parseInt(heading.tagName[1], 10);
      if (previousLevel > 0 && level > previousLevel + 1) {
        skippedLevels++;
      }
      previousLevel = level;
    });

    if (skippedLevels > 0) {
      issues.push({
        type: 'warning',
        message: `Heading levels skipped ${skippedLevels} times (e.g., H1 directly to H3).`,
        element: 'h1, h2, h3, h4, h5, h6'
      });
      score -= Math.min(15, skippedLevels * 5);
    }

    // 4. Form labels
    const inputs = Array.from(documentContext.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"])'));
    let missingLabels = 0;
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      const hasAssociatedLabel = id ? documentContext.querySelector(`label[for="${id}"]`) : false;
      const isWrappedInLabel = input.closest('label');
      const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');

      if (!hasAssociatedLabel && !isWrappedInLabel && !hasAriaLabel) {
        missingLabels++;
      }
    });

    if (missingLabels > 0) {
      issues.push({
        type: 'critical',
        message: `${missingLabels} form inputs are missing accessible labels.`,
        element: 'input'
      });
      score -= Math.min(25, missingLabels * 5);
    }

    return {
      score: Math.max(0, score),
      passed: score >= 90, // Strict accessibility passing threshold
      issues,
    };
  }
}
