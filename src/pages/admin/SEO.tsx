import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';
import { discoveryAuditEngine, DiscoveryAuditReport, AuditResult, AuditIssue } from '@/platform/discovery/audit';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function SEO() {
  const [urlToAudit, setUrlToAudit] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [report, setReport] = useState<DiscoveryAuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async () => {
    if (!urlToAudit) return;
    setIsAuditing(true);
    setError(null);
    try {
      // Handle relative paths for internal testing
      const targetUrl = urlToAudit.startsWith('http') ? urlToAudit : `${window.location.origin}${urlToAudit.startsWith('/') ? '' : '/'}${urlToAudit}`;
      
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
      }
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const result = await discoveryAuditEngine.runAudit(targetUrl, doc);
      setReport(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred during the audit.');
    } finally {
      setIsAuditing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  const renderIssueBadge = (type: string) => {
    switch (type) {
      case 'critical': return <Badge variant="destructive" className="capitalize">{type}</Badge>;
      case 'warning': return <Badge variant="outline" className="text-amber-600 border-amber-600 capitalize">{type}</Badge>;
      default: return <Badge variant="secondary" className="capitalize">{type}</Badge>;
    }
  };

  const IssueList = ({ issues }: { issues: AuditIssue[] }) => {
    if (issues.length === 0) return <div className="p-4 text-green-600 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> No issues found!</div>;
    return (
      <div className="space-y-4 mt-4">
        {issues.map((issue, idx) => (
          <div key={idx} className="flex gap-4 p-4 border rounded-md bg-slate-50">
            <div className="mt-1">
              {issue.type === 'critical' ? <XCircle className="w-5 h-5 text-red-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {renderIssueBadge(issue.type)}
                <span className="font-medium text-sm text-slate-700 font-mono">{issue.element || 'General'}</span>
              </div>
              <p className="text-sm text-slate-600">{issue.message}</p>
              {issue.suggestion && <p className="text-sm text-muted-foreground mt-1">💡 {issue.suggestion}</p>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ScoreCard = ({ title, result }: { title: string, result: AuditResult }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>{result.score}/100</div>
          {result.passed ? <CheckCircle className="w-8 h-8 text-green-500 opacity-20" /> : <XCircle className="w-8 h-8 text-red-500 opacity-20" />}
        </div>
        <Progress value={result.score} className="mt-4" />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Discovery Quality Dashboard</h2>
        <p className="text-muted-foreground">Validate SEO, AI discoverability, accessibility, performance, structured data, and crawlability.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Enter relative path (e.g. /artworks/beautiful-sunset) or absolute URL to audit..." 
                className="pl-9"
                value={urlToAudit}
                onChange={(e) => setUrlToAudit(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runAudit()}
              />
            </div>
            <Button onClick={runAudit} disabled={isAuditing || !urlToAudit}>
              {isAuditing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Auditing...</> : 'Run Audit'}
            </Button>
          </div>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </CardContent>
      </Card>

      {report && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-2 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="technical-seo">Technical SEO</TabsTrigger>
            <TabsTrigger value="ai-readiness">AI Readiness</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            <TabsTrigger value="structured-data">Structured Data</TabsTrigger>
            <TabsTrigger value="internal-linking">Internal Linking</TabsTrigger>
            <TabsTrigger value="crawlability">Crawlability</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card className="bg-slate-900 text-white">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Overall Discovery Score</div>
                  <div className={`text-6xl font-bold ${report.overallScore >= 90 ? 'text-green-400' : report.overallScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                    {report.overallScore}
                  </div>
                  <p className="text-slate-400 mt-2">Audit Timestamp: {new Date(report.timestamp).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <ScoreCard title="Technical SEO" result={report.seo} />
              <ScoreCard title="AI Readiness" result={report.aiReadiness} />
              <ScoreCard title="Performance" result={report.performance} />
              <ScoreCard title="Accessibility" result={report.accessibility} />
              <ScoreCard title="Structured Data" result={report.structuredData} />
              <ScoreCard title="Internal Linking" result={report.internalLinking} />
              <ScoreCard title="Crawlability" result={report.crawlability} />
            </div>
          </TabsContent>

          {/* Technical SEO Tab */}
          <TabsContent value="technical-seo" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Technical SEO Details</CardTitle>
                <CardDescription>Validates titles, meta descriptions, canonicals, and OpenGraph tags.</CardDescription>
              </CardHeader>
              <CardContent>
                <IssueList issues={report.seo.issues} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Readiness Tab */}
          <TabsContent value="ai-readiness" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Readiness Details</CardTitle>
                <CardDescription>Evaluates entity richness, semantic tags, and context depth for LLMs.</CardDescription>
              </CardHeader>
              <CardContent>
                <IssueList issues={report.aiReadiness.issues} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Diagnostics</CardTitle>
                <CardDescription>Checks for lazy loading, duplicate scripts, and asset preloading opportunities.</CardDescription>
              </CardHeader>
              <CardContent>
                <IssueList issues={report.performance.issues} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accessibility Tab */}
          <TabsContent value="accessibility" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Audit</CardTitle>
                <CardDescription>Verifies heading hierarchy, image alt texts, and ARIA labels.</CardDescription>
              </CardHeader>
              <CardContent>
                <IssueList issues={report.accessibility.issues} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Structured Data Tab */}
          <TabsContent value="structured-data" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Structured Data Validator</CardTitle>
                <CardDescription>Validates JSON-LD schema objects and entities.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-4">
                  <div className="bg-slate-100 px-4 py-2 rounded-md"><span className="text-sm text-slate-500">Total Schemas:</span> <span className="font-semibold">{report.structuredData.metrics?.totalSchemas || 0}</span></div>
                  <div className="bg-slate-100 px-4 py-2 rounded-md"><span className="text-sm text-slate-500">Types Detected:</span> <span className="font-semibold">{(report.structuredData.metrics?.schemaTypes || []).join(', ') || 'None'}</span></div>
                </div>
                <IssueList issues={report.structuredData.issues} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Internal Linking Tab */}
          <TabsContent value="internal-linking" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Internal Link Health</CardTitle>
                <CardDescription>Detects missing hrefs and evaluates discovery graph connectivity.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid grid-cols-4 gap-4">
                  <div className="bg-slate-100 px-4 py-2 rounded-md text-center">
                    <div className="text-sm text-slate-500">Total Links</div>
                    <div className="font-semibold text-lg">{report.internalLinking.metrics?.totalLinks || 0}</div>
                  </div>
                  <div className="bg-slate-100 px-4 py-2 rounded-md text-center">
                    <div className="text-sm text-slate-500">Internal</div>
                    <div className="font-semibold text-lg">{report.internalLinking.metrics?.internalLinks || 0}</div>
                  </div>
                  <div className="bg-slate-100 px-4 py-2 rounded-md text-center">
                    <div className="text-sm text-slate-500">External</div>
                    <div className="font-semibold text-lg">{report.internalLinking.metrics?.externalLinks || 0}</div>
                  </div>
                  <div className="bg-slate-100 px-4 py-2 rounded-md text-center">
                    <div className="text-sm text-slate-500">Hash (#)</div>
                    <div className="font-semibold text-lg">{report.internalLinking.metrics?.hashLinks || 0}</div>
                  </div>
                </div>
                <IssueList issues={report.internalLinking.issues} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crawlability Tab */}
          <TabsContent value="crawlability" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Crawlability Engine</CardTitle>
                <CardDescription>Validates meta robots and redirect setups.</CardDescription>
              </CardHeader>
              <CardContent>
                <IssueList issues={report.crawlability.issues} />
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      )}
    </div>
  );
}
