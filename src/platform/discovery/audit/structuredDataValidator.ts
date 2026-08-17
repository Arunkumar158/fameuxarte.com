import { DiscoveryAuditPlugin, AuditResult, AuditIssue } from './types';

export class StructuredDataValidatorPlugin implements DiscoveryAuditPlugin {
  name = 'structuredData';
  weight = 1.0;

  run(url: string, documentContext?: Document): AuditResult {
    const issues: AuditIssue[] = [];
    let score = 100;
    
    if (!documentContext) {
      return { score: 0, passed: false, issues: [{ type: 'critical', message: 'No document context provided' }] };
    }

    const scriptTags = Array.from(documentContext.querySelectorAll('script[type="application/ld+json"]'));
    if (scriptTags.length === 0) {
      return {
        score: 0,
        passed: false,
        issues: [{ type: 'critical', message: 'No JSON-LD structured data found on the page.' }]
      };
    }

    let parsedSchemas: any[] = [];
    scriptTags.forEach(script => {
      try {
        const parsed = JSON.parse(script.textContent || '{}');
        // Handle array of schemas vs single schema
        if (Array.isArray(parsed)) {
          parsedSchemas.push(...parsed);
        } else {
          parsedSchemas.push(parsed);
        }
      } catch (e) {
        issues.push({ type: 'critical', message: 'Invalid JSON-LD format. Could not parse.', element: 'script[type="application/ld+json"]' });
        score -= 50;
      }
    });

    // Validations based on type
    let hasOrganization = false;
    let hasPrimaryEntity = false;

    parsedSchemas.forEach(schema => {
      const type = schema['@type'];
      if (!type) {
        issues.push({ type: 'warning', message: 'Schema missing @type property.' });
        score -= 5;
        return;
      }

      if (type === 'Organization') hasOrganization = true;
      if (['Product', 'Article', 'Person', 'VisualArtwork'].includes(type)) hasPrimaryEntity = true;

      // Basic validation for common types
      if (type === 'Product' || type === 'VisualArtwork') {
        if (!schema.name) {
          issues.push({ type: 'critical', message: `${type} schema missing 'name'.` });
          score -= 10;
        }
        if (!schema.image) {
          issues.push({ type: 'warning', message: `${type} schema missing 'image'.` });
          score -= 5;
        }
        if (!schema.description) {
          issues.push({ type: 'warning', message: `${type} schema missing 'description'.` });
          score -= 5;
        }
      }

      if (type === 'BreadcrumbList') {
        if (!schema.itemListElement || schema.itemListElement.length === 0) {
          issues.push({ type: 'warning', message: 'BreadcrumbList schema is empty.' });
          score -= 5;
        }
      }
    });

    if (!hasOrganization) {
      issues.push({ type: 'info', message: 'Consider adding Organization schema for better brand presence.' });
      score -= 2; // minor deduction
    }

    if (!hasPrimaryEntity) {
      issues.push({ type: 'warning', message: 'No primary entity schema found (e.g., Product, Article, VisualArtwork).' });
      score -= 10;
    }

    // Check for duplicate schemas
    const typesCount = parsedSchemas.reduce((acc, curr) => {
      const type = curr['@type'];
      if (type) acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(typesCount).forEach(([type, count]) => {
      if ((count as number) > 1 && type !== 'ListItem' && type !== 'Question') {
        issues.push({ type: 'info', message: `Multiple schemas of type ${type} found. Ensure this is intentional.` });
      }
    });

    return {
      score: Math.max(0, score),
      passed: score >= 80,
      issues,
      metrics: {
        totalSchemas: parsedSchemas.length,
        schemaTypes: Object.keys(typesCount)
      }
    };
  }
}
