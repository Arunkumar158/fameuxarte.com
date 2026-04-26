// Removed "use client" to support metadata export


import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { Inter } from "next/font/google";
import "node_modules/react-modal-video/css/modal-video.css";
import "../styles/index.css";
import type { Metadata } from 'next';


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Invest in Museum-Quality Contemporary Art | Fameuxarte",
  description: "Discover original contemporary artworks from India's emerging artists. Invest in paintings, sculptures, and mixed media. Authentic, curated, delivered worldwide.",
  openGraph: {
    type: "website",
    siteName: "Fameuxarte",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.js. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />

      <body className={`bg-[#FCFCFC] dark:bg-black ${inter.className}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Fameuxarte",
              "url": "https://fameuxarte.com",
              "description": "Discover original contemporary artworks from India's emerging artists. Invest in paintings, sculptures, and mixed media. Authentic, curated, delivered worldwide.",
              "logo": "https://fameuxarte.com/logo.png",
              "email": "contact@fameuxarte.com",
              "sameAs": [
                "https://facebook.com/fameuxarte",
                "https://instagram.com/fameuxarte",
                "https://twitter.com/fameuxarte"
              ]
            }),
          }}
        />

        <Providers>
          <Header />
          {children}
          <Footer />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}

import { Providers } from "./providers";
