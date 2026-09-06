import { LegalLayout } from "@/components/layouts/LegalLayout";
import { LegalDocument } from "@/components/shared/LegalDocument";
import { SEO } from "@/components/SEO";

export default function CookiesPage() {
  return (
    <LegalLayout>
      <SEO
        title="Cookie Policy - Fameuxarte"
        description="Information about how Fameuxarte uses cookies and similar tracking technologies."
        canonicalUrl="/legal/cookies"
      />
      <LegalDocument documentType="cookie_policy" fallbackTitle="Cookie Policy" />
    </LegalLayout>
  );
}
