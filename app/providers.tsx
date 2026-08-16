"use client";

import React, { useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { DiscoveryProvider } from "@/providers/DiscoveryProvider";
import { PostHogProvider } from "@/providers/PostHogProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import Footer from "@/components/navigation/Footer";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <DiscoveryProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <PostHogProvider>
              <AuthProvider>
                <CartProvider>
                  <CurrencyProvider>
                    <div className="min-h-screen flex flex-col">
                      <main className="flex flex-col flex-grow">{children}</main>
                      <Footer />
                    </div>
                  </CurrencyProvider>
                </CartProvider>
              </AuthProvider>
            </PostHogProvider>
          </TooltipProvider>
        </DiscoveryProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

