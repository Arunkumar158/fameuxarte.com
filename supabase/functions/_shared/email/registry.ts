/**
 * email/registry.ts
 * Fameuxarte Email Template Registry
 *
 * Central registry of all email templates.
 * To add a new template:
 *   1. Create the template file in templates/<category>/<name>.ts
 *   2. Import and register it here
 *
 * See docs/email-system.md §3 for full guide.
 */

import type { EmailType, TemplateDefinition } from './types.ts';

// Auth
import { welcomeTemplate } from './templates/auth/welcome.ts';
import { loginAlertTemplate } from './templates/auth/login-alert.ts';

// Artists
import { artistApplicationReceivedTemplate } from './templates/artists/artist-application-received.ts';
import { artistVerificationApprovedTemplate } from './templates/artists/artist-verification-approved.ts';
import { artistVerificationRejectedTemplate } from './templates/artists/artist-verification-rejected.ts';
import { artworkSubmittedTemplate } from './templates/artists/artwork-submitted.ts';
import { artworkSoldTemplate } from './templates/artists/artwork-sold.ts';

// Orders
import { orderConfirmationTemplate } from './templates/orders/order-confirmation.ts';
import { orderShippedTemplate } from './templates/orders/order-shipped.ts';
import { orderDeliveredTemplate } from './templates/orders/order-delivered.ts';
import { orderCancelledTemplate } from './templates/orders/order-cancelled.ts';

// Payments
import { paymentSuccessTemplate } from './templates/payments/payment-success.ts';
import { paymentFailedTemplate } from './templates/payments/payment-failed.ts';
import { refundInitiatedTemplate } from './templates/payments/refund-initiated.ts';
import { refundCompletedTemplate } from './templates/payments/refund-completed.ts';

// Certificates
import { certificateGeneratedTemplate } from './templates/certificates/certificate-generated.ts';

// Support
import { supportTicketCreatedTemplate } from './templates/support/support-ticket-created.ts';
import { supportReplyTemplate } from './templates/support/support-reply.ts';
import { supportTicketResolvedTemplate } from './templates/support/support-ticket-resolved.ts';

// Marketing
import { newsletterTemplate } from './templates/marketing/newsletter.ts';

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const registry = new Map<EmailType, TemplateDefinition>([
  // Auth
  ['welcome',                         welcomeTemplate],
  ['login_alert',                     loginAlertTemplate],

  // Artists
  ['artist_application_received',     artistApplicationReceivedTemplate],
  ['artist_verification_approved',    artistVerificationApprovedTemplate],
  ['artist_verification_rejected',    artistVerificationRejectedTemplate],
  ['artwork_submitted',               artworkSubmittedTemplate],
  ['artwork_sold',                    artworkSoldTemplate],

  // Orders
  ['order_confirmation',              orderConfirmationTemplate],
  ['order_shipped',                   orderShippedTemplate],
  ['order_delivered',                 orderDeliveredTemplate],
  ['order_cancelled',                 orderCancelledTemplate],

  // Payments
  ['payment_success',                 paymentSuccessTemplate],
  ['payment_failed',                  paymentFailedTemplate],
  ['refund_initiated',                refundInitiatedTemplate],
  ['refund_completed',                refundCompletedTemplate],

  // Certificates
  ['certificate_generated',           certificateGeneratedTemplate],

  // Support
  ['support_ticket_created',          supportTicketCreatedTemplate],
  ['support_reply',                   supportReplyTemplate],
  ['support_ticket_resolved',         supportTicketResolvedTemplate],

  // Marketing
  ['newsletter',                      newsletterTemplate],
]);

export function getTemplate(type: EmailType): TemplateDefinition | undefined {
  return registry.get(type);
}

export function getAllTemplates(): TemplateDefinition[] {
  return Array.from(registry.values());
}

export function getTemplateTypes(): EmailType[] {
  return Array.from(registry.keys());
}

