import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Image as ImageIcon, 
  Layers, 
  FileText, 
  Search, 
  BarChart, 
  Settings,
  HelpCircle,
  Bell,
  Sparkles,
  LogOut,
  Menu,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Artists", href: "/admin/artists", icon: Users },
  { name: "Artworks", href: "/admin/artworks", icon: ImageIcon },
  { name: "Verification", href: "/admin/verification", icon: ShieldCheck },
  { name: "Collections", href: "/admin/collections", icon: Layers },
  { name: "Insights", href: "/admin/insights", icon: FileText },
  { name: "SEO", href: "/admin/seo", icon: Search },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart },
];

const COMING_SOON_ITEMS = [
  { name: "Support", icon: HelpCircle },
  { name: "Notifications", icon: Bell },
  { name: "AI Features", icon: Sparkles },
];

export function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 w-64 p-4">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
          Fameuxarte <span className="text-primary text-lg">Admin</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/admin'}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-slate-200 text-slate-900"
                  : "text-slate-900 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
          </NavLink>
        ))}

        <div className="pt-6 pb-2">
          <p className="px-3 text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Coming Soon
          </p>
        </div>
        
        {COMING_SOON_ITEMS.map((item) => (
          <div
            key={item.name}
            className="flex items-center px-3 py-2 text-sm font-medium text-slate-900 cursor-not-allowed opacity-60"
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
            <span className="ml-auto text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-900 font-bold">SOON</span>
          </div>
        ))}
      </nav>

      <div className="pt-4 border-t border-slate-200 space-y-1">
        <NavLink
          to="/admin/settings"
          onClick={() => setIsMobileMenuOpen(false)}
          className={({ isActive }) =>
            `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? "bg-slate-200 text-slate-900"
                : "text-slate-900 hover:bg-slate-100 hover:text-slate-900"
            }`
          }
        >
          <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
          Settings
        </NavLink>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <SidebarContent />
      </div>

      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between bg-slate-50 border-b border-slate-200 px-4 py-2">
          <h1 className="text-xl font-bold font-serif text-slate-900">
            Fameuxarte <span className="text-primary text-sm">Admin</span>
          </h1>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-slate-900" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-slate-50">
          <div className="py-6 px-4 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
