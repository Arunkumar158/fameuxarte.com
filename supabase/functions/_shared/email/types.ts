/**
 * email/types.ts
 * Fameuxarte Email System — Typed Template Contracts
 *
 * Every email template has an explicit TypeScript contract.
 * Raw database rows are NEVER passed directly into templates.
 * Only the minimum required data is accepted.
 *
 * Deno-compatible — no Node.js imports.
 */

// ---------------------------------------------------------------------------
// Template Keys
// ---------------------------------------------------------------------------

export type EmailType =
  // Auth
  | 'welcome'
  | 'login_alert'
  // Artists
  | 'artist_application_received'
  | 'artist_verification_approved'
  | 'artist_verification_rejected'
  | 'artwork_submitted'
  | 'artwork_approved'
  | 'artwork_rejected'
  | 'artwork_sold'
  // Orders
  | 'order_confirmation'
  | 'order_processing'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  // Payments
  | 'payment_success'
  | 'payment_failed'
  | 'refund_initiated'
  | 'refund_completed'
  // Certificates
  | 'certificate_generated'
  // Support
  | 'support_ticket_created'
  | 'support_reply'
  | 'support_ticket_resolved'
  // Marketing (consent required)
  | 'newsletter'
  | 'new_collection'
  | 'artist_spotlight';

export type EmailCategory = 'transactional' | 'marketing';

export type EmailStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'bounced'
  | 'complained'
  | 'failed'
  | 'cancelled';

// ---------------------------------------------------------------------------
// Common Variable Shapes
// ---------------------------------------------------------------------------

export interface CustomerVars {
  customer_name: string;
  customer_email: string;
}

export interface ArtistVars {
  artist_name: string;
  artist_id: string;
  artist_dashboard_url: string;
}

export interface ArtworkVars {
  artwork_id: string;
  artwork_title: string;
  artwork_url: string;
  artwork_image_url?: string;   // Optional — might not have image
  artist_name: string;
  artwork_price?: string;       // Formatted price string e.g. "₹12,500"
}

export interface OrderVars {
  order_id: string;
  order_number: string;         // Short display ID e.g. "ABC12345"
  order_date: string;           // Formatted date string
  order_url: string;
  order_total: string;          // Formatted e.g. "₹25,000"
  shipping_address?: string;    // Formatted address string
}

export interface ShippingVars {
  tracking_number: string;
  tracking_url?: string;
  carrier: string;
  estimated_delivery?: string;
}

export interface CertificateVars {
  certificate_number: string;
  certificate_url: string;
  issued_at: string;
}

export interface SupportTicketVars {
  ticket_number: string;
  ticket_subject: string;
  ticket_url: string;
}

// ---------------------------------------------------------------------------
// Per-Template Variable Contracts
// ---------------------------------------------------------------------------

export interface WelcomeEmailVars {
  customer_name: string;
  explore_url: string;
}

export interface LoginAlertEmailVars {
  customer_name: string;
  login_time: string;
  login_device?: string;
  account_url: string;
}

export interface ArtistApplicationReceivedEmailVars {
  artist_name: string;
  dashboard_url: string;
}

export interface ArtistVerificationApprovedEmailVars {
  artist_name: string;
  dashboard_url: string;
}

export interface ArtistVerificationRejectedEmailVars {
  artist_name: string;
  reason: string;
  action_required: string;
  dashboard_url: string;
}

export interface ArtworkSubmittedEmailVars {
  artist_name: string;
  artwork_title: string;
  submitted_at: string;
  dashboard_url: string;
}

export interface ArtworkApprovedEmailVars {
  artist_name: string;
  artwork_title: string;
  artwork_url: string;
  artwork_image_url?: string;
}

export interface ArtworkRejectedEmailVars {
  artist_name: string;
  artwork_title: string;
  reason: string;
  required_changes: string;
  dashboard_url: string;
}

export interface ArtworkSoldEmailVars {
  artist_name: string;
  artwork_title: string;
  artwork_image_url?: string;
  order_reference: string;
  sale_amount: string;
  dashboard_url: string;
}

