import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  FolderHeart,
  Heart,
  FolderOpen,
  ShoppingBag,
  ShieldCheck,
  UserPlus,
  Bell,
  MapPin,
  Settings,
  Menu,
  X,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SEO } from "@/components/SEO";

const NAV_GROUPS = [
  {
    name: "Platform",
    items: [
      { name: "Overview", href: "/collector", icon: LayoutDashboard },
    ]
  },
  {
    name: "Collection",
    items: [
      { name: "My Collection", href: "/collector/collection", icon: FolderHeart },
      { name: "Wishlist", href: "/collector/wishlist", icon: Heart },
      { name: "Saved Collections", href: "/collector/saved-collections", icon: FolderOpen },
    ]
  },
  {
    name: "Purchases",
    items: [
      { name: "Orders", href: "/collector/orders", icon: ShoppingBag },
      { name: "Certificates", href: "/collector/certificates", icon: ShieldCheck },
    ]
  },
  {
    name: "Discover",
    items: [
      { name: "Following Artists", href: "/collector/following", icon: UserPlus },
    ]
  },
  {
    name: "Account",
    items: [
      { name: "Notifications", href: "/collector/notifications", icon: Bell },
      { name: "Addresses", href: "/collector/addresses", icon: MapPin },
      { name: "Settings", href: "/collector/settings", icon: Settings },
    ]
  }
];

export const CollectorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  const initials = user?.user_metadata?.full_name
    ?.split(" ")
    ?.map((n: string) => n[0])
    ?.join("")
    ?.slice(0, 2)
    ?.toUpperCase() || "C";

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-obsidian text-linen">
      <SEO title="Collector Dashboard | Fameuxarte" description="Manage your art collection." />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform flex-col border-r border-border-faint bg-surface-1 transition-transform duration-300 ease-in-out lg:static lg:flex lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-border-faint bg-obsidian">
          <Link to="/" className="text-[18px] font-medium tracking-[-0.04em] text-linen">
            FAMEUXARTE
          </Link>
          <button onClick={closeSidebar} className="lg:hidden text-stone hover:text-linen">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
          <div className="mb-8 flex items-center gap-3 rounded-[8px] border border-border-subtle bg-surface-2 p-3">
            <Avatar className="h-10 w-10 border border-gold/20">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gold/10 text-gold text-[12px]">{initials}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="truncate text-[13px] font-medium text-linen">{user?.user_metadata?.full_name || "Collector"}</p>
              <p className="truncate text-[11px] text-[#666]">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-8">
            {NAV_GROUPS.map((group) => (
              <nav key={group.name} className="space-y-1">
                <h3 className="mb-3 px-3 text-[10px] font-medium uppercase tracking-wider text-[#666]">
                  {group.name}
                </h3>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href || (item.href !== "/collector" && location.pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={closeSidebar}
                      className={`flex items-center gap-3 rounded-[6px] px-3 py-2 text-[13px] font-medium transition-colors ${
                        isActive
                          ? "bg-gold/10 text-gold"
                          : "text-stone hover:bg-surface-3 hover:text-linen"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            ))}
          </div>
        </div>

        <div className="border-t border-border-faint p-4">
          <Link
            to="/artist"
            className="flex w-full items-center justify-center gap-2 rounded-[6px] border border-border-subtle bg-transparent px-4 py-2 text-[12px] font-medium text-stone transition-colors hover:bg-surface-3 hover:text-linen"
          >
            <User className="h-4 w-4" />
            Switch to Artist
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-faint bg-obsidian px-6 lg:justify-end">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-stone hover:text-linen lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4">
            <Link to="/collector/notifications" className="relative text-stone hover:text-linen">
              <Bell className="h-5 w-5" />
            </Link>
            <Link to="/" className="text-[12px] font-medium text-stone hover:text-linen hidden sm:block">
              FA Marketplace
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-obsidian">
          <div className="mx-auto max-w-7xl p-6 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
