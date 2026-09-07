/**
 * templates/orders/order-delivered.ts
 * Delivery confirmation email — sent when order is marked as delivered
 */

import type { TemplateDefinition, OrderDeliveredEmailVars, ValidationResult } from '../../types.ts';
import {
  EmailLayout, EmailCard, EmailHeading, EmailText, EmailButton,
  EmailDivider, EmailInfoRow, EmailPreheader, EmailAccentBar, EmailLabel,
  EmailStatusBadge, EmailSupportBox, escHtml, BRAND,
} from '../../design-system.ts';

function validate(vars: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!vars.customer_name || typeof vars.customer_name !== 'string') errors.push('customer_name is required');
  if (!vars.order_number || typeof vars.order_number !== 'string') errors.push('order_number is required');
  if (!vars.artwork_title || typeof vars.artwork_title !== 'string') errors.push('artwork_title is required');
  if (!vars.delivered_at || typeof vars.delivered_at !== 'string') errors.push('delivered_at is required');
  if (!vars.order_url || typeof vars.order_url !== 'string') errors.push('order_url is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as OrderDeliveredEmailVars;
  const firstName = v.customer_name.split(' ')[0];

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`Your artwork "${v.artwork_title}" has been delivered. Enjoy your new piece!`)}
    <div style="margin-bottom:16px;">
      ${EmailStatusBadge('Delivered', 'success')}
    </div>
    ${EmailHeading(`Your artwork has arrived, ${escHtml(firstName)}!`)}
    ${EmailText(`We hope you love your new artwork. <strong style="color:${BRAND.colors.linen};">"${escHtml(v.artwork_title)}"</strong> has been delivered to your address.`)}
    ${EmailDivider()}
    ${EmailLabel('Delivery Details')}
    ${EmailInfoRow('Order Number', `#${v.order_number}`)}
    ${EmailInfoRow('Delivered', v.delivered_at)}
    ${EmailDivider()}
    ${EmailText(`Your Certificate of Authenticity is available in your collection and can be verified at any time at <a href="https://fameuxarte.com" style="color:${BRAND.colors.gold};text-decoration:none;">fameuxarte.com</a>.`, { muted: true })}
    ${EmailButton('View My Collection', v.order_url)}
    ${EmailText(`Thank you for supporting independent artists through Fameuxarte. We hope to see you again soon.`, { small: true, muted: true })}
    ${EmailSupportBox()}
  `);

  return EmailLayout(content, `Your artwork has been delivered — Fameuxarte`);
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as OrderDeliveredEmailVars;
  const firstName = v.customer_name.split(' ')[0];
  return `Hi ${firstName},

Your artwork "${v.artwork_title}" has been delivered!

Order Number: #${v.order_number}
Delivered: ${v.delivered_at}

Your Certificate of Authenticity is available in your collection:
${v.order_url}

Thank you for supporting independent artists through Fameuxarte.

Need help? https://fameuxarte.com/collector/support

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const orderDeliveredTemplate: TemplateDefinition = {
  type: 'order_delivered',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'Your artwork has been delivered — Fameuxarte',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
