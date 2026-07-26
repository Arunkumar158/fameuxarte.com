import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";

type InsightSummary = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  author_id: string;
};

export default function InsightsList() {
  const [insights, setInsights] = useState<InsightSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('insights')
      .select('id, title, status, created_at, author_id')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching insights:", error);
    } else {
      setInsights(data || []);
    }
    setIsLoading(false);
  };

  const deleteInsight = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    
    const { error } = await supabase.from('insights').delete().eq('id', id);
    if (!error) {
      setInsights(insights.filter(i => i.id !== id));
    } else {
      console.error("Error deleting insight:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Insights</h2>
          <p className="text-muted-foreground">Manage your articles, guides, and art market research.</p>
        </div>
        <Link to="/admin/insights/new">
          <Button><Plus className="w-4 h-4 mr-2" /> Create Article</Button>
        </Link>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-900 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-900">Loading articles...</td>
              </tr>
            ) : insights.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-900">No articles found. Create your first insight!</td>
              </tr>
            ) : (
              insights.map((insight) => (
                <tr key={insight.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{insight.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      insight.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {insight.status || 'draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-900">
                    {insight.created_at ? format(new Date(insight.created_at), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/insights/${insight.id}`}>
                        <Button variant="outline" size="sm"><Edit2 className="w-4 h-4" /></Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => deleteInsight(insight.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
