import { Award, Lock, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const trustItems = [
  { label: "AI-verified authenticity", icon: ShieldCheck },
  { label: "Worldwide delivery", icon: Truck },
  { label: "Provenance certificate", icon: Award },
  { label: "30-day return", icon: RotateCcw },
  { label: "Secure acquisition", icon: Lock },
];

const TrustBar = () => {
  return (
    <section className="flex flex-wrap items-center justify-center gap-8 bg-surface-2 px-6 py-[14px]">
      {trustItems.map(({ label, icon: Icon }) => (
        <div key={label} className="flex items-center gap-[7px]">
          <Icon className="h-[14px] w-[14px] text-verified" />
          <span className="text-[11px] tracking-[0.04em] text-[#555]">{label}</span>
        </div>
      ))}
    </section>
  );
};

export default TrustBar;
