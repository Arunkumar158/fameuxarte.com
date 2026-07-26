import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { SEO } from "@/components/SEO";
import Footer from "@/components/navigation/Footer";
import { generateOrganizationStructuredData } from "@/lib/seo";
import { motion, AnimatePresence } from "framer-motion";
import { PostHogProvider } from "@/providers/PostHogProvider";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import Artworks from "./pages/Artworks";
import Artists from "./pages/Artists";
import ArtistDetails from "./pages/ArtistDetails";
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
import ForArtists from "./pages/ForArtists";

// Admin Imports
import { AdminRoute } from "./components/admin/AdminRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrdersAdmin from "./pages/admin/Orders";
import ArtistsAdmin from "./pages/admin/Artists";
import ArtworksAdmin from "./pages/admin/Artworks";
import CollectionsAdmin from "./pages/admin/Collections";
import SEOAdmin from "./pages/admin/SEO";
import AnalyticsAdmin from "./pages/admin/Analytics";
import SettingsAdmin from "./pages/admin/Settings";
import InsightsList from "./pages/admin/insights/InsightsList";
import InsightsEditor from "./pages/admin/insights/InsightsEditor";

const queryClient = new QueryClient();
const organizationStructuredData = generateOrganizationStructuredData();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-grow"
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/artworks" element={<Artworks />} />
          <Route path="/artworks/:slug" element={<ArtworkDetails />} />
          <Route path="/for-artists" element={<ForArtists />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/artists/:artistId" element={<ArtistDetails />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/insights" element={<Blog />} />
          <Route path="/insights/:slug" element={<BlogPost />} />
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
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<OrdersAdmin />} />
            <Route path="artists" element={<ArtistsAdmin />} />
            <Route path="artworks" element={<ArtworksAdmin />} />
            <Route path="collections" element={<CollectionsAdmin />} />
            <Route path="seo" element={<SEOAdmin />} />
            <Route path="analytics" element={<AnalyticsAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
            <Route path="insights" element={<InsightsList />} />
            <Route path="insights/:id" element={<InsightsEditor />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <main className="flex flex-col flex-grow">
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
          <PostHogProvider>
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
                    <AnimatedRoutes />
                  </Layout>
                </CurrencyProvider>
              </CartProvider>
            </AuthProvider>
          </PostHogProvider>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
