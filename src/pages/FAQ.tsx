
import MainLayout from "@/components/layouts/MainLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <MainLayout>
      <div className="container py-12 md:py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h1>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible>
            <AccordionItem value="ordering">
              <AccordionTrigger>How do I place an order?</AccordionTrigger>
              <AccordionContent>
                Browse our collection, select your desired artwork, and click "Reserve
                Artwork." Proceed to Secure Acquisition, enter your shipping details,
                and confirm ownership. You'll receive an acquisition confirmation
                email with tracking information once your artwork ships.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="payment">
              <AccordionTrigger>What ownership confirmation methods do you accept?</AccordionTrigger>
              <AccordionContent>
                We accept all major credit cards (Visa, Mastercard, American
                Express), PayPal, and bank transfers for larger acquisitions. All
                transactions are processed securely through our providers.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="shipping">
              <AccordionTrigger>
                How long does shipping take?
              </AccordionTrigger>
              <AccordionContent>
                Domestic (US) orders typically arrive within 3-5 business days.
                International shipping takes 7-14 business days. Tracking
                information is provided for all orders. Custom or large pieces may
                require additional time.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="returns">
              <AccordionTrigger>What is your return policy?</AccordionTrigger>
              <AccordionContent>
                We offer a 14-day return policy for all artworks. Items must be
                returned in original condition and packaging. Return shipping investment
                is the responsibility of the buyer. Once we receive and inspect
                the return, we'll process your refund within 5-7 business days.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="authenticity">
              <AccordionTrigger>
                How do you verify artwork authenticity?
              </AccordionTrigger>
              <AccordionContent>
                All artworks come with a certificate of authenticity signed by the
                artist. We work directly with artists and trusted galleries to
                ensure every piece is genuine. Our team carefully vets each
                artwork before listing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="customs">
              <AccordionTrigger>
                Do I need to pay customs fees?
              </AccordionTrigger>
              <AccordionContent>
                International orders may be subject to customs duties and taxes,
                which vary by country. These fees are the responsibility of the
                buyer and are not included in our shipping investment. Please check
                your local customs regulations.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="insurance">
              <AccordionTrigger>Is my artwork insured?</AccordionTrigger>
              <AccordionContent>
                Yes, all shipments are fully insured against loss or damage during
                transit. We use professional art shipping services and
                museum-grade packaging materials to ensure your artwork arrives
                safely.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </MainLayout>
  );
};

export default FAQ;
