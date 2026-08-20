import { Award, Lock, ShieldCheck, UserCheck, FileText, Shield } from "lucide-react";

const trustItems = [
  { label: "Verified Artists", icon: UserCheck },
  { label: "Authenticity Verification", icon: ShieldCheck },
  { label: "Certificates of Authenticity", icon: Award },
  { label: "Provenance Records", icon: FileText },
  { label: "Secure Payments", icon: Lock },
  { label: "Buyer Protection", icon: Shield },
];

const TrustBar = () => {
  return (
    <section id="trust" className="flex flex-wrap items-center justify-center gap-8 bg-transparent px-6 py-[14px]">
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
