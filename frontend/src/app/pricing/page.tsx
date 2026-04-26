// src/app/pricing/page.tsx
import { Metadata } from 'next';
import Breadcrumb from "@/components/Common/Breadcrumb";
import Pricing from "../../components/Pricing";

export const metadata: Metadata = {
  title: 'Art Investment Pricing & Collector Plans | Fameuxarte',
  description: 'View Fameuxarte pricing plans for art collectors and investors. Flexible options to acquire authenticated, investment-grade Indian contemporary artworks.',
  alternates: {
    canonical: 'https://fameuxarte.com/pricing',
  },
};

const PricingPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Pricing Plans"
        description="Choose a plan that fits your art collection goals. Whether you are an emerging artist or a seasoned collector, we have options to help you thrive in the contemporary art world."
      />
      <Pricing />
    </>
  );
};

export default PricingPage;