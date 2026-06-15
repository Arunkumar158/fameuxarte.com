import React from "react";
import { Link } from "react-router-dom";
import HomeNav from "@/components/home/HomeNav";
import { SEO } from "@/components/SEO";

const ForArtists = () => {
  return (
    <div className="min-h-screen bg-obsidian flex flex-col">
      <SEO title="For Artists | Fameuxarte" description="Build a sustainable art career with Fameuxarte's AI-powered tools." />
      <HomeNav />
      
      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="bg-obsidian px-4 sm:px-6 pb-10 sm:pb-12 pt-10 sm:pt-14 text-center">
          <div className="mx-auto max-w-[680px]">
            <div className="mb-5 flex items-center justify-center gap-2">
              <span className="h-[6px] w-[6px] rounded-full bg-gold" />
              <span className="text-[11px] uppercase tracking-[0.1em] text-[#555]">
                For Artists Ecosystem
              </span>
            </div>
            
            <h1 className="mb-[18px] text-[32px] font-medium leading-[1.08] tracking-[-0.025em] text-linen sm:text-[44px]">
              Build a Sustainable
              <br />
              Art Career.
            </h1>
            
            <p className="mx-auto mb-7 max-w-[480px] text-[14px] leading-[1.75] text-[#666]">
              AI-powered tools for pricing, authenticity verification, career growth, and collector discovery. Join the future of art.
            </p>
            
            <div className="mb-10 flex flex-col justify-center gap-[10px] sm:flex-row">
              <button className="rounded-[6px] bg-linen px-5 py-[11px] text-center text-[13px] font-medium text-obsidian transition-opacity hover:opacity-90">
                Get Priority Access
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 1: ArtGuard */}
        <section className="border-t border-[#1a1a1a] px-4 sm:px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-[960px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 rounded-[8px] border border-[#1a1a1a] bg-[#0d0d0d] p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-[#1a1a1a] pb-4">
                 <div>
                   <h4 className="text-[14px] font-medium text-linen">Authenticity Scan</h4>
                   <p className="text-[12px] text-[#666]">Processing complete</p>
                 </div>
                 <span className="text-[24px] font-medium text-gold">96%</span>
              </div>
              <div className="space-y-4">
                 {[ 
                   { label: "Handmade Probability", value: "94%" }, 
                   { label: "AI Generated Risk", value: "3%" }, 
                   { label: "Digital Reproduction", value: "3%" } 
                 ].map((item, i) => (
                   <div key={i} className="flex justify-between text-[13px]">
                     <span className="text-[#888]">{item.label}</span>
                     <span className="font-medium text-linen">{item.value}</span>
                   </div>
                 ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="mb-4 inline-flex items-center gap-2 rounded-[4px] border border-[#2a2a2a] bg-transparent px-2 py-1 text-[10px] uppercase tracking-wider text-[#888]">
                Coming Soon
              </div>
              <h2 className="mb-4 text-[24px] sm:text-[32px] font-medium tracking-[-0.02em] text-linen">ArtGuard™ Authentication</h2>
              <p className="mb-6 text-[14px] leading-[1.75] text-[#666]">
                Protect your legacy. Verify whether artwork is handmade, AI-generated, or digitally reproduced with our proprietary image analysis model. Build instant trust with collectors.
              </p>
              <button className="rounded-[6px] border border-[#2a2a2a] bg-transparent px-5 py-[11px] text-[13px] text-[#888] transition-colors hover:text-linen">
                Join Early Access
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: Artist Verification */}
        <section className="border-t border-[#1a1a1a] px-4 sm:px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-[960px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-[4px] border border-[#2a2a2a] bg-transparent px-2 py-1 text-[10px] uppercase tracking-wider text-[#888]">
                Coming Soon
              </div>
              <h2 className="mb-4 text-[24px] sm:text-[32px] font-medium tracking-[-0.02em] text-linen">Build Collector Trust</h2>
              <p className="mb-6 text-[14px] leading-[1.75] text-[#666]">
                Stand out in the marketplace with our premium Artist Verification program. Get recognized, unlock exclusive features, and signal absolute authenticity to top buyers.
              </p>
              <ul className="mb-8 space-y-3">
                {[
                  "Higher buyer trust & conversion rates",
                  "Better discoverability in algorithms",
                  "Featured placement opportunities"
                ].map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[13px] text-[#888]">
                    <span className="h-[4px] w-[4px] rounded-full bg-gold" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <button className="rounded-[6px] border border-[#2a2a2a] bg-transparent px-5 py-[11px] text-[13px] text-[#888] transition-colors hover:text-linen">
                Get Priority Access
              </button>
            </div>
            
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-sm rounded-[8px] border border-[#1a1a1a] bg-[#0d0d0d] p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/20 bg-gold/5">
                  <span className="text-gold">✓</span>
                </div>
                <h3 className="mb-1 text-[20px] font-medium text-linen">Verified Artist</h3>
                <p className="mb-6 text-[11px] uppercase tracking-wider text-[#666]">Fameuxarte Exclusive</p>
                <div className="space-y-3 border-t border-[#1a1a1a] pt-6 text-left text-[13px]">
                  {[
                    "Identity Confirmed",
                    "Portfolio Reviewed",
                    "Studio Verified"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3 text-[#888]">
                      <span className="text-verified">✓</span> {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: AI Pricing Engine (FLAGSHIP) */}
        <section className="border-t border-[#1a1a1a] bg-[#080808] px-4 sm:px-6 py-20 sm:py-32 text-center">
          <div className="mx-auto max-w-[960px]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-[4px] border border-gold/30 bg-gold/5 px-2 py-1 text-[10px] uppercase tracking-wider text-gold">
              Flagship Feature • Coming Soon
            </div>
            <h2 className="mb-4 text-[32px] sm:text-[44px] font-medium tracking-[-0.02em] text-linen">AI Pricing Engine</h2>
            <p className="mx-auto mb-12 max-w-[600px] text-[14px] leading-[1.75] text-[#666]">
              Leverage billions of data points to find the perfect price for your art. Our AI analyzes market trends, artist history, and collector demand to suggest optimal pricing strategies.
            </p>

            <div className="mx-auto max-w-[800px] rounded-[8px] border border-[#1a1a1a] bg-[#0d0d0d] p-6 sm:p-10 text-left">
              <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#1a1a1a] pb-6">
                <div>
                  <h3 className="text-[18px] font-medium text-linen">Pricing Intelligence</h3>
                  <p className="text-[12px] text-[#666]">Oil on Canvas, 24x36" • Global Market Data</p>
                </div>
                <div className="mt-4 sm:mt-0 text-right">
                  <span className="block text-[10px] uppercase tracking-wider text-[#888] mb-1">Confidence Score</span>
                  <span className="text-[24px] font-medium text-linen">92.4%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-[#888] mb-2">Optimal Market Price</span>
                  <span className="text-[40px] sm:text-[56px] font-medium tracking-[-0.02em] text-linen">₹18,500</span>
                  <div className="mt-2 text-[12px] text-verified">↑ +15% vs Last Year</div>
                </div>
                
                <div className="space-y-4 border-t sm:border-t-0 sm:border-l border-[#1a1a1a] pt-6 sm:pt-0 sm:pl-8">
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-[#888] mb-1">Suggested Range</span>
                    <span className="text-[16px] font-medium text-linen">₹16,000 – ₹21,000</span>
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-[#888] mb-1">Demand Trend</span>
                    <span className="text-[16px] font-medium text-linen">High Demand</span>
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-[#888] mb-1">Similar Works Sold</span>
                    <span className="text-[16px] font-medium text-linen">142 <span className="text-[12px] text-[#666] font-normal">in last 30 days</span></span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#1a1a1a] pt-6 text-center">
                <button className="rounded-[6px] bg-linen px-6 py-[11px] text-[13px] font-medium text-obsidian transition-opacity hover:opacity-90">
                  Join Early Access
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: AI Career Manager & Product Roadmap */}
        <section className="border-t border-[#1a1a1a] px-4 sm:px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-[960px]">
            {/* AI Career Manager */}
            <div className="mb-24 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-[4px] border border-[#2a2a2a] bg-transparent px-2 py-1 text-[10px] uppercase tracking-wider text-[#888]">
                Coming Soon
              </div>
              <h2 className="mb-4 text-[24px] sm:text-[32px] font-medium tracking-[-0.02em] text-linen">AI Career Manager</h2>
              <p className="mx-auto mb-12 max-w-[600px] text-[14px] leading-[1.75] text-[#666]">
                Your personal guide within the Fameuxarte Ecosystem. Make data-driven decisions with intelligent insights and personalized growth recommendations.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                  { label: "Career Score", value: "87/100", sub: "Top 10% of artists" },
                  { label: "Monthly Views", value: "4.5K", sub: "+1.2K this month" },
                  { label: "Profile Growth", value: "+12%", sub: "Trending upward" },
                  { label: "Revenue Growth", value: "+18%", sub: "Past 90 days" }
                ].map((stat, idx) => (
                  <div key={idx} className="rounded-[8px] border border-[#1a1a1a] bg-[#0d0d0d] p-6 text-left">
                    <span className="block text-[11px] uppercase tracking-wider text-[#888] mb-3">{stat.label}</span>
                    <span className="block text-[24px] font-medium text-linen mb-1">{stat.value}</span>
                    <span className="text-[12px] text-gold">{stat.sub}</span>
                  </div>
                ))}
              </div>
              <button className="rounded-[6px] border border-[#2a2a2a] bg-transparent px-5 py-[11px] text-[13px] text-[#888] transition-colors hover:text-linen">
                Get Priority Access
              </button>
            </div>

            {/* Product Roadmap */}
            <div className="rounded-[8px] border border-[#1a1a1a] bg-[#0d0d0d] p-8 sm:p-12">
              <div className="mb-10 text-center">
                <h2 className="mb-3 text-[24px] font-medium tracking-[-0.02em] text-linen">Platform Evolution</h2>
                <p className="text-[14px] text-[#666]">The roadmap for the ultimate artist success ecosystem.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-[#1a1a1a] pt-10">
                <div>
                  <h3 className="mb-6 flex items-center gap-2 text-[14px] font-medium text-linen">
                    <span className="h-[6px] w-[6px] rounded-full bg-verified" />
                    Available Today
                  </h3>
                  <ul className="space-y-4">
                    {[
                      "Art Marketplace",
                      "Artist Profiles",
                      "Collections",
                      "Collector Discovery"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-[13px] text-[#888]">
                        <span className="text-verified">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-6 flex items-center gap-2 text-[14px] font-medium text-linen">
                    <span className="h-[6px] w-[6px] rounded-full bg-gold" />
                    Coming Soon
                  </h3>
                  <ul className="space-y-4">
                    {[
                      "ArtGuard™ Authentication",
                      "AI Pricing Engine",
                      "Artist Verification",
                      "AI Career Manager"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-[13px] text-[#888]">
                        <span className="text-gold">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
        
      </main>
    </div>
  );
};

export default ForArtists;