/** Returns safe sample variables for testing any registered template */
export function getTestVariables(type: EmailType): Record<string, unknown> {
  const sampleVars: Record<EmailType, Record<string, unknown>> = {
    welcome: {
      customer_name: 'Ananya Krishnamurthy',
      explore_url: 'https://fameuxarte.com/artworks',
    },
    login_alert: {
      customer_name: 'Ananya Krishnamurthy',
      login_time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      login_device: 'Chrome on macOS',
      account_url: 'https://fameuxarte.com/collector/settings',
    },
    artist_application_received: {
      artist_name: 'Rajesh Mehta',
      dashboard_url: 'https://fameuxarte.com/artist/verification',
    },
    artist_verification_approved: {
      artist_name: 'Rajesh Mehta',
      dashboard_url: 'https://fameuxarte.com/artist',
    },
    artist_verification_rejected: {
      artist_name: 'Rajesh Mehta',
      reason: 'The provided identity document was not legible. Please resubmit a clear, high-resolution scan.',
      action_required: 'Resubmit a clear photograph or scan of your government-issued photo ID.',
      dashboard_url: 'https://fameuxarte.com/artist/verification',
    },
    artwork_submitted: {
      artist_name: 'Rajesh Mehta',
      artwork_title: 'Golden Hour at Banaras',
      submitted_at: new Date().toLocaleDateString('en-IN'),
      dashboard_url: 'https://fameuxarte.com/artist/artworks',
    },
    artwork_approved: {
      artist_name: 'Rajesh Mehta',
      artwork_title: 'Golden Hour at Banaras',
      artwork_url: 'https://fameuxarte.com/artworks/golden-hour-at-banaras',
      artwork_image_url: '',
    },
    artwork_rejected: {
      artist_name: 'Rajesh Mehta',
      artwork_title: 'Golden Hour at Banaras',
      reason: 'The image quality does not meet our minimum resolution requirements.',
      required_changes: 'Please resubmit with a high-resolution photograph (minimum 2000px on the longest edge).',
      dashboard_url: 'https://fameuxarte.com/artist/artworks',
    },
    artwork_sold: {
      artist_name: 'Rajesh Mehta',
      artwork_title: 'Golden Hour at Banaras',
      order_reference: 'FA-2024-001234',
      sale_amount: '₹18,500',
      dashboard_url: 'https://fameuxarte.com/artist/orders',
    },
    order_confirmation: {
      customer_name: 'Ananya Krishnamurthy',
      order_number: 'FA2024001234',
      order_date: new Date().toLocaleDateString('en-IN'),
      order_url: 'https://fameuxarte.com/collector/orders',
      order_total: '₹18,500',
      subtotal: '₹18,000',
      shipping_fee: '₹500',
      payment_status: 'Paid',
      artworks: [
        {
          artwork_title: 'Golden Hour at Banaras',
          artist_name: 'Rajesh Mehta',
          quantity: 1,
          price: '₹18,000',
          image_url: '',
        }
      ],
      shipping_address: '12 Koramangala 4th Block\nBengaluru, Karnataka 560034\nIndia',
    },
    order_processing: {
      customer_name: 'Ananya Krishnamurthy',
      order_number: 'FA2024001234',
      order_url: 'https://fameuxarte.com/collector/orders',
    },
    order_shipped: {
      customer_name: 'Ananya Krishnamurthy',
      order_number: 'FA2024001234',
      artwork_title: 'Golden Hour at Banaras',
      carrier: 'DTDC',
      tracking_number: 'DTDC123456789IN',
      tracking_url: 'https://dtdc.in/trace.asp',
      estimated_delivery: '7-10 business days',
      order_url: 'https://fameuxarte.com/collector/orders',
    },
    order_delivered: {
      customer_name: 'Ananya Krishnamurthy',
      order_number: 'FA2024001234',
      artwork_title: 'Golden Hour at Banaras',
      delivered_at: new Date().toLocaleDateString('en-IN'),
      order_url: 'https://fameuxarte.com/collector/orders',
    },
    order_cancelled: {
      customer_name: 'Ananya Krishnamurthy',
      order_number: 'FA2024001234',
      cancellation_reason: 'Artwork unavailable',
      refund_info: 'A full refund of ₹18,500 will be processed within 5-7 business days.',
      support_url: 'https://fameuxarte.com/collector/support',
    },
    payment_success: {
      customer_name: 'Ananya Krishnamurthy',
      order_number: 'FA2024001234',
      amount_paid: '₹18,500',
      payment_date: new Date().toLocaleDateString('en-IN'),
      order_url: 'https://fameuxarte.com/collector/orders',
    },
    payment_failed: {
      customer_name: 'Ananya Krishnamurthy',
      order_number: 'FA2024001234',
      retry_url: 'https://fameuxarte.com/checkout',
      support_url: 'https://fameuxarte.com/collector/support',
    },
    refund_initiated: {
      customer_name: 'Ananya Krishnamurthy',
      order_number: 'FA2024001234',
      refund_amount: '₹18,500',
      initiated_at: new Date().toLocaleDateString('en-IN'),
      expected_processing: '5-7 business days',
      support_url: 'https://fameuxarte.com/collector/support',
    },
    refund_completed: {
      customer_name: 'Ananya Krishnamurthy',
      order_number: 'FA2024001234',
      refund_amount: '₹18,500',
      completed_at: new Date().toLocaleDateString('en-IN'),
      order_url: 'https://fameuxarte.com/collector/orders',
    },
    certificate_generated: {
      customer_name: 'Ananya Krishnamurthy',
      artwork_title: 'Golden Hour at Banaras',
      artist_name: 'Rajesh Mehta',
      certificate_number: 'FA-CERT-2024-001234',
      certificate_url: 'https://fameuxarte.com/collector/certificates',
      issued_at: new Date().toLocaleDateString('en-IN'),
      verification_url: 'https://fameuxarte.com/verify/FA-CERT-2024-001234',
    },
    support_ticket_created: {
      customer_name: 'Ananya Krishnamurthy',
      ticket_number: 'TKT-2024-001',
      ticket_subject: 'Artwork damaged in transit',
      ticket_category: 'ORDER',
      created_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      ticket_url: 'https://fameuxarte.com/collector/support',
    },
    support_reply: {
      customer_name: 'Ananya Krishnamurthy',
      ticket_number: 'TKT-2024-001',
      ticket_subject: 'Artwork damaged in transit',
      reply_preview: 'Thank you for reaching out. We are sorry to hear about the damage. Please could you send us clear photos of the damage so we can process a claim with the carrier...',
      ticket_url: 'https://fameuxarte.com/collector/support',
    },
    support_ticket_resolved: {
      customer_name: 'Ananya Krishnamurthy',
      ticket_number: 'TKT-2024-001',
      ticket_subject: 'Artwork damaged in transit',
      resolution_summary: 'A full replacement has been arranged and a new artwork will be dispatched within 3 business days.',
      ticket_url: 'https://fameuxarte.com/collector/support',
    },
    newsletter: {
      customer_name: 'Ananya Krishnamurthy',
      content_html: `<h2 style="color:#fafaf9;font-family:sans-serif;margin:0 0 16px 0;">New Arrivals This Week</h2>
        <p style="color:#a8a29e;font-family:sans-serif;font-size:15px;line-height:1.6;margin:0 0 16px 0;">
          Discover five extraordinary new artworks from emerging Indian artists — from bold abstracts to delicate watercolours.
        </p>`,
      unsubscribe_url: 'https://fameuxarte.com/unsubscribe?token=TEST_TOKEN',
    },
    new_collection: {
      customer_name: 'Ananya Krishnamurthy',
      content_html: '<p>New collection placeholder</p>',
      unsubscribe_url: 'https://fameuxarte.com/unsubscribe?token=TEST_TOKEN',
    },
    artist_spotlight: {
      customer_name: 'Ananya Krishnamurthy',
      content_html: '<p>Artist spotlight placeholder</p>',
      unsubscribe_url: 'https://fameuxarte.com/unsubscribe?token=TEST_TOKEN',
    },
  };

  return sampleVars[type] ?? {};
}
