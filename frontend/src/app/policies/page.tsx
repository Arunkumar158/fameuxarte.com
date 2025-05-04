'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center">Legal Policies</h1>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="terms" className="bg-card rounded-lg shadow-sm">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <h2 className="text-2xl font-semibold">Terms of Use</h2>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 prose prose-sm max-w-none">
              <div className="space-y-4">
                <section>
                  <h3 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h3>
                  <p className="text-muted-foreground">
                    By accessing and using Fameuxarte, you agree to be bound by these Terms of Use and all applicable laws and regulations.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">2. User Responsibilities</h3>
                  <ul className="list-disc pl-6 text-muted-foreground">
                    <li>You must be at least 18 years old to use our services</li>
                    <li>You are responsible for maintaining the confidentiality of your account</li>
                    <li>You agree not to use the service for any illegal or unauthorized purpose</li>
                    <li>You must not violate any laws in your jurisdiction</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">3. Content Ownership</h3>
                  <p className="text-muted-foreground">
                    Artists retain ownership of their original artwork. By uploading content, you grant Fameuxarte a non-exclusive license to display and promote your artwork on our platform.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">4. Intellectual Property</h3>
                  <p className="text-muted-foreground">
                    All content and materials available on Fameuxarte, including but not limited to text, graphics, website name, code, images, and logos are the intellectual property of Fameuxarte.
                  </p>
                </section>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="privacy" className="bg-card rounded-lg shadow-sm">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <h2 className="text-2xl font-semibold">Privacy Policy</h2>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 prose prose-sm max-w-none">
              <div className="space-y-4">
                <section>
                  <h3 className="text-xl font-semibold mb-2">1. Data Collection</h3>
                  <p className="text-muted-foreground">
                    We collect information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground">
                    <li>Name and contact information</li>
                    <li>Payment and transaction information</li>
                    <li>Communication preferences</li>
                    <li>Browsing behavior and device information</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">2. Data Usage</h3>
                  <p className="text-muted-foreground">
                    We use your information to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground">
                    <li>Process your transactions</li>
                    <li>Provide customer support</li>
                    <li>Send promotional communications (with your consent)</li>
                    <li>Improve our services</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">3. Data Protection</h3>
                  <p className="text-muted-foreground">
                    We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage.
                  </p>
                </section>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="refund" className="bg-card rounded-lg shadow-sm">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <h2 className="text-2xl font-semibold">Refund Policy</h2>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 prose prose-sm max-w-none">
              <div className="space-y-4">
                <section>
                  <h3 className="text-xl font-semibold mb-2">1. Refund Eligibility</h3>
                  <p className="text-muted-foreground">
                    Refunds are available under the following circumstances:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground">
                    <li>Artwork arrives damaged</li>
                    <li>Artwork significantly differs from the description</li>
                    <li>Order was not received within 30 days of purchase</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">2. Refund Process</h3>
                  <p className="text-muted-foreground">
                    To request a refund:
                  </p>
                  <ol className="list-decimal pl-6 text-muted-foreground">
                    <li>Contact our support team within 7 days of receiving the artwork</li>
                    <li>Provide order number and reason for refund</li>
                    <li>Include photos if reporting damage</li>
                    <li>Wait for our team to review your request (typically 2-3 business days)</li>
                  </ol>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">3. Processing Time</h3>
                  <p className="text-muted-foreground">
                    Once approved, refunds will be processed within 5-10 business days. The time to receive the refund depends on your payment method:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground">
                    <li>Credit/Debit Cards: 5-7 business days</li>
                    <li>Bank Transfers: 3-5 business days</li>
                    <li>Digital Wallets: 1-2 business days</li>
                  </ul>
                </section>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>For any questions regarding our policies, please contact our support team.</p>
        </div>
      </div>
    </div>
  );
}