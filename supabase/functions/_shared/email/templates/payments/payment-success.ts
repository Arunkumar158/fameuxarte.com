/**
 * templates/payments/payment-success.ts
 * Payment success receipt email
 */

import type { TemplateDefinition, PaymentSuccessEmailVars, ValidationResult } from '../../types.ts';
import {
  EmailLayout, EmailCard, EmailHeading, EmailText, EmailButton,
  EmailDivider, EmailInfoRow, EmailPreheader, EmailAccentBar, EmailLabel,
  EmailStatusBadge, escHtml, BRAND,
} from '../../design-system.ts';

function validate(vars: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!vars.customer_name || typeof vars.customer_name !== 'string') errors.push('customer_name is required');
  if (!vars.order_number || typeof vars.order_number !== 'string') errors.push('order_number is required');
  if (!vars.amount_paid || typeof vars.amount_paid !== 'string') errors.push('amount_paid is required');
  if (!vars.payment_date || typeof vars.payment_date !== 'string') errors.push('payment_date is required');
  if (!vars.order_url || typeof vars.order_url !== 'string') errors.push('order_url is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as PaymentSuccessEmailVars;
  const firstName = v.customer_name.split(' ')[0];

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`Payment of ${v.amount_paid} received for order #${v.order_number}.`)}
    <div style="margin-bottom:16px;">
      ${EmailStatusBadge('Payment Successful', 'success')}
    </div>
    ${EmailHeading(`Payment received, ${escHtml(firstName)}.`)}
    ${EmailText(`Your payment has been successfully processed. Here is your payment summary.`)}
    ${EmailDivider()}
    ${EmailLabel('Payment Summary')}
    ${EmailInfoRow('Order Number', `#${v.order_number}`)}
    ${EmailInfoRow('Payment Date', v.payment_date)}
    ${EmailInfoRow('Amount Paid', v.amount_paid, true)}
    ${EmailDivider()}
    ${EmailText(`Your order is now being prepared. You will receive a separate email with shipping details once the artist dispatches your artwork.`, { muted: true })}
    ${EmailButton('View Order', v.order_url)}
  `);

  return EmailLayout(content, `Payment confirmed — #${v.order_number}`);
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as PaymentSuccessEmailVars;
  const firstName = v.customer_name.split(' ')[0];
  return `Hi ${firstName},

Your payment has been successfully processed.

Order Number: #${v.order_number}
Payment Date: ${v.payment_date}
Amount Paid: ${v.amount_paid}

View your order: ${v.order_url}

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const paymentSuccessTemplate: TemplateDefinition = {
  type: 'payment_success',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'Payment confirmed — Fameuxarte',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
