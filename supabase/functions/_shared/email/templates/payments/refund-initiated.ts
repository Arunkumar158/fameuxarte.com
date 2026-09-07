/**
 * templates/payments/refund-initiated.ts
 * Refund initiated notification
 *
 * Integration note: No refund workflow currently exists in Fameuxarte.
 * Template is ready for when that workflow is built.
 */

import type { TemplateDefinition, RefundInitiatedEmailVars, ValidationResult } from '../../types.ts';
import {
  EmailLayout, EmailCard, EmailHeading, EmailText, EmailButton,
  EmailDivider, EmailInfoRow, EmailPreheader, EmailAccentBar, EmailLabel,
  EmailStatusBadge, EmailSupportBox, escHtml, BRAND,
} from '../../design-system.ts';

function validate(vars: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!vars.customer_name || typeof vars.customer_name !== 'string') errors.push('customer_name is required');
  if (!vars.order_number || typeof vars.order_number !== 'string') errors.push('order_number is required');
  if (!vars.refund_amount || typeof vars.refund_amount !== 'string') errors.push('refund_amount is required');
  if (!vars.initiated_at || typeof vars.initiated_at !== 'string') errors.push('initiated_at is required');
  if (!vars.expected_processing || typeof vars.expected_processing !== 'string') errors.push('expected_processing is required');
  if (!vars.support_url || typeof vars.support_url !== 'string') errors.push('support_url is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as RefundInitiatedEmailVars;
  const firstName = v.customer_name.split(' ')[0];

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`Your refund of ${v.refund_amount} for order #${v.order_number} is being processed.`)}
    <div style="margin-bottom:16px;">
      ${EmailStatusBadge('Refund Processing', 'info')}
    </div>
    ${EmailHeading(`Refund initiated — Order #${escHtml(v.order_number)}`)}
    ${EmailText(`Hi ${escHtml(firstName)}, we have initiated a refund for your order.`)}
    ${EmailDivider()}
    ${EmailLabel('Refund Details')}
    ${EmailInfoRow('Order Number', `#${v.order_number}`)}
    ${EmailInfoRow('Refund Amount', v.refund_amount, true)}
    ${EmailInfoRow('Initiated', v.initiated_at)}
    ${EmailInfoRow('Expected Processing', v.expected_processing)}
    ${EmailDivider()}
    ${EmailText(`Refunds typically take 5–7 business days to appear on your statement, depending on your bank or payment provider.`, { muted: true })}
    ${EmailText(`If you have not received your refund after the expected processing period, please contact your bank or our support team.`, { small: true, muted: true })}
    ${EmailSupportBox()}
  `);

  return EmailLayout(content, `Refund initiated — Order #${v.order_number}`);
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as RefundInitiatedEmailVars;
  const firstName = v.customer_name.split(' ')[0];
  return `Hi ${firstName},

A refund of ${v.refund_amount} has been initiated for your order #${v.order_number}.

Initiated: ${v.initiated_at}
Expected Processing: ${v.expected_processing}

Refunds typically take 5–7 business days to appear on your statement.

Need help? ${v.support_url}

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const refundInitiatedTemplate: TemplateDefinition = {
  type: 'refund_initiated',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'Refund initiated — Fameuxarte',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
