import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Cpu, Fingerprint, ArrowRight, Sparkles, Shield, UserCheck, FileText } from "lucide-react";

interface HeroSectionProps {
  artworkCount?: number | string;
  artistCount?: number | string;
}

const trustPillars = [
  {
    icon: ShieldCheck,
    title: "Authenticity Verification",
    description: "Every artwork undergoes a verification process designed to strengthen confidence in original human-created artwork.",
    tag: "Intelligence",
    badgeColor: "from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/30",
  },
  {
    icon: UserCheck,
    title: "Verified Artists",
    description: "Artists complete identity and portfolio verification before earning trusted recognition on Fameuxarte.",
    tag: "Authentication",
    badgeColor: "from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30",
  },
  {
    icon: FileText,
    title: "Certificates & Provenance",
    description: "Every purchase includes a Certificate of Authenticity and a documented ownership record to preserve the artwork's history.",
    tag: "Provenance",
    badgeColor: "from-blue-500/20 to-indigo-500/10 text-blue-300 border-blue-500/30",
  },
];

const HeroSection = ({ artworkCount: _artworkCount, artistCount: _artistCount }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden bg-obsidian px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-white/[0.06]">
      {/* Ambient background glow effects (Linear / Vercel style) */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#c5a059]/15 via-amber-500/5 to-transparent blur-[120px] rounded-full opacity-60" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 w-[400px] h-[300px] bg-gradient-to-bl from-emerald-500/10 via-transparent to-transparent blur-[100px] rounded-full opacity-40" />

      {/* Grid Pattern Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} 
      />

      <div className="relative mx-auto max-w-[1080px] text-center">
        {/* Eyebrow Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors hover:border-[#c5a059]/40"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-stone-300">
            TRUST • AUTHENTICITY • VERIFIED ARTISTS
          </span>
          <Sparkles className="h-3 w-3 text-gold opacity-80" />
        </motion.div>

        {/* Hero Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mb-6 text-[36px] sm:text-[54px] md:text-[62px] font-semibold leading-[1.06] tracking-[-0.03em] text-linen"
        >
          Trust Original Art.
          <br />
          <span className="bg-gradient-to-r from-linen via-[#f4e8d0] to-[#c5a059] bg-clip-text text-transparent">
            In the Age of AI.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mx-auto mb-9 max-w-[660px] text-[15px] sm:text-[17px] leading-[1.7] text-stone-400 font-normal"
        >
          As AI-generated content becomes increasingly common, trust has never mattered more. Every artwork on Fameuxarte is supported by artist verification, authenticity checks, provenance records, and certificates of authenticity—helping collectors purchase original art with confidence while protecting genuine artists.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mb-14 flex flex-col justify-center gap-3.5 sm:flex-row items-center"
        >
          <Link 
            to="/artworks" 
            className="group relative inline-flex items-center justify-center gap-2.5 rounded-lg bg-gradient-to-b from-[#dfca98] via-[#c5a059] to-[#a6823c] px-6 py-3 text-[14px] font-medium text-obsidian shadow-[0_0_20px_rgba(197,160,89,0.25)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(197,160,89,0.4)] hover:brightness-110 active:scale-[0.99] w-full sm:w-auto"
          >
            <Shield className="h-4 w-4 fill-obsidian/20" />
            <span>Explore Verified Artworks</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          
          <a 
            href="#trust" 
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-6 py-3 text-[14px] font-medium text-stone-300 backdrop-blur-md transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 hover:text-white active:scale-[0.99] w-full sm:w-auto"
          >
            <span>How We Build Trust</span>
          </a>
        </motion.div>

        {/* Trust Pillars Cards (Replacing Fake Statistics) */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 text-left"
        >
          {trustPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={pillar.title} 
                className="group relative rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 backdrop-blur-md transition-all duration-300 hover:border-[#c5a059]/40 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(197,160,89,0.08)] hover:-translate-y-0.5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#c5a059]/30 bg-[#c5a059]/10 text-gold transition-colors group-hover:border-[#c5a059]/60 group-hover:bg-[#c5a059]/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-gradient-to-r ${pillar.badgeColor}`}>
                    {pillar.tag}
                  </span>
                </div>

                <h3 className="mb-2 text-[17px] font-semibold tracking-[-0.01em] text-linen group-hover:text-white transition-colors">
                  {pillar.title}
                </h3>
                
                <p className="text-[13px] leading-[1.65] text-stone-400 font-normal">
                  {pillar.description}
                </p>

                {/* Bottom card highlight border */}
                <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-[#c5a059]/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