export interface OrderConfirmationEmailVars {
  customer_name: string;
  order_number: string;
  order_date: string;
  order_url: string;
  order_total: string;
  subtotal: string;
  shipping_fee: string;
  artworks: OrderArtworkLineItem[];
  shipping_address: string;
  payment_status: string;
}

export interface OrderArtworkLineItem {
  artwork_title: string;
  artist_name: string;
  quantity: number;
  price: string;
  image_url?: string;
}

export interface OrderShippedEmailVars {
  customer_name: string;
  order_number: string;
  artwork_title: string;
  carrier: string;
  tracking_number: string;
  tracking_url?: string;
  estimated_delivery?: string;
  order_url: string;
}

export interface OrderDeliveredEmailVars {
  customer_name: string;
  order_number: string;
  artwork_title: string;
  delivered_at: string;
  order_url: string;
}

export interface OrderCancelledEmailVars {
  customer_name: string;
  order_number: string;
  cancellation_reason?: string;
  refund_info?: string;
  support_url: string;
}

export interface PaymentSuccessEmailVars {
  customer_name: string;
  order_number: string;
  amount_paid: string;
  payment_date: string;
  order_url: string;
}

export interface PaymentFailedEmailVars {
  customer_name: string;
  order_number: string;
  retry_url: string;
  support_url: string;
}

export interface RefundInitiatedEmailVars {
  customer_name: string;
  order_number: string;
  refund_amount: string;
  initiated_at: string;
  expected_processing: string;
  support_url: string;
}

export interface RefundCompletedEmailVars {
  customer_name: string;
  order_number: string;
  refund_amount: string;
  completed_at: string;
  order_url: string;
}

export interface CertificateGeneratedEmailVars {
  customer_name: string;
  artwork_title: string;
  artist_name: string;
  certificate_number: string;
  certificate_url: string;
  issued_at: string;
  verification_url: string;
}

export interface SupportTicketCreatedEmailVars {
  customer_name: string;
  ticket_number: string;
  ticket_subject: string;
  ticket_category: string;
  created_at: string;
  ticket_url: string;
}

export interface SupportReplyEmailVars {
  customer_name: string;
  ticket_number: string;
  ticket_subject: string;
  reply_preview: string;        // First ~200 chars of reply — not full conversation
  ticket_url: string;
}

export interface SupportTicketResolvedEmailVars {
  customer_name: string;
  ticket_number: string;
  ticket_subject: string;
  resolution_summary?: string;
  ticket_url: string;
}

export interface NewsletterEmailVars {
  customer_name: string;
  content_html: string;         // Pre-rendered newsletter body
  unsubscribe_url: string;      // REQUIRED for marketing
}

// ---------------------------------------------------------------------------
// Template Registry Entry
// ---------------------------------------------------------------------------

export interface TemplateDefinition {
  type: EmailType;
  version: string;
  category: EmailCategory;
  defaultSubject: string;
  from: string;
  replyTo?: string;
  /** Render HTML from typed variables */
  renderHtml: (vars: Record<string, unknown>) => string;
  /** Render plain text from typed variables */
  renderText: (vars: Record<string, unknown>) => string;
  /** Validate that all required variables are present and non-null */
  validate: (vars: Record<string, unknown>) => ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Email Service Request / Response
// ---------------------------------------------------------------------------

export interface SendEmailRequest {
  type: EmailType;
  to: string;
  variables: Record<string, unknown>;
  idempotencyKey?: string;          // Auto-generated as `{type}:{key}` if omitted
  replyTo?: string;
  relatedUserId?: string;
  relatedOrderId?: string;
  relatedTicketId?: string;
  metadata?: Record<string, unknown>;
}

export interface SendEmailResult {
  success: boolean;
  emailLogId?: string;
  resendEmailId?: string;
  error?: string;
  skipped?: boolean;              // true when idempotency key already exists
  skipReason?: string;
}

// ---------------------------------------------------------------------------
// Webhook Event Types (Resend)
// ---------------------------------------------------------------------------

export type ResendWebhookEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.bounced'
  | 'email.complained'
  | 'email.opened'
  | 'email.clicked';

export interface ResendWebhookEvent {
  type: ResendWebhookEventType;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject?: string;
    [key: string]: unknown;
  };
}
