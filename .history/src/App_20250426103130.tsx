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
import Shipping from "./pages/Shipping";
import FAQ from "./pages/FAQ";
import OurStory from "./pages/OurStory";

const queryClient = new QueryClient();

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
                  title="Gallery Canvas Commerce - Premium Art Marketplace"
                  description="Discover and purchase unique artworks from talented artists worldwide. Browse our curated collection of paintings, sculptures, and digital art."
                  canonicalUrl="/"
                />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/artworks" element={<Artworks />} />
                  <Route path="/artworks/:id" element={<ArtworkDetails />} />
                  <Route path="/artists" element={<Artists />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:id" element={<BlogPost />} />
                  <Route path="/liked-items" element={<LikedItems />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/payment-failed" element={<PaymentFailed />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/profile" element={<Account />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/shipping" element={<Shipping />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/about" element={<OurStory />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </CurrencyProvider>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
