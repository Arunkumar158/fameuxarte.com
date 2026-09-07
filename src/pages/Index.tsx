import HeroSection from "@/components/home/HeroSection";
import { SEO } from "@/components/SEO";
import { generateOrganizationStructuredData } from "@/lib/seo";
import HomeNav from "@/components/home/HomeNav";
import CategoryStrip from "@/components/home/CategoryStrip";
import FeaturedArtworks from "@/components/home/FeaturedArtworks";
import ArtistsSection from "@/components/home/ArtistsSection";
import InteriorShowcase from "@/components/home/InteriorShowcase";
import HomeSeoContent from "@/components/home/HomeSeoContent";
import WhySection from "@/components/home/WhySection";
import JournalSection from "@/components/home/JournalSection";
import FooterCTA from "@/components/home/FooterCTA";

const Index = () => {
  const structuredData = generateOrganizationStructuredData();

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <div className="relative z-10">
        <SEO
          title="Fameuxarte | Curated Art for Collectors & Investors"
          description="Premium marketplace for authentic, investment-grade artworks. Discover custom-curated paintings, sculptures, and digital art from established and emerging artists worldwide."
          canonicalUrl="/"
          ogImage="/og-image.jpg"
          type="website"
          structuredData={structuredData}
        />
        <HomeNav />
        <HeroSection />
        <CategoryStrip />
        <FeaturedArtworks />
        <InteriorShowcase />
        <HomeSeoContent />
        <ArtistsSection />
        <WhySection />
        <JournalSection />
        <FooterCTA />
      </div>
    </div>
  );
};

export default Index;
