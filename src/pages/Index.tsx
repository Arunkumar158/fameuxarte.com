import HeroSection from "@/components/home/HeroSection";
import { SEO } from "@/components/SEO";
import { generateOrganizationStructuredData } from "@/lib/seo";
import HomeNav from "@/components/home/HomeNav";
import TrustBar from "@/components/home/TrustBar";
import FeaturedArtworks from "@/components/home/FeaturedArtworks";
import ArtistsSection from "@/components/home/ArtistsSection";
import WhySection from "@/components/home/WhySection";
import JournalSection from "@/components/home/JournalSection";
import FooterCTA from "@/components/home/FooterCTA";
import ScrollLogo from "@/components/ScrollLogo";

const Index = () => {
  const structuredData = generateOrganizationStructuredData();

  return (
    <div className="relative min-h-screen">
      <ScrollLogo />
      
      <div className="relative z-10 bg-transparent">
        <SEO
          title="Fameuxarte | Curated Art for Collectors &amp; Investors"
          description="Premium marketplace for authentic, investment-grade artworks. Discover custom-curated paintings, sculptures, and digital art from established and emerging artists worldwide."
          canonicalUrl="/"
          ogImage="/og-image.jpg"
          type="website"
          structuredData={structuredData}
        />
        <HomeNav />
        <HeroSection />
        <TrustBar />
        <FeaturedArtworks />
        <ArtistsSection />
        <WhySection />
        <JournalSection />
        <FooterCTA />
      </div>
    </div>
  );
};

export default Index;
