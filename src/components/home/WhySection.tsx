import { ShieldCheck, TrendingUp, Users } from "lucide-react";

const reasons = [
  {
    title: "Trust-first platform",
    body: "Every artwork is reviewed by ArtGuard before listing. You collect with confidence, not hope.",
    icon: ShieldCheck,
  },
  {
    title: "Investment intelligence",
    body: "AI-driven price insights help you understand the value trajectory of emerging artists.",
    icon: TrendingUp,
  },
  {
    title: "Direct from artists",
    body: "No intermediaries. Your acquisition goes straight to the creator - fairly priced, fully transparent.",
    icon: Users,
  },
];

const WhySection = () => {
  return (
    <section className="bg-obsidian px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-7 text-center text-[22px] font-medium tracking-[-0.015em] text-linen">
          Why collectors choose Fameuxarte
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {reasons.map(({ title, body, icon: Icon }) => (
            <article key={title} className="rounded-[10px] border border-border-subtle bg-surface-2 p-5">
              <Icon className="mb-[14px] h-5 w-5 text-gold" />
              <h3 className="mb-[6px] text-[13px] font-medium text-[#d0ccc4]">{title}</h3>
              <p className="text-[12px] leading-[1.7] text-[#555]">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhySection;
