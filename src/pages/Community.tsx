import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, BookOpen, TrendingUp, Users, Check, X } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import HomeNav from "@/components/home/HomeNav";
import { FAMEUXARTE_DISCORD_URL, FAMEUXARTE_INNER_CIRCLE_URL } from "@/config/constants";

const Community = () => {
  const posthog = usePostHog();

  useEffect(() => {
    // Fire page view event on mount
    posthog?.capture("community_page_view");
  }, [posthog]);

  const handleFreeJoinClick = (placement: string) => {
    posthog?.capture("community_free_join_click", {
      tier: "free",
      placement,
    });
  };

  const handleInnerCircleClick = (placement: string) => {
    posthog?.capture("community_inner_circle_click", {
      tier: "inner_circle",
      placement,
    });
  };

  const hasInnerCircleUrl = Boolean(FAMEUXARTE_INNER_CIRCLE_URL);

  return (
    <div className="relative min-h-screen bg-[#faf8f5] text-[#111111]">
      <SEO
        title="Fameuxarte Community — Connect, Learn & Grow"
        description="Join the Fameuxarte community for artists, creators, collectors, and art lovers. Connect with the community for art, creativity, learning, networking, and growth."
        canonicalUrl="/community"
      />
      <HomeNav />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-6 mx-auto max-w-7xl">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[11px] sm:text-[12px] font-semibold tracking-[0.2em] text-[#b28247] uppercase mb-4 block">
            THE FAMEUXARTE COMMUNITY
          </span>
          <h1 className="font-serif text-[40px] sm:text-[54px] md:text-[64px] font-medium leading-[1.08] tracking-[-0.02em] mb-6">
            Where Artists, Creators & Art Lovers Connect.
          </h1>
          <p className="text-[16px] sm:text-[18px] text-[#4a4a4a] leading-relaxed mb-10 max-w-2xl mx-auto">
            Join a growing community built for artists, collectors, creators, and people who believe great art deserves to be discovered.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              className="w-full sm:w-auto h-12 px-8 rounded-full bg-[#111111] text-white hover:bg-black transition-all text-sm font-medium"
              onClick={() => handleFreeJoinClick("hero")}
            >
              <a href={FAMEUXARTE_DISCORD_URL} target="_blank" rel="noopener noreferrer">
                Join Free Community
              </a>
            </Button>
            {hasInnerCircleUrl ? (
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto h-12 px-8 rounded-full border-[#222222] text-[#111111] hover:bg-[#f0ece6] transition-all text-sm font-medium"
                onClick={() => handleInnerCircleClick("hero")}
              >
                <a href={FAMEUXARTE_INNER_CIRCLE_URL} target="_blank" rel="noopener noreferrer">
                  Explore Inner Circle
                </a>
              </Button>
            ) : (
              <Button
                disabled
                variant="outline"
                className="w-full sm:w-auto h-12 px-8 rounded-full border-[#222222] text-[#888888] bg-transparent text-sm font-medium cursor-not-allowed opacity-60"
              >
                Inner Circle (Coming Soon)
              </Button>
            )}
          </div>
        </motion.div>
      </section>

      {/* Free vs Paid Cards */}
      <section className="py-12 px-6 mx-auto max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Free Community Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-[#e5e5e5] flex flex-col h-full"
          >
            <div className="mb-6">
              <h2 className="font-serif text-[28px] font-medium text-[#111111] mb-3">Free Community</h2>
              <p className="text-[#666666] text-[15px] leading-relaxed">
                Start here. Connect with fellow artists and art lovers and become part of the Fameuxarte community.
              </p>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              {[
                "Access to the Fameuxarte Discord community",
                "Connect with artists and creators",
                "Community discussions",
                "Art discovery and inspiration",
                "Community announcements",
                "Networking opportunities",
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-[#333333]">
                  <Check className="h-5 w-5 text-[#b28247] shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="w-full h-12 rounded-xl bg-[#111111] text-white hover:bg-black transition-all"
              onClick={() => handleFreeJoinClick("pricing_card")}
            >
              <a href={FAMEUXARTE_DISCORD_URL} target="_blank" rel="noopener noreferrer">
                Join Free
              </a>
            </Button>
          </motion.div>

          {/* Inner Circle Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#111111] p-8 sm:p-10 rounded-3xl shadow-lg border border-[#333333] flex flex-col h-full relative overflow-hidden"
          >
            {/* Subtle gradient effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#b28247]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="mb-6 relative z-10">
              <span className="inline-block px-3 py-1 bg-[#222222] border border-[#444444] text-[#b28247] text-[11px] font-semibold tracking-wider uppercase rounded-full mb-4">
                Premium Community
              </span>
              <h2 className="font-serif text-[28px] font-medium text-white mb-3">Inner Circle</h2>
              <p className="text-[#999999] text-[15px] leading-relaxed">
                For artists and creators who want deeper access, accountability, learning, networking, and opportunities.
              </p>
            </div>
            <ul className="space-y-4 mb-10 flex-grow relative z-10">
              {[
                "Everything in Free Community",
                "Exclusive Inner Circle discussions",
                "Premium resources and insights",
                "Artist growth conversations",
                "Business and monetization discussions",
                "Networking with serious creators",
                "Early access to selected Fameuxarte opportunities",
                "Members-only sessions/events",
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-[#dddddd]">
                  <Check className="h-5 w-5 text-[#b28247] shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="relative z-10">
              {hasInnerCircleUrl ? (
                <Button
                  asChild
                  className="w-full h-12 rounded-xl bg-[#b28247] text-white hover:bg-[#9c713b] transition-all"
                  onClick={() => handleInnerCircleClick("pricing_card")}
                >
                  <a href={FAMEUXARTE_INNER_CIRCLE_URL} target="_blank" rel="noopener noreferrer">
                    Join Inner Circle
                  </a>
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full h-12 rounded-xl bg-[#333333] text-[#777777] cursor-not-allowed"
                >
                  Coming Soon
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tier Comparison */}
      <section className="py-16 px-6 mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <h3 className="font-serif text-[24px] font-medium text-[#111111]">Compare Tiers</h3>
        </div>
        
        {/* Mobile View: Stacked Cards */}
        <div className="md:hidden space-y-8">
          {[
            { feature: "Discord Community", free: true, paid: true },
            { feature: "Community Discussions", free: true, paid: true },
            { feature: "Artist Networking", free: true, paid: true },
            { feature: "Art Discovery", free: true, paid: true },
            { feature: "Premium Resources", free: false, paid: true },
            { feature: "Exclusive Discussions", free: false, paid: true },
            { feature: "Members-only Sessions", free: false, paid: true },
            { feature: "Growth & Business Discussions", free: false, paid: true },
            { feature: "Early Opportunities", free: false, paid: true },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <h4 className="font-medium text-[#111111] mb-4 text-[15px]">{item.feature}</h4>
              <div className="flex justify-between items-center text-[14px]">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[#666666] text-xs uppercase tracking-wider">Free</span>
                  {item.free ? <Check className="h-5 w-5 text-[#111111]" /> : <X className="h-5 w-5 text-[#cccccc]" />}
                </div>
                <div className="w-px h-8 bg-[#e5e5e5]"></div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[#b28247] text-xs uppercase tracking-wider">Inner Circle</span>
                  {item.paid ? <Check className="h-5 w-5 text-[#b28247]" /> : <X className="h-5 w-5 text-[#cccccc]" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e5e5e5] bg-[#faf8f5]">
                <th className="py-4 px-6 font-medium text-[#666666] text-[13px] uppercase tracking-wider w-1/2">Feature</th>
                <th className="py-4 px-6 font-medium text-[#666666] text-[13px] uppercase tracking-wider text-center w-1/4">Free</th>
                <th className="py-4 px-6 font-medium text-[#b28247] text-[13px] uppercase tracking-wider text-center w-1/4">Inner Circle</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Discord Community", free: true, paid: true },
                { feature: "Community Discussions", free: true, paid: true },
                { feature: "Artist Networking", free: true, paid: true },
                { feature: "Art Discovery", free: true, paid: true },
                { feature: "Premium Resources", free: false, paid: true },
                { feature: "Exclusive Discussions", free: false, paid: true },
                { feature: "Members-only Sessions", free: false, paid: true },
                { feature: "Growth & Business Discussions", free: false, paid: true },
                { feature: "Early Opportunities", free: false, paid: true },
              ].map((item, idx) => (
                <tr key={idx} className="border-b border-[#e5e5e5] last:border-0 hover:bg-[#faf8f5] transition-colors">
                  <td className="py-4 px-6 text-[#333333] text-[15px]">{item.feature}</td>
                  <td className="py-4 px-6 text-center">
                    {item.free ? <Check className="h-5 w-5 text-[#111111] mx-auto" /> : <span className="text-[#cccccc]">—</span>}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {item.paid ? <Check className="h-5 w-5 text-[#b28247] mx-auto" /> : <span className="text-[#cccccc]">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-16 px-6 mx-auto max-w-6xl">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="font-serif text-[32px] sm:text-[40px] font-medium text-[#111111] mb-4">More Than a Discord Server.</h2>
          <p className="text-[#666666] text-[16px] leading-relaxed">
            Fameuxarte is building a space where artists don't have to create alone. Meet people, exchange ideas, learn how to grow your creative career, discover opportunities, and build meaningful connections around art.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Users,
              title: "Connect",
              desc: "Meet artists, collectors, creators, and people who genuinely care about art."
            },
            {
              icon: BookOpen,
              title: "Learn",
              desc: "Exchange knowledge around art, creativity, business, technology, and growth."
            },
            {
              icon: TrendingUp,
              title: "Grow",
              desc: "Build your network, discover opportunities, and turn your creative work into something bigger."
            },
            {
              icon: MessageSquare,
              title: "Discover",
              desc: "Find new artists, ideas, projects, and inspiration from the community."
            }
          ].map((card, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-[#e5e5e5] shadow-sm flex flex-col"
            >
              <div className="h-12 w-12 rounded-xl bg-[#faf8f5] flex items-center justify-center mb-5 text-[#b28247]">
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-[20px] font-medium text-[#111111] mb-3">{card.title}</h3>
              <p className="text-[#666666] text-[14px] leading-relaxed flex-grow">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 px-6 mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white p-10 sm:p-14 rounded-[2rem] border border-[#e5e5e5] shadow-sm relative overflow-hidden"
        >
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#f4ebd9] rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="font-serif text-[32px] sm:text-[40px] font-medium text-[#111111] mb-4">
              Your Next Creative Connection Could Be Here.
            </h2>
            <p className="text-[#666666] text-[16px] leading-relaxed mb-8 max-w-xl mx-auto">
              Join the Fameuxarte community and be part of what we're building.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                className="w-full sm:w-auto h-12 px-8 rounded-full bg-[#111111] text-white hover:bg-black transition-all text-sm font-medium"
                onClick={() => handleFreeJoinClick("bottom_cta")}
              >
                <a href={FAMEUXARTE_DISCORD_URL} target="_blank" rel="noopener noreferrer">
                  Join Free Community
                </a>
              </Button>
              {hasInnerCircleUrl ? (
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-8 rounded-full border-[#222222] text-[#111111] hover:bg-[#f0ece6] transition-all text-sm font-medium group"
                  onClick={() => handleInnerCircleClick("bottom_cta")}
                >
                  <a href={FAMEUXARTE_INNER_CIRCLE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    Enter Inner Circle
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              ) : (
                <Button
                  disabled
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-8 rounded-full border-[#222222] text-[#888888] bg-transparent text-sm font-medium cursor-not-allowed opacity-60"
                >
                  Inner Circle (Coming Soon)
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Community;
