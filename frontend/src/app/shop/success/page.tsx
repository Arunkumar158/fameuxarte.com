export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Thank You!</h1>
        <p className="text-muted-foreground mb-6">
          Your order has been successfully placed. We'll send you an email with the order details.
        </p>
        <a
          href="/shop"
          className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Continue Shopping
        </a>
      </div>
    </div>
  );
}