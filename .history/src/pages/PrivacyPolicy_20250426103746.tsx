import MainLayout from "@/components/layouts/MainLayout";
import { SEO } from "@/components/SEO";

const PrivacyPolicy = () => {
  return (
    <MainLayout>
      <SEO
        title="Privacy Policy - Gallery Canvas Commerce"
        description="Learn about how we collect, use, and protect your personal information."
        canonicalUrl="/privacy-policy"
      />
      <div className="container py-12 md:py-16">
        <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
        <div className="max-w-3xl mx-auto space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-300">
              Welcome to Gallery Canvas Commerce's Privacy Policy. This document outlines how we collect, use, and protect your personal information when you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="text-gray-300">
              We collect various types of information, including:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-300">
              <li>Personal identification information (name, email, address)</li>
              <li>Payment information</li>
              <li>Browsing behavior and preferences</li>
              <li>Device and usage information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-300">
              Your information is used to:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-300">
              <li>Process your orders and payments</li>
              <li>Provide customer support</li>
              <li>Improve our services</li>
              <li>Send you updates and marketing communications (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Protection</h2>
            <p className="text-gray-300">
              We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p className="text-gray-300">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-300">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to data processing</li>
              <li>Withdraw consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
            <p className="text-gray-300">
              If you have any questions about this Privacy Policy, please contact us at privacy@gallerycanvas.com
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicy; 