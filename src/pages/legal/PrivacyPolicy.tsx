import { LegalLayout } from "@/components/layouts/LegalLayout";
import { LegalDocument } from "@/components/shared/LegalDocument";
import { SEO } from "@/components/SEO";

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout>
      <SEO
        title="Privacy Policy - Fameuxarte"
        description="Learn how Fameuxarte collects, uses, and protects your personal information."
        canonicalUrl="/legal/privacy"
      />
      <LegalDocument documentType="privacy_policy" fallbackTitle="Privacy Policy" />
    </LegalLayout>
  );
}
