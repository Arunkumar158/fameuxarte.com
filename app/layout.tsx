import type { Metadata, Viewport } from "next";
import "@/index.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || process.env.VITE_PUBLIC_APP_URL || "https://fameuxarte.com"),
  title: "Fameuxarte - Discover Authentic Artworks",
  description: "Discover and purchase unique artworks from talented artists worldwide. Browse our curated collection of paintings, sculptures, and digital art.",
  openGraph: {
    title: "Fameuxarte - Discover Authentic Artworks",
    description: "Discover and purchase unique artworks from talented artists worldwide.",
    images: ["/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fameuxarte - Discover Authentic Artworks",
    description: "Discover and purchase unique artworks from talented artists worldwide.",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

