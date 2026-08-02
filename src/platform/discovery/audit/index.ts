import { discoveryAuditEngine } from './discoveryAuditEngine';
import { SeoEnginePlugin } from './seoEngine';
import { PerformanceEnginePlugin } from './performanceEngine';
import { AccessibilityEnginePlugin } from './accessibilityEngine';
import { StructuredDataValidatorPlugin } from './structuredDataValidator';
import { InternalLinkAuditPlugin } from './internalLinkAudit';
import { AiReadinessPlugin } from './aiReadinessReport';
import { CrawlabilityEnginePlugin } from './crawlabilityEngine';

// Register all plugins
discoveryAuditEngine.registerPlugin(new SeoEnginePlugin());
discoveryAuditEngine.registerPlugin(new PerformanceEnginePlugin());
discoveryAuditEngine.registerPlugin(new AccessibilityEnginePlugin());
discoveryAuditEngine.registerPlugin(new StructuredDataValidatorPlugin());
discoveryAuditEngine.registerPlugin(new InternalLinkAuditPlugin());
discoveryAuditEngine.registerPlugin(new AiReadinessPlugin());
discoveryAuditEngine.registerPlugin(new CrawlabilityEnginePlugin());

export { discoveryAuditEngine };
export type { DiscoveryAuditReport, AuditResult, AuditIssue } from './types';
