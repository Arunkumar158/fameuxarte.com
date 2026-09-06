import React from "react";
import Navbar from "@/components/navigation/Navbar";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface LegalLayoutProps {
  children: React.ReactNode;
}

export function LegalLayout({ children }: LegalLayoutProps) {
  const location = useLocation();

  const legalLinks = [
    { name: "Trust Center", path: "/trust" },
    { name: "Privacy Policy", path: "/legal/privacy" },
    { name: "Terms & Conditions", path: "/legal/terms" },
    { name: "Artist Agreement", path: "/legal/artist-terms" },
    { name: "Buyer Terms", path: "/legal/buyer-terms" },
    { name: "Refund & Cancellation", path: "/legal/refunds" },
    { name: "Shipping & Delivery", path: "/legal/shipping" },
    { name: "Cookie Policy", path: "/legal/cookies" },
  ];

  return (
    <div className="min-h-screen bg-obsidian text-linen flex flex-col">
      <Navbar />
      
      <div className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-[#888] mb-8" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to="/trust" className="hover:text-gold transition-colors">Legal & Trust</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-linen">
            {legalLinks.find(link => link.path === location.pathname)?.name || "Document"}
          </span>
        </nav>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h2 className="text-sm font-semibold tracking-widest text-[#888] uppercase mb-4">
                Policies & Trust
              </h2>
              <ul className="space-y-1">
                {legalLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`block px-3 py-2 -mx-3 rounded-md text-sm transition-colors ${
                        location.pathname === link.path
                          ? "bg-surface-1 text-gold font-medium"
                          : "text-[#bbb] hover:text-linen hover:bg-surface-0"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <div className="bg-surface-0 rounded-2xl border border-border-subtle p-6 md:p-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
