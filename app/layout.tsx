import type { Metadata, Viewport } from "next";
import "@/index.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || process.env.VITE_PUBLIC_APP_URL || "https://fameuxarte.com"),
  title: "Fameuxarte - Discover Authentic Artworks",
  description: "Discover and purchase unique artworks from talented artists worldwide. Browse our curated collection of paintings, sculptures, and digital art.",
  authors: [
    { name: "Arun Kumar", url: "https://www.fameuxarte.com/our-story" },
    { name: "Praveen Krishnan", url: "https://www.fameuxarte.com/our-story" },
    { name: "Fameuxarte" }
  ],
  keywords: ["art marketplace", "original artwork", "paintings", "sculptures", "digital art", "Arun Kumar", "Praveen Krishnan", "Fameuxarte founders"],
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
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-4DMQ6G8337" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-4DMQ6G8337');
            `,
          }}
        />
        <meta name="msvalidate.01" content="A832E1D458E5C3D47E73A6CB8F2ED7F6" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

