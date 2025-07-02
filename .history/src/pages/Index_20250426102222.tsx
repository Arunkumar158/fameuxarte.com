
import MainLayout from "@/components/layouts/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedArtworks from "@/components/home/FeaturedArtworks";
import AboutSection from "@/components/home/AboutSection";
import FeaturedArtists from "@/components/home/FeaturedArtists";
import Testimonials from "@/components/home/Testimonials";
import BlogInsights from "@/components/home/BlogInsights";
import ContactSection from "@/components/home/ContactSection";
import NewsletterSignup from "@/components/home/NewsletterSignup";

const Index = () => {
  return (
    <MainLayout>
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
