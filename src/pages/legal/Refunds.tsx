import { LegalLayout } from "@/components/layouts/LegalLayout";
import { LegalDocument } from "@/components/shared/LegalDocument";
import { SEO } from "@/components/SEO";

export default function RefundsPage() {
  return (
    <LegalLayout>
      <SEO
        title="Refunds & Cancellations - Fameuxarte"
        description="Our policy regarding returns, refunds, and order cancellations."
        canonicalUrl="/legal/refunds"
      />
      <LegalDocument documentType="return_policy" fallbackTitle="Refund & Cancellation Policy" />
    </LegalLayout>
  );
}
