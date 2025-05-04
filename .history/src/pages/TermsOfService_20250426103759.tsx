import MainLayout from "@/components/layouts/MainLayout";
import { SEO } from "@/components/SEO";

const TermsOfService = () => {
  return (
    <MainLayout>
      <SEO
        title="Terms of Service - Gallery Canvas Commerce"
        description="Read our terms and conditions for using our platform and services."
        canonicalUrl="/terms-of-service"
      />
      <div className="container py-12 md:py-16">
        <h1 className="text-4xl font-bold text-center mb-8">Terms of Service</h1>
        <div className="max-w-3xl mx-auto space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300">
              By accessing and using Gallery Canvas Commerce, you agree to be bound by these Terms of Service and all applicable laws and regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
            <p className="text-gray-300">
              To use certain features of our platform, you must create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Purchases and Payments</h2>
            <p className="text-gray-300">
              All purchases are subject to:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-300">
              <li>Product availability</li>
              <li>Accurate pricing information</li>
              <li>Valid payment method</li>
              <li>Successful payment processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
            <p className="text-gray-300">
              All content on our platform, including artwork, text, graphics, logos, and software, is the property of Gallery Canvas Commerce or its content suppliers and is protected by international copyright laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. User Conduct</h2>
            <p className="text-gray-300">
              Users agree not to:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-300">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious software</li>
              <li>Engage in fraudulent activities</li>
              <li>Harass other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-300">
              Gallery Canvas Commerce shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
            <p className="text-gray-300">
              We reserve the right to modify these terms at any time. Your continued use of the platform following any changes indicates your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
            <p className="text-gray-300">
              For questions about these Terms of Service, please contact us at legal@gallerycanvas.com
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default TermsOfService; 