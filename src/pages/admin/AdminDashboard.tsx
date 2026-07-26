import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  DollarSign, 
  ShoppingCart, 
  Clock, 
  AlertTriangle,
  Image as ImageIcon,
  CheckCircle2,
  Users,
  BadgeCheck,
  FileText,
  FileEdit,
  UserPlus,
  Search
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    todaysRevenue: 0,
    todaysOrders: 0,
    pendingOrders: 0,
    failedPayments: 0, // Mocked for now since not tracked in orders usually unless status='failed'
    totalArtworks: 0,
    collectedArtworks: 0,
    availableArtworks: 0,
    totalArtists: 0,
    verifiedArtists: 0, // Assuming all artists in table are verified or we count them
    publishedArticles: 0,
    draftArticles: 0,
    pendingArtistVerification: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();

      try {
        // Today's orders & revenue
        const { data: todayOrders } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', todayIso);
          
        const todaysRevenue = todayOrders?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0;
        const todaysOrdersCount = todayOrders?.length || 0;

        // Pending orders
        const { count: pendingOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Artworks
        const { count: totalArtworks } = await supabase
          .from('artworks')
          .select('*', { count: 'exact', head: true });
          
        const { count: availableArtworks } = await supabase
          .from('artworks')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'available');
          
        const { count: collectedArtworks } = await supabase
          .from('artworks')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'sold');

        // Artists
        const { count: totalArtists } = await supabase
          .from('artists')
          .select('*', { count: 'exact', head: true });

        // Insights
        const { count: publishedArticles } = await supabase
          .from('insights')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published');
          
        const { count: draftArticles } = await supabase
          .from('insights')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'draft');

        setStats({
          todaysRevenue,
          todaysOrders: todaysOrdersCount,
          pendingOrders: pendingOrders || 0,
          failedPayments: 0, // Placeholder
          totalArtworks: totalArtworks || 0,
          collectedArtworks: collectedArtworks || 0,
          availableArtworks: availableArtworks || 0,
          totalArtists: totalArtists || 0,
          verifiedArtists: totalArtists || 0, // Mock for now
          publishedArticles: publishedArticles || 0,
          draftArticles: draftArticles || 0,
          pendingArtistVerification: 0,
        });

      } catch (error) {
        console.error("Error fetching admin stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-serif tracking-tight text-slate-900">Dashboard Overview</h2>
        <p className="text-slate-900 mt-1">Welcome to the Fameuxarte Business Command Center.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white text-slate-900 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">${stats.todaysRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white text-slate-900 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900">Today's Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.todaysOrders}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white text-slate-900 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white text-slate-900 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900">Failed Payments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.failedPayments}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white text-slate-900 bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900">Total Artworks</CardTitle>
            <ImageIcon className="h-4 w-4 text-slate-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalArtworks}</div>
            <div className="text-xs text-slate-900 mt-1">
              <span className="text-emerald-500 font-medium">{stats.availableArtworks}</span> available • <span className="text-blue-500 font-medium">{stats.collectedArtworks}</span> collected
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white text-slate-900 bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900">Total Artists</CardTitle>
            <Users className="h-4 w-4 text-slate-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalArtists}</div>
            <div className="text-xs text-slate-900 mt-1">
              <span className="text-emerald-500 font-medium">{stats.verifiedArtists}</span> verified
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white text-slate-900 bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900">Insights Articles</CardTitle>
            <FileText className="h-4 w-4 text-slate-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.publishedArticles + stats.draftArticles}</div>
            <div className="text-xs text-slate-900 mt-1">
              <span className="text-emerald-500 font-medium">{stats.publishedArticles}</span> published • <span className="text-amber-500 font-medium">{stats.draftArticles}</span> drafts
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white text-slate-900 bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900">Pending Actions</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.pendingArtistVerification}</div>
            <p className="text-xs text-slate-900 mt-1">Artist verifications pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Widgets Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="bg-white text-slate-900 lg:col-span-1 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/admin/insights/new" className="flex items-center p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-medium text-slate-700">
              <FileEdit className="mr-3 h-4 w-4 text-primary" /> Publish Article
            </Link>
            <Link to="/admin/artworks" className="flex items-center p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-medium text-slate-700">
              <ImageIcon className="mr-3 h-4 w-4 text-primary" /> Add Artwork
            </Link>
            <Link to="/admin/artists" className="flex items-center p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-medium text-slate-700">
              <UserPlus className="mr-3 h-4 w-4 text-primary" /> Verify Artist
            </Link>
            <Link to="/admin/orders" className="flex items-center p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-medium text-slate-700">
              <ShoppingCart className="mr-3 h-4 w-4 text-primary" /> View Orders
            </Link>
          </CardContent>
        </Card>
        
        {/* SEO Health */}
        <Card className="bg-white text-slate-900 lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-slate-900">
              <Search className="w-5 h-5 mr-2 text-primary" /> SEO Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                 <div className="text-sm font-medium text-slate-900 mb-1">Missing Meta Titles</div>
                 <div className="text-2xl font-bold text-slate-800">0</div>
               </div>
               <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                 <div className="text-sm font-medium text-slate-900 mb-1">Missing Descriptions</div>
                 <div className="text-2xl font-bold text-slate-800">0</div>
               </div>
               <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                 <div className="text-sm font-medium text-slate-900 mb-1">Duplicate Slugs</div>
                 <div className="text-2xl font-bold text-slate-800">0</div>
               </div>
               <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                 <div className="text-sm font-medium text-slate-900 mb-1">Missing ALT Text</div>
                 <div className="text-2xl font-bold text-slate-800">0</div>
               </div>
               <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                 <div className="text-sm font-medium text-slate-900 mb-1">Broken Images</div>
                 <div className="text-2xl font-bold text-slate-800">0</div>
               </div>
               <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                 <div className="text-sm font-medium text-slate-900 mb-1">Draft Articles</div>
                 <div className="text-2xl font-bold text-slate-800">{stats.draftArticles}</div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity Sections (Placeholders) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white text-slate-900 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm text-slate-900 uppercase tracking-wider font-semibold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-900">
            Fetching recent orders...
          </CardContent>
        </Card>
        
        <Card className="bg-white text-slate-900 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm text-slate-900 uppercase tracking-wider font-semibold">Artist Activity</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-900">
            No recent artist registrations.
          </CardContent>
        </Card>

        <Card className="bg-white text-slate-900 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm text-slate-900 uppercase tracking-wider font-semibold">Recent Articles</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-900">
            {stats.publishedArticles > 0 ? "Articles are published." : "No recent articles."}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
