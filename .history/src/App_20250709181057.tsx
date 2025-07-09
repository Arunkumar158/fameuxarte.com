import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { SEO } from "@/components/SEO";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import { generateOrganizationStructuredData } from "@/lib/seo";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import Artworks from "./pages/Artworks";
import Artists from "./pages/Artists";
import Collections from "./pages/Collections";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import LikedItems from "./pages/LikedItems";
import OrderSuccess from "./pages/OrderSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import Account from "./pages/Account";
import ArtworkDetails from "./pages/ArtworkDetails";
import ContactUs from "./pages/ContactUs";
import FAQ from "./pages/FAQ";
import OurStory from "./pages/OurStory";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CancellationsAndRefunds from "./pages/CancellationsAndRefunds";

const queryClient = new QueryClient();
const organizationStructuredData = generateOrganizationStructuredData();

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow pt-16 sm:pt-20">
      {children}
    </main>
    <Footer />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <CurrencyProvider>
                <SEO
                  title="Fameuxarte - Discover Authentic Artworks"
                  description="Discover and purchase unique artworks from talented artists worldwide. Browse our curated collection of paintings, sculptures, and digital art."
                  canonicalUrl="/"
                  structuredData={organizationStructuredData}
                />
                <Layout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/artworks" element={<Artworks />} />
                    <Route path="/artworks/:slug" element={<ArtworkDetails />} />
                    <Route path="/artists" element={<Artists />} />
                    <Route path="/collections" element={<Collections />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/liked-items" element={<LikedItems />} />
                    <Route path="/order-success" element={<OrderSuccess />} />
                    <Route path="/payment-failed" element={<PaymentFailed />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/profile" element={<Account />} />
                    <Route path="/contact-us" element={<ContactUs />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/our-story" element={<OurStory />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                    <Route path="/cancellations-and-refunds" element={<CancellationsAndRefunds />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </CurrencyProvider>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
