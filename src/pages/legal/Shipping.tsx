import { LegalLayout } from "@/components/layouts/LegalLayout";
import { LegalDocument } from "@/components/shared/LegalDocument";
import { SEO } from "@/components/SEO";

export default function ShippingPage() {
  return (
    <LegalLayout>
      <SEO
        title="Shipping & Delivery - Fameuxarte"
        description="How shipping and delivery works for artworks purchased on Fameuxarte."
        canonicalUrl="/legal/shipping"
      />
      <LegalDocument documentType="shipping_policy" fallbackTitle="Shipping & Delivery Policy" />
    </LegalLayout>
  );
}
