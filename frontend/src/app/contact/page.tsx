import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Connect with Fameuxarte Art Gallery",
  description: "Get in touch with Fameuxarte for art inquiries, artist collaborations, or corporate art solutions. Our team is here to help you navigate the contemporary art world.",
  alternates: {
    canonical: 'https://fameuxarte.com/contact',
  },
};

const ContactPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Contact Page"
        description="Have questions about a specific artwork or interested in a collaboration? Reach out to us, and let's start a conversation about art."
      />

      <Contact />
    </>
  );
};

export default ContactPage;
