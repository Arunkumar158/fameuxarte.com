/**
 * templates/payments/payment-failed.ts
 * Payment failure notification
 *
 * Integration note: No server-side payment failure hook currently exists.
 * Razorpay modal dismissal is client-side only. This template is ready
 * for when a payment failure capture mechanism is implemented.
 * See docs/email-system.md §18 for integration guidance.
 */

import type { TemplateDefinition, PaymentFailedEmailVars, ValidationResult } from '../../types.ts';
import {
  EmailLayout, EmailCard, EmailHeading, EmailText, EmailButton,
  EmailDivider, EmailPreheader, EmailAccentBar, EmailStatusBadge,
  EmailSupportBox, escHtml, BRAND,
} from '../../design-system.ts';

function validate(vars: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!vars.customer_name || typeof vars.customer_name !== 'string') errors.push('customer_name is required');
  if (!vars.order_number || typeof vars.order_number !== 'string') errors.push('order_number is required');
  if (!vars.retry_url || typeof vars.retry_url !== 'string') errors.push('retry_url is required');
  if (!vars.support_url || typeof vars.support_url !== 'string') errors.push('support_url is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as PaymentFailedEmailVars;
  const firstName = v.customer_name.split(' ')[0];

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`We could not process your payment for order #${v.order_number}. Please retry.`)}
    <div style="margin-bottom:16px;">
      ${EmailStatusBadge('Payment Failed', 'warning')}
    </div>
    ${EmailHeading(`We couldn't process your payment`)}
    ${EmailText(`Hi ${escHtml(firstName)}, unfortunately we were unable to process your payment for order <strong style="color:${BRAND.colors.linen};">#${escHtml(v.order_number)}</strong>.`)}
    ${EmailDivider()}
    ${EmailText(`This can happen for several reasons:<br>
      &bull; &nbsp;Insufficient funds<br>
      &bull; &nbsp;Card declined by your bank<br>
      &bull; &nbsp;Network timeout during payment`, { muted: true })}
    ${EmailText(`Your artworks are still reserved. Please retry your payment to complete your order.`, { muted: true })}
    ${EmailButton('Retry Payment', v.retry_url)}
    ${EmailText(`If you continue to experience issues, please contact our support team.`, { small: true, muted: true })}
    ${EmailSupportBox()}
  `);

  return EmailLayout(content, `Payment failed — Order #${v.order_number}`);
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as PaymentFailedEmailVars;
  const firstName = v.customer_name.split(' ')[0];
  return `Hi ${firstName},

We were unable to process your payment for order #${v.order_number}.

Your artworks are still reserved. Please retry your payment:
${v.retry_url}

If you need help: ${v.support_url}

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const paymentFailedTemplate: TemplateDefinition = {
  type: 'payment_failed',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'Payment failed — Fameuxarte',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
