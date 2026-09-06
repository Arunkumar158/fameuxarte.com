import { LegalLayout } from "@/components/layouts/LegalLayout";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, CreditCard, Package, ArrowLeftRight, LifeBuoy } from "lucide-react";

export default function TrustCenter() {
  const sections = [
    {
      title: "Artist Verification",
      icon: <CheckCircle className="w-8 h-8 text-gold mb-4" />,
      description: "How we carefully vet and verify every artist on our platform.",
      link: "/trust/verification"
    },
    {
      title: "Artwork Authenticity",
      icon: <Shield className="w-8 h-8 text-gold mb-4" />,
      description: "Our guarantee of originality and how Certificates of Authenticity work.",
      link: "/trust/authenticity"
    },
    {
      title: "Secure Payments",
      icon: <CreditCard className="w-8 h-8 text-gold mb-4" />,
      description: "How we process payments safely and protect your financial information.",
      link: "/trust/payments"
    },
    {
      title: "Shipping & Delivery",
      icon: <Package className="w-8 h-8 text-gold mb-4" />,
      description: "How fine art travels safely from the artist's studio to your home.",
      link: "/trust/shipping"
    },
    {
      title: "Returns & Refunds",
      icon: <ArrowLeftRight className="w-8 h-8 text-gold mb-4" />,
      description: "What happens if an artwork isn't right for you or arrives damaged.",
      link: "/trust/returns"
    }
  ];

  return (
    <LegalLayout>
      <SEO
        title="Trust Center - Fameuxarte"
        description="Learn how Fameuxarte ensures a safe, secure, and authentic marketplace for fine art."
        canonicalUrl="/trust"
      />
      
      <div className="max-w-4xl mx-auto py-8">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-linen mb-6">
            Trust at Fameuxarte
          </h1>
          <p className="text-lg text-[#888] max-w-2xl mx-auto leading-relaxed">
            We are committed to building the most secure and transparent marketplace for fine art. 
            Learn about the systems and policies we have in place to protect both our collectors and our artists.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section) => (
            <Link 
              key={section.title}
              to={section.link}
              className="bg-obsidian border border-border-subtle p-8 rounded-2xl hover:border-gold transition-colors group flex flex-col"
            >
              {section.icon}
              <h2 className="text-xl font-medium text-linen mb-3 group-hover:text-gold transition-colors">
                {section.title}
              </h2>
              <p className="text-[#888] leading-relaxed mb-6 flex-grow">
                {section.description}
              </p>
              <div className="text-gold text-sm font-medium tracking-wide uppercase mt-auto flex items-center">
                Learn More <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}

          {/* Support block */}
          <div className="bg-surface-0 border border-border-subtle p-8 rounded-2xl flex flex-col">
            <LifeBuoy className="w-8 h-8 text-gold mb-4" />
            <h2 className="text-xl font-medium text-linen mb-3">
              Customer Support
            </h2>
            <p className="text-[#888] leading-relaxed mb-6 flex-grow">
              Have a question that isn't answered here? Our dedicated support team is ready to assist you.
            </p>
            <Link to="/contact" className="text-gold text-sm font-medium tracking-wide uppercase mt-auto flex items-center hover:underline">
              Contact Us <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
}
