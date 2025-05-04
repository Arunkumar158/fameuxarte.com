import MainLayout from "@/components/layouts/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedArtworks from "@/components/home/FeaturedArtworks";
import AboutSection from "@/components/home/AboutSection";
import FeaturedArtists from "@/components/home/FeaturedArtists";
import Testimonials from "@/components/home/Testimonials";
import BlogInsights from "@/components/home/BlogInsights";
import ContactSection from "@/components/home/ContactSection";
import NewsletterSignup from "@/components/home/NewsletterSignup";
import { SEO } from "@/components/SEO";
import { generateOrganizationStructuredData } from "@/lib/seo";

const Index = () => {
  const structuredData = generateOrganizationStructuredData();

  return (
    <MainLayout>
      <SEO
        title="Gallery Canvas Commerce - Premium Art Marketplace"
        description="Discover and purchase unique artworks from talented artists worldwide. Browse our curated collection of paintings, sculptures, and digital art."
        canonicalUrl="/"
        ogImage="/og-image.jpg"
        type="website"
        structuredData={structuredData}
      />
      <HeroSection />
      <AboutSection />
      <FeaturedArtworks />
      <FeaturedArtists />
      <Testimonials />
      <BlogInsights />
      <ContactSection />
      <NewsletterSignup />
    </MainLayout>
  );
};

export default Index;
