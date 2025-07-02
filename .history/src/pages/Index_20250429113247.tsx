import MainLayout from "@/components/layouts/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import FeaturedArtists from "@/components/home/FeaturedArtists";
import Testimonials from "@/components/home/Testimonials";
import BlogInsights from "@/components/home/BlogInsights";
import ContactSection from "@/components/home/ContactSection";
import NewsletterSignup from "@/components/home/NewsletterSignup";
import { SEO } from "@/components/SEO";
import { generateOrganizationStructuredData } from "@/lib/seo";
import ArtworkGrid from "@/components/ArtworkGrid";
import SectionTitle from "@/components/shared/SectionTitle";

const Index = () => {
  const structuredData = generateOrganizationStructuredData();

  return (
    <MainLayout>
      <SEO
        title="Fameuxarte - Discover Authentic Artworks"
        description="Explore Fameuxarte: a trusted platform connecting you with authentic physical and digital artworks from talented artists worldwide."
        canonicalUrl="/"
        ogImage="/og-image.jpg"
        type="website"
        structuredData={structuredData}
      />
      <HeroSection />
      <AboutSection />
      <div className="container py-12">
        <SectionTitle
          title="Artworks Gallery"
          subtitle="Explore our curated collection of exceptional artworks"
        />
        <ArtworkGrid />
      </div>
      <FeaturedArtists />
      <Testimonials />
      <BlogInsights />
      <ContactSection />
      <NewsletterSignup />
    </MainLayout>
  );
};

export default Index;
