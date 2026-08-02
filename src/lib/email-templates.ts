export const getEmailBaseTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0c0a09; /* Obsidian */
      color: #fafaf9; /* Linen */
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      font-size: 24px;
      font-weight: 300;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #fafaf9;
      text-decoration: none;
    }
    .card {
      background-color: #1c1917; /* Surface-2 */
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 32px;
    }
    .h1 {
      font-size: 24px;
      font-weight: 500;
      margin-top: 0;
      margin-bottom: 24px;
      color: #fafaf9;
    }
    .p {
      font-size: 15px;
      line-height: 1.6;
      color: #a8a29e; /* Stone */
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      background-color: #fafaf9;
      color: #0c0a09;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      margin-top: 16px;
      margin-bottom: 24px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 13px;
      color: #78716c;
    }
    .divider {
      height: 1px;
      background-color: rgba(255, 255, 255, 0.1);
      margin: 24px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 14px;
    }
    .info-label {
      color: #a8a29e;
    }
    .info-value {
      color: #fafaf9;
      font-weight: 500;
    }
    .tracking-link {
      color: #D4AF37; /* Gold */
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://fameuxarte.com" class="logo">Fameuxarte</a>
    </div>
    <div class="card">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Fameuxarte. All rights reserved.</p>
      <p>The Global Destination for Fine Art.</p>
    </div>
  </div>
</body>
</html>
`;

export const templates = {
  orderConfirmation: (orderId: string, artworkTitle: string, amount: string) => getEmailBaseTemplate(`
    <h1 class="h1">Acquisition Confirmed</h1>
    <p class="p">Thank you for your acquisition. We've notified the artist and they are preparing your artwork for shipment.</p>
    <div class="divider"></div>
    <div class="info-row">
      <span class="info-label">Order Reference</span>
      <span class="info-value">#${orderId.slice(0, 8).toUpperCase()}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Artwork</span>
      <span class="info-value">${artworkTitle}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Investment</span>
      <span class="info-value">${amount}</span>
    </div>
    <div class="divider"></div>
    <p class="p">You can track the fulfillment status in your collection dashboard.</p>
    <a href="https://fameuxarte.com/account" class="btn">View Order</a>
  `, 'Order Confirmation - Fameuxarte'),

  artistNewOrder: (orderId: string, artworkTitle: string, collectorName: string) => getEmailBaseTemplate(`
    <h1 class="h1">New Acquisition!</h1>
    <p class="p">Congratulations! <strong>${collectorName}</strong> has acquired <strong>${artworkTitle}</strong>.</p>
    <p class="p">Please visit your Artist Dashboard to accept the order and begin the fulfillment process.</p>
    <a href="https://fameuxarte.com/artist/orders" class="btn">Manage Order</a>
  `, 'New Acquisition - Fameuxarte'),

  shippingConfirmation: (artworkTitle: string, courier: string, trackingNumber: string, trackingUrl?: string) => getEmailBaseTemplate(`
    <h1 class="h1">Your Artwork is on the way</h1>
    <p class="p">The artist has packed and shipped <strong>${artworkTitle}</strong>.</p>
    <div class="divider"></div>
    <div class="info-row">
      <span class="info-label">Courier</span>
      <span class="info-value">${courier}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Tracking Number</span>
      <span class="info-value">${trackingNumber}</span>
    </div>
    ${trackingUrl ? `<p class="p"><br/><a href="${trackingUrl}" class="tracking-link">Track your shipment &rarr;</a></p>` : ''}
    <div class="divider"></div>
    <a href="https://fameuxarte.com/account" class="btn">View Details</a>
  `, 'Artwork Shipped - Fameuxarte'),

  deliveryConfirmation: (artworkTitle: string) => getEmailBaseTemplate(`
    <h1 class="h1">Delivery Confirmed</h1>
    <p class="p">Your acquisition of <strong>${artworkTitle}</strong> has been marked as delivered.</p>
    <p class="p">We hope this piece brings inspiration to your space. If you have any concerns, please contact our support team.</p>
    <a href="https://fameuxarte.com/account" class="btn">View Collection</a>
  `, 'Artwork Delivered - Fameuxarte'),
  
  founderNewOrder: (orderId: string, amount: string) => getEmailBaseTemplate(`
    <h1 class="h1">New Platform Sale</h1>
    <p class="p">A new order has been placed on the marketplace.</p>
    <div class="info-row">
      <span class="info-label">Order Reference</span>
      <span class="info-value">#${orderId.slice(0, 8).toUpperCase()}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Amount</span>
      <span class="info-value">${amount}</span>
    </div>
    <a href="https://fameuxarte.com/admin/orders" class="btn">View Dashboard</a>
  `, 'Marketplace Sale - Fameuxarte')
};
