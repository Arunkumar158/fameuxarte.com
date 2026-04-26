import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import Blog from "@/components/Blog";
// import Brands from "@/components/Brands";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
// import Testimonials from "@/components/Testimonials";
import Video from "@/components/Video";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invest in Museum-Quality Contemporary Art | Exclusive Online Gallery | Fameuxarte",
  description: "Invest in original Indian contemporary art. Discover curated paintings, sculptures, and mixed media from India's best emerging artists. Global delivery available.",
  keywords: "contemporary art India, original paintings, art investment, modern sculptures, emerging artists",
  alternates: {
    canonical: 'https://fameuxarte.com',
  },
  openGraph: {
    type: "website",
    url: "https://fameuxarte.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Fameuxarte - Indian Contemporary Art Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://fameuxarte.com",
  },
};


export default function Home() {
  return (
    <>
      <ScrollUp />
      <Hero />
      <Features />
      <Video />
      {/* <Brands /> */}
      <AboutSectionOne />
      <AboutSectionTwo />
      {/* <Testimonials /> */}
      <Pricing />
      <Blog />
      <Contact />
    </>
  );
}
