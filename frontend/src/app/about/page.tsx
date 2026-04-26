import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import Breadcrumb from "@/components/Common/Breadcrumb";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Fameuxarte | Curating Indian Contemporary Art",
  description: "Learn about Fameuxarte's mission to foster artistic innovation and connect art lovers with original, authenticated works by India's emerging contemporary artists.",
  alternates: {
    canonical: 'https://fameuxarte.com/about',
  },
};

const AboutPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="About Fameuxarte"
        description="FameuxArte is dedicated to fostering artistic innovation and appreciation. We provide a platform for both emerging and established artists to share their unique perspectives through a curated selection of original artwork. Our mission is to connect art lovers with pieces that resonate and inspire."
      />
      <AboutSectionOne />
      <AboutSectionTwo />
    </>
  );
};

export default AboutPage;
