/**
 * templates/orders/order-cancelled.ts
 * Order cancellation email
 *
 * Integration note: No order cancellation workflow currently exists in the
 * Fameuxarte codebase. This template is built and ready for when that
 * workflow is implemented. See docs/email-system.md §18.
 */

import type { TemplateDefinition, OrderCancelledEmailVars, ValidationResult } from '../../types.ts';
import {
  EmailLayout, EmailCard, EmailHeading, EmailText, EmailButton,
  EmailDivider, EmailInfoRow, EmailPreheader, EmailAccentBar, EmailLabel,
  EmailStatusBadge, EmailSupportBox, escHtml, BRAND,
} from '../../design-system.ts';

function validate(vars: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!vars.customer_name || typeof vars.customer_name !== 'string') errors.push('customer_name is required');
  if (!vars.order_number || typeof vars.order_number !== 'string') errors.push('order_number is required');
  if (!vars.support_url || typeof vars.support_url !== 'string') errors.push('support_url is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as OrderCancelledEmailVars;
  const firstName = v.customer_name.split(' ')[0];

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`Your Fameuxarte order #${v.order_number} has been cancelled.`)}
    <div style="margin-bottom:16px;">
      ${EmailStatusBadge('Cancelled', 'neutral')}
    </div>
    ${EmailHeading(`Order Cancelled — #${escHtml(v.order_number)}`)}
    ${EmailText(`Hi ${escHtml(firstName)}, your order #${escHtml(v.order_number)} has been cancelled.`)}
    ${v.cancellation_reason ? `${EmailDivider()}${EmailInfoRow('Reason', v.cancellation_reason)}` : ''}
    ${v.refund_info ? `${EmailDivider()}${EmailText(`<strong style="color:${BRAND.colors.linen};">Refund Information:</strong><br>${escHtml(v.refund_info)}`, { muted: true })}` : ''}
    ${EmailDivider()}
    ${EmailText(`If you have any questions or believe this cancellation was an error, please contact our support team.`, { muted: true })}
    ${EmailButton('Contact Support', v.support_url)}
    ${EmailText(`You can continue browsing other artworks on Fameuxarte at any time.`, { small: true, muted: true })}
    ${EmailSupportBox()}
  `);

  return EmailLayout(content, `Order Cancelled — #${v.order_number}`);
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as OrderCancelledEmailVars;
  const firstName = v.customer_name.split(' ')[0];
  return `Hi ${firstName},

Your order #${v.order_number} has been cancelled.

${v.cancellation_reason ? `Reason: ${v.cancellation_reason}\n` : ''}
${v.refund_info ? `Refund Information: ${v.refund_info}\n` : ''}

If you have questions, please contact us:
${v.support_url}

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const orderCancelledTemplate: TemplateDefinition = {
  type: 'order_cancelled',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'Your Fameuxarte order has been cancelled',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
