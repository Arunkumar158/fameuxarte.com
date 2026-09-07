/**
 * templates/orders/order-confirmation.ts
 * Order confirmation email — sent to buyer after successful payment
 */

import type {
  TemplateDefinition, OrderConfirmationEmailVars, OrderArtworkLineItem, ValidationResult
} from '../../types.ts';
import {
  EmailLayout, EmailCard, EmailHeading, EmailText, EmailButton,
  EmailDivider, EmailInfoRow, EmailPreheader, EmailAccentBar, EmailLabel,
  EmailArtworkCard, EmailOrderSummary, EmailStatusBadge, EmailSupportBox,
  escHtml, BRAND,
} from '../../design-system.ts';

function validate(vars: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!vars.customer_name || typeof vars.customer_name !== 'string') errors.push('customer_name is required');
  if (!vars.order_number || typeof vars.order_number !== 'string') errors.push('order_number is required');
  if (!vars.order_date || typeof vars.order_date !== 'string') errors.push('order_date is required');
  if (!vars.order_url || typeof vars.order_url !== 'string') errors.push('order_url is required');
  if (!vars.order_total || typeof vars.order_total !== 'string') errors.push('order_total is required');
  if (!vars.subtotal || typeof vars.subtotal !== 'string') errors.push('subtotal is required');
  if (!vars.shipping_fee || typeof vars.shipping_fee !== 'string') errors.push('shipping_fee is required');
  if (!vars.artworks || !Array.isArray(vars.artworks) || vars.artworks.length === 0) errors.push('artworks is required and must be a non-empty array');
  if (!vars.shipping_address || typeof vars.shipping_address !== 'string') errors.push('shipping_address is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as OrderConfirmationEmailVars;
  const firstName = v.customer_name.split(' ')[0];
  const artworksHtml = (v.artworks as OrderArtworkLineItem[]).map(a =>
    EmailArtworkCard({
      title:    a.artwork_title,
      artist:   a.artist_name,
      price:    a.price,
      imageUrl: a.image_url,
      quantity: a.quantity,
    })
  ).join('');

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`Order confirmed! Your order #${v.order_number} from Fameuxarte has been placed.`)}
    <div style="margin-bottom:16px;">
      ${EmailStatusBadge('Order Confirmed', 'success')}
    </div>
    ${EmailHeading(`Thank you, ${escHtml(firstName)}.`)}
    ${EmailText(`Your order has been confirmed and is now being prepared by the artist. You will receive an email when your artwork ships.`)}
    ${EmailDivider()}
    ${EmailLabel('Order Details')}
    ${EmailInfoRow('Order Number', `#${v.order_number}`)}
    ${EmailInfoRow('Order Date', v.order_date)}
    ${EmailInfoRow('Payment Status', v.payment_status)}
    ${EmailDivider()}
    ${EmailLabel('Artworks')}
    ${artworksHtml}
    ${EmailOrderSummary({ subtotal: v.subtotal, shippingFee: v.shipping_fee, total: v.order_total })}
    ${EmailDivider()}
    ${EmailLabel('Shipping Address')}
    ${EmailText(escHtml(v.shipping_address).replace(/\n/g, '<br>'), { muted: true })}
    ${EmailButton('View Order', v.order_url)}
    ${EmailText(`Each artwork comes with a digital Certificate of Authenticity verifiable at fameuxarte.com.`, { small: true, muted: true })}
    ${EmailSupportBox()}
  `);

  return EmailLayout(content, `Order Confirmed — #${v.order_number}`);
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as OrderConfirmationEmailVars;
  const firstName = v.customer_name.split(' ')[0];
  const artworksList = (v.artworks as OrderArtworkLineItem[])
    .map(a => `  - "${a.artwork_title}" by ${a.artist_name} (${a.price})`)
    .join('\n');

  return `Thank you, ${firstName}!

Your order has been confirmed.

Order Number: #${v.order_number}
Order Date: ${v.order_date}
Payment: ${v.payment_status}

Artworks:
${artworksList}

Subtotal: ${v.subtotal}
Shipping: ${v.shipping_fee}
Total: ${v.order_total}

Shipping to:
${v.shipping_address}

Track your order: ${v.order_url}

Each artwork comes with a Certificate of Authenticity.

Need help? https://fameuxarte.com/collector/support

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const orderConfirmationTemplate: TemplateDefinition = {
  type: 'order_confirmation',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'Order confirmed — Fameuxarte',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
