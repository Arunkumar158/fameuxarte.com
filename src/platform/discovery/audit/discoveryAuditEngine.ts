import { DiscoveryAuditPlugin, DiscoveryAuditReport, AuditResult } from './types';
import { trackDiscoveryAuditCompleted } from '@/lib/analytics';

export class DiscoveryAuditEngine {
  private plugins: Map<string, DiscoveryAuditPlugin> = new Map();

  registerPlugin(plugin: DiscoveryAuditPlugin) {
    this.plugins.set(plugin.name, plugin);
  }

  async runAudit(url: string, documentContext?: Document): Promise<DiscoveryAuditReport> {
    const results: Record<string, AuditResult> = {};
    let totalScore = 0;
    let totalWeight = 0;

    for (const [name, plugin] of Array.from(this.plugins.entries())) {
      try {
        const result = await plugin.run(url, documentContext);
        results[name] = result;
        totalScore += result.score * plugin.weight;
        totalWeight += plugin.weight;
      } catch (error) {
        console.error(`Audit plugin ${name} failed:`, error);
        results[name] = {
          score: 0,
          passed: false,
          issues: [{ type: 'critical', message: `Plugin execution failed: ${error}` }]
        };
        // Still add weight so failures impact the overall score
        totalWeight += plugin.weight;
      }
    }

    const overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

    const report: DiscoveryAuditReport = {
      url,
      timestamp: new Date().toISOString(),
      overallScore,
      seo: results['seo'] || this.emptyResult(),
      performance: results['performance'] || this.emptyResult(),
      accessibility: results['accessibility'] || this.emptyResult(),
      structuredData: results['structuredData'] || this.emptyResult(),
      internalLinking: results['internalLinking'] || this.emptyResult(),
      aiReadiness: results['aiReadiness'] || this.emptyResult(),
      crawlability: results['crawlability'] || this.emptyResult(),
    };

    // Track analytics
    trackDiscoveryAuditCompleted({
      url,
      score: overallScore,
      passed: overallScore >= 80,
    });

    return report;
  }

  private emptyResult(): AuditResult {
    return {
      score: 0,
      passed: false,
      issues: [{ type: 'warning', message: 'Plugin not registered or did not execute' }]
    };
  }
}

// Export a singleton instance
export const discoveryAuditEngine = new DiscoveryAuditEngine();
