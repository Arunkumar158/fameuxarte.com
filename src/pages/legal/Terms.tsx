import { LegalLayout } from "@/components/layouts/LegalLayout";
import { LegalDocument } from "@/components/shared/LegalDocument";
import { SEO } from "@/components/SEO";

export default function TermsOfServicePage() {
  return (
    <LegalLayout>
      <SEO
        title="Terms & Conditions - Fameuxarte"
        description="General terms and conditions for using the Fameuxarte platform."
        canonicalUrl="/legal/terms"
      />
      <LegalDocument documentType="terms_conditions" fallbackTitle="Terms & Conditions" />
    </LegalLayout>
  );
}
