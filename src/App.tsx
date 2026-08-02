import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { DiscoveryProvider } from '@/providers/DiscoveryProvider';
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
import CertificateVerify from "./pages/CertificateVerify";
import { Navigate } from "react-router-dom";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Discovery Pages
import CollectionPage from "./pages/discovery/CollectionPage";
import CategoryPage from "./pages/discovery/CategoryPage";
import StylePage from "./pages/discovery/StylePage";
import MediumPage from "./pages/discovery/MediumPage";
import SubjectPage from "./pages/discovery/SubjectPage";
import LocationPage from "./pages/discovery/LocationPage";
import ColorPage from "./pages/discovery/ColorPage";
import ProgrammaticDiscoveryPage from "./pages/discovery/ProgrammaticDiscoveryPage";

// Collector Imports
import { CollectorRoute } from "./components/collector/CollectorRoute";
import { CollectorLayout } from "./components/collector/CollectorLayout";
const CollectorDashboard = React.lazy(() => import("./pages/collector/Dashboard"));
const CollectorCollection = React.lazy(() => import("./pages/collector/Collection"));
const CollectorWishlist = React.lazy(() => import("./pages/collector/Wishlist"));
const CollectorOrders = React.lazy(() => import("./pages/collector/Orders"));
const CollectorCertificates = React.lazy(() => import("./pages/collector/Certificates"));
const CollectorFollowing = React.lazy(() => import("./pages/collector/Following"));
const CollectorSavedCollections = React.lazy(() => import("./pages/collector/SavedCollections"));
const CollectorNotifications = React.lazy(() => import("./pages/collector/Notifications"));
const CollectorAddresses = React.lazy(() => import("./pages/collector/Addresses"));
const CollectorSettings = React.lazy(() => import("./pages/collector/Settings"));

// Admin Imports
import { AdminRoute } from "./components/admin/AdminRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrdersAdmin from "./pages/admin/Orders";
import ArtworksAdmin from "./pages/admin/Artworks";
import ArtistsAdmin from "./pages/admin/Artists";
import VerificationManagement from "./pages/admin/VerificationManagement";
import CollectionsAdmin from "./pages/admin/Collections";
import SEOAdmin from "./pages/admin/SEO";
import AnalyticsAdmin from "./pages/admin/Analytics";
import SettingsAdmin from "./pages/admin/Settings";
import InsightsList from "./pages/admin/insights/InsightsList";
import InsightsEditor from "./pages/admin/insights/InsightsEditor";

// Artist Imports
import { ArtistRoute } from "./components/artist/ArtistRoute";
import { ArtistLayout } from "./components/artist/ArtistLayout";
import ArtistDashboard from "./pages/artist/Dashboard";
import ArtistArtworksList from "./pages/artist/ArtworksList";
import ArtworkEditor from "./pages/artist/ArtworkEditor";
import ArtistCollectionsList from "./pages/artist/CollectionsList";
import CollectionEditor from "./pages/artist/CollectionEditor";
import ArtistPortfolioPreview from "./pages/artist/PortfolioPreview";
import ArtistSettings from "./pages/artist/Settings";
import ArtistAnalytics from "./pages/artist/Analytics";
import ArtistOrdersList from "./pages/artist/OrdersList";
import ArtistOrderDetails from "./pages/artist/OrderDetails";
import ArtistVerificationCenter from "./pages/artist/VerificationCenter";

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
          <Route path="/collections/:slug" element={<CollectionPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/style/:slug" element={<StylePage />} />
          <Route path="/medium/:slug" element={<MediumPage />} />
          <Route path="/subject/:slug" element={<SubjectPage />} />
          <Route path="/location/:slug" element={<LocationPage />} />
          <Route path="/color/:slug" element={<ColorPage />} />
          <Route path="/discover/*" element={<ProgrammaticDiscoveryPage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/insights" element={<Blog />} />
          <Route path="/insights/:slug" element={<BlogPost />} />
          <Route path="/liked-items" element={<LikedItems />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/verify/:certificateNumber" element={<CertificateVerify />} />
          <Route path="/account" element={<Navigate to="/collector" replace />} />
          <Route path="/profile" element={<Navigate to="/collector" replace />} />
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
            <Route path="artworks" element={<ArtworksAdmin />} />
            <Route path="artists" element={<ArtistsAdmin />} />
            <Route path="verification" element={<VerificationManagement />} />
            <Route path="collections" element={<CollectionsAdmin />} />
            <Route path="seo" element={<SEOAdmin />} />
            <Route path="analytics" element={<AnalyticsAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
            <Route path="insights" element={<InsightsList />} />
            <Route path="insights/:id" element={<InsightsEditor />} />
          </Route>

          {/* Collector Routes */}
          <Route path="/collector" element={<CollectorRoute><CollectorLayout /></CollectorRoute>}>
            <Route index element={<Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>}><CollectorDashboard /></Suspense>} />
            <Route path="collection" element={<Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>}><CollectorCollection /></Suspense>} />
            <Route path="wishlist" element={<Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>}><CollectorWishlist /></Suspense>} />
            <Route path="orders" element={<Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>}><CollectorOrders /></Suspense>} />
            <Route path="certificates" element={<Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>}><CollectorCertificates /></Suspense>} />
            <Route path="following" element={<Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>}><CollectorFollowing /></Suspense>} />
            <Route path="saved-collections" element={<Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>}><CollectorSavedCollections /></Suspense>} />
            <Route path="notifications" element={<Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>}><CollectorNotifications /></Suspense>} />
            <Route path="addresses" element={<Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>}><CollectorAddresses /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>}><CollectorSettings /></Suspense>} />
          </Route>

          {/* Artist Routes */}
          <Route path="/artist" element={<ArtistRoute><ArtistLayout /></ArtistRoute>}>
            <Route index element={<ArtistDashboard />} />
            <Route path="analytics" element={<ArtistAnalytics />} />
            <Route path="artworks" element={<ArtistArtworksList />} />
            <Route path="artworks/new" element={<ArtworkEditor />} />
            <Route path="artworks/:id/edit" element={<ArtworkEditor />} />
            <Route path="collections" element={<ArtistCollectionsList />} />
            <Route path="collections/new" element={<CollectionEditor />} />
            <Route path="collections/:id/edit" element={<CollectionEditor />} />
            <Route path="portfolio" element={<ArtistPortfolioPreview />} />
            <Route path="settings" element={<ArtistSettings />} />
            <Route path="verification" element={<ArtistVerificationCenter />} />
            <Route path="orders" element={<ArtistOrdersList />} />
            <Route path="orders/:id" element={<ArtistOrderDetails />} />
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
    <DiscoveryProvider>
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
    </DiscoveryProvider>
  </QueryClientProvider>
);

export default App;
