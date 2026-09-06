import { LegalLayout } from "@/components/layouts/LegalLayout";
import { LegalDocument } from "@/components/shared/LegalDocument";
import { SEO } from "@/components/SEO";

export default function ArtistTermsPage() {
  return (
    <LegalLayout>
      <SEO
        title="Artist Agreement - Fameuxarte"
        description="Terms and conditions governing the relationship between Fameuxarte and our verified artists."
        canonicalUrl="/legal/artist-terms"
      />
      <LegalDocument documentType="artist_agreement" fallbackTitle="Artist Agreement" />
    </LegalLayout>
  );
}
