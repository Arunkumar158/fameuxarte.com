/**
 * templates/orders/order-shipped.ts
 * Shipping notification email — sent to buyer when artist marks order as shipped
 */

import type { TemplateDefinition, OrderShippedEmailVars, ValidationResult } from '../../types.ts';
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
  if (!vars.carrier || typeof vars.carrier !== 'string') errors.push('carrier is required');
  if (!vars.tracking_number || typeof vars.tracking_number !== 'string') errors.push('tracking_number is required');
  if (!vars.order_url || typeof vars.order_url !== 'string') errors.push('order_url is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as OrderShippedEmailVars;
  const firstName = v.customer_name.split(' ')[0];

  const trackingBlock = v.tracking_url
    ? EmailButton(`Track with ${v.carrier}`, v.tracking_url)
    : `<p style="font-family:${BRAND.fonts.body};font-size:13px;color:${BRAND.colors.stone};margin:0 0 20px 0;">Tracking: <strong style="color:${BRAND.colors.linen};">${escHtml(v.tracking_number)}</strong> via ${escHtml(v.carrier)}</p>`;

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`Your artwork "${v.artwork_title}" is on its way!`)}
    <div style="margin-bottom:16px;">
      ${EmailStatusBadge('Shipped', 'info')}
    </div>
    ${EmailHeading(`Your artwork is on its way, ${escHtml(firstName)}!`)}
    ${EmailText(`Great news — <strong style="color:${BRAND.colors.linen};">"${escHtml(v.artwork_title)}"</strong> has been packed and handed to the courier.`)}
    ${EmailDivider()}
    ${EmailLabel('Shipping Details')}
    ${EmailInfoRow('Order Number', `#${v.order_number}`)}
    ${EmailInfoRow('Carrier', v.carrier)}
    ${EmailInfoRow('Tracking Number', v.tracking_number)}
    ${v.estimated_delivery ? EmailInfoRow('Estimated Delivery', v.estimated_delivery) : ''}
    ${EmailDivider()}
    ${trackingBlock}
    ${EmailButton('View Order', v.order_url, { secondary: true })}
    ${EmailText(`Please handle your artwork with care upon arrival. If you have any questions or concerns about your delivery, please contact us.`, { small: true, muted: true })}
    ${EmailSupportBox()}
  `);

  return EmailLayout(content, `Your artwork has shipped — Order #${v.order_number}`);
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as OrderShippedEmailVars;
  const firstName = v.customer_name.split(' ')[0];
  return `Hi ${firstName},

Your artwork "${v.artwork_title}" has shipped!

Order Number: #${v.order_number}
Carrier: ${v.carrier}
Tracking Number: ${v.tracking_number}
${v.estimated_delivery ? `Estimated Delivery: ${v.estimated_delivery}` : ''}
${v.tracking_url ? `Track your shipment: ${v.tracking_url}` : ''}

View your order: ${v.order_url}

Need help? https://fameuxarte.com/collector/support

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const orderShippedTemplate: TemplateDefinition = {
  type: 'order_shipped',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'Your artwork has shipped — Fameuxarte',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
