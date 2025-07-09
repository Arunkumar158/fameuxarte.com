
import MainLayout from "@/components/layouts/MainLayout";

const Shipping = () => {
  return (
    <MainLayout>
      <div className="container py-12 md:py-16">
        <h1 className="text-4xl font-bold text-center mb-8">Shipping Policy</h1>
        <div className="max-w-3xl mx-auto prose dark:prose-invert">
          <h2>Delivery Times</h2>
          <p>
            We understand the excitement of receiving your new artwork. Here's what
            you can expect:
          </p>
          <ul>
            <li>Domestic (US): 3-5 business days</li>
            <li>International: 7-14 business days</li>
            <li>Express shipping options available at checkout</li>
          </ul>

          <h2>Shipping Costs</h2>
          <p>
            Shipping costs are calculated based on the size, weight, and
            destination of your artwork:
          </p>
          <ul>
            <li>Free shipping on orders over $1000 (US only)</li>
            <li>Standard domestic shipping: $25-75</li>
            <li>International shipping: Starting at $100</li>
          </ul>

          <h2>International Shipping</h2>
          <p>
            We ship worldwide! Please note that international orders may be subject
            to customs duties and taxes, which are the responsibility of the
            recipient.
          </p>

          <h2>Packaging</h2>
          <p>
            Your artwork is our priority. We use museum-grade materials and
            techniques to ensure safe delivery:
          </p>
          <ul>
            <li>Custom-sized art boxes</li>
            <li>Corner protection</li>
            <li>Acid-free materials</li>
            <li>Multiple layers of bubble wrap</li>
            <li>Weather-resistant packaging</li>
          </ul>

          <h2>Returns & Refunds</h2>
          <p>
            If you're not completely satisfied with your purchase, you can return
            it within 14 days of receipt. Please note:
          </p>
          <ul>
            <li>Artwork must be in original condition and packaging</li>
            <li>Return shipping costs are the buyer's responsibility</li>
            <li>Refunds are processed within 5-7 business days</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default Shipping;
