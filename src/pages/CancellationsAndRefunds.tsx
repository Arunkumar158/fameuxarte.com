
import React from "react";

const CancellationsAndRefunds = () => (
  <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <h1 className="text-4xl font-bold text-center mb-8">Fameuxarte – Cancellations & Refunds</h1>
    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">Order Cancellations</h2>
      <p>Orders can be cancelled within <strong>12 hours</strong> of placing the order, provided it hasn’t been shipped.</p>
      <p className="mt-2">To cancel, please email us at <a href="mailto:fameuxarte@gmail.com" className="text-brand-red underline">fameuxarte@gmail.com</a> or use our <a href="/contact" className="text-brand-red underline">contact form</a>.</p>
    </section>
    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">Refunds</h2>
      <p>Refunds will be issued if the artwork is <strong>damaged on delivery</strong>, or if it <strong>never arrives</strong>.</p>
      <p className="mt-2">Refunds are processed via <strong>Razorpay</strong> and will reflect in your original payment method within <strong>7–10 business days</strong>. All ownership confirmation is handled securely.</p>
      <p className="mt-2">Please contact us within <strong>48 hours of delivery</strong> for any refund or damage claims (with photo proof).</p>
    </section>
    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">Non-Refundable Items</h2>
      <p>Custom artworks, commissioned pieces, and framed paintings are <strong>non-refundable</strong> unless damaged.</p>
    </section>
    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">Delivery Delays</h2>
      <p>If your artwork is delayed by more than <strong>15 business days</strong>, you may be eligible for a partial refund.</p>
    </section>
    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
      <p>For any refund/cancellation queries, reach us at <a href="mailto:fameuxarte@gmail.com" className="text-brand-red underline">fameuxarte@gmail.com</a> or call <a href="tel:+918921487385" className="text-brand-red underline">+91-8921487385</a>.</p>
    </section>
  </div>
);

export default CancellationsAndRefunds;
