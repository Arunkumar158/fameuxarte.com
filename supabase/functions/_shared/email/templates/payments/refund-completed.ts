/**
 * templates/payments/refund-completed.ts
 * Refund completed confirmation
 */

import type { TemplateDefinition, RefundCompletedEmailVars, ValidationResult } from '../../types.ts';
import {
  EmailLayout, EmailCard, EmailHeading, EmailText, EmailButton,
  EmailDivider, EmailInfoRow, EmailPreheader, EmailAccentBar, EmailLabel,
  EmailStatusBadge, escHtml, BRAND,
} from '../../design-system.ts';

function validate(vars: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!vars.customer_name || typeof vars.customer_name !== 'string') errors.push('customer_name is required');
  if (!vars.order_number || typeof vars.order_number !== 'string') errors.push('order_number is required');
  if (!vars.refund_amount || typeof vars.refund_amount !== 'string') errors.push('refund_amount is required');
  if (!vars.completed_at || typeof vars.completed_at !== 'string') errors.push('completed_at is required');
  if (!vars.order_url || typeof vars.order_url !== 'string') errors.push('order_url is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as RefundCompletedEmailVars;
  const firstName = v.customer_name.split(' ')[0];

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`Your refund of ${v.refund_amount} for order #${v.order_number} is complete.`)}
    <div style="margin-bottom:16px;">
      ${EmailStatusBadge('Refund Complete', 'success')}
    </div>
    ${EmailHeading(`Refund complete — ${escHtml(v.refund_amount)}`)}
    ${EmailText(`Hi ${escHtml(firstName)}, your refund has been processed successfully.`)}
    ${EmailDivider()}
    ${EmailLabel('Refund Details')}
    ${EmailInfoRow('Order Number', `#${v.order_number}`)}
    ${EmailInfoRow('Refund Amount', v.refund_amount, true)}
    ${EmailInfoRow('Completed', v.completed_at)}
    ${EmailDivider()}
    ${EmailText(`The refund should now be visible on your original payment method. Please allow 1–2 business days for it to appear on your statement.`, { muted: true })}
    ${EmailButton('View Order', v.order_url)}
  `);

  return EmailLayout(content, `Refund complete — Order #${v.order_number}`);
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as RefundCompletedEmailVars;
  const firstName = v.customer_name.split(' ')[0];
  return `Hi ${firstName},

Your refund of ${v.refund_amount} for order #${v.order_number} has been processed.

Completed: ${v.completed_at}

Please allow 1–2 business days for it to appear on your statement.

View order: ${v.order_url}

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const refundCompletedTemplate: TemplateDefinition = {
  type: 'refund_completed',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'Your refund is complete — Fameuxarte',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
