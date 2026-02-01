import MainLayout from "@/components/layouts/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
// import FeaturedArtists from "@/components/home/FeaturedArtists";
import Testimonials from "@/components/home/Testimonials";
import BlogInsights from "@/components/home/BlogInsights";
import ContactSection from "@/components/home/ContactSection";
import NewsletterSignup from "@/components/home/NewsletterSignup";
import { SEO } from "@/components/SEO";
import { generateOrganizationStructuredData } from "@/lib/seo";
import ArtworkSlider from "@/components/home/ArtworkSlider";
import SectionTitle from "@/components/shared/SectionTitle";

const Index = () => {
  const structuredData = generateOrganizationStructuredData();

  return (
    <MainLayout>
      <SEO
        title="Fameuxarte | Curated Art for Collectors &amp; Investors"
        description="Premium marketplace for authentic, investment-grade artworks. Discover custom-curated paintings, sculptures, and digital art from established and emerging artists worldwide."
        canonicalUrl="/"
        ogImage="/og-image.jpg"
        type="website"
        structuredData={structuredData}
      />
      <HeroSection />
      <AboutSection />
      <div className="container py-12">
        <SectionTitle
          title="Featured Artworks"
          subtitle="Custom-curated pieces from our collection of exceptional artworks"
        />
        <ArtworkSlider />
      </div>
      {/* <FeaturedArtists /> */}
      <Testimonials />
      <BlogInsights />
      <ContactSection />
      <NewsletterSignup />
    </MainLayout>
  );
};

export default Index;
