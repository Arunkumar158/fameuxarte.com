export interface AuditIssue {
  type: 'critical' | 'warning' | 'info';
  message: string;
  element?: string; // CSS selector or path
  suggestion?: string;
}

export interface AuditResult {
  score: number; // 0-100
  passed: boolean;
  issues: AuditIssue[];
  metrics?: Record<string, any>;
}

export interface DiscoveryAuditReport {
  url: string;
  timestamp: string;
  overallScore: number;
  seo: AuditResult;
  performance: AuditResult;
  accessibility: AuditResult;
  structuredData: AuditResult;
  internalLinking: AuditResult;
  aiReadiness: AuditResult;
  crawlability: AuditResult;
}

export interface DiscoveryAuditPlugin {
  name: string;
  weight: number; // relative weight for overall score calculation
  run(url: string, documentContext?: Document): Promise<AuditResult> | AuditResult;
}
