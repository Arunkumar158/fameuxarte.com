import { LegalLayout } from "@/components/layouts/LegalLayout";
import { LegalDocument } from "@/components/shared/LegalDocument";
import { SEO } from "@/components/SEO";

export default function BuyerTermsPage() {
  return (
    <LegalLayout>
      <SEO
        title="Buyer Terms - Fameuxarte"
        description="Terms and conditions for purchasing artwork on Fameuxarte."
        canonicalUrl="/legal/buyer-terms"
      />
      <LegalDocument documentType="buyer_terms" fallbackTitle="Buyer Terms" />
    </LegalLayout>
  );
}
