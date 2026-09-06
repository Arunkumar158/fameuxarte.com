import { LegalLayout } from "@/components/layouts/LegalLayout";
import { SEO } from "@/components/SEO";
import { useParams } from "react-router-dom";

export default function TrustPage() {
  const { topic } = useParams<{ topic: string }>();
  
  const contentMap: Record<string, { title: string; description: string }> = {
    verification: {
      title: "Artist Verification",
      description: "How we verify the identity and professional background of our artists."
    },
    authenticity: {
      title: "Artwork Authenticity",
      description: "How Certificates of Authenticity work on Fameuxarte."
    },
    payments: {
      title: "Secure Payments",
      description: "How payments are processed securely via our partners."
    },
    shipping: {
      title: "Shipping & Delivery",
      description: "How we ensure your art arrives safely."
    },
    returns: {
      title: "Returns & Refunds",
      description: "Our return procedures and how we handle damaged items."
    }
  };

  const content = topic && contentMap[topic] ? contentMap[topic] : { title: "Trust Center", description: "Information about Trust and Safety." };

  return (
    <LegalLayout>
      <SEO
        title={`${content.title} - Trust Center | Fameuxarte`}
        description={content.description}
        canonicalUrl={`/trust/${topic}`}
      />
      
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-linen mb-6">
          {content.title}
        </h1>
        <div className="prose prose-invert prose-stone max-w-none text-[#bbb] font-sans">
          <p className="text-lg">
            {content.description}
          </p>
          <div className="mt-8 p-6 bg-surface-1 border border-border-subtle rounded-xl text-center">
            <h3 className="text-linen font-medium mb-2">Content in Development</h3>
            <p className="text-sm">
              We are currently finalizing the specific details and procedures for this section to ensure the highest standards of trust and transparency. 
              <br/><br/>
              <em>[PENDING BUSINESS DECISION: Finalize internal procedures and customer-facing explanations for this Trust Center topic.]</em>
            </p>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
}
