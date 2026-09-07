/**
 * templates/artists/artwork-sold.ts
 * Notification to artist when one of their artworks is sold
 */

import type { TemplateDefinition, ArtworkSoldEmailVars, ValidationResult } from '../../types.ts';
import {
  EmailLayout, EmailCard, EmailHeading, EmailText, EmailButton,
  EmailDivider, EmailInfoRow, EmailPreheader, EmailAccentBar, EmailLabel,
  EmailStatusBadge, escHtml, BRAND,
} from '../../design-system.ts';

function validate(vars: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!vars.artist_name || typeof vars.artist_name !== 'string') errors.push('artist_name is required');
  if (!vars.artwork_title || typeof vars.artwork_title !== 'string') errors.push('artwork_title is required');
  if (!vars.order_reference || typeof vars.order_reference !== 'string') errors.push('order_reference is required');
  if (!vars.sale_amount || typeof vars.sale_amount !== 'string') errors.push('sale_amount is required');
  if (!vars.dashboard_url || typeof vars.dashboard_url !== 'string') errors.push('dashboard_url is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as ArtworkSoldEmailVars;
  const firstName = v.artist_name.split(' ')[0];

  const imgBlock = v.artwork_image_url
    ? `<div style="margin-bottom:24px;">
        <img src="${escHtml(v.artwork_image_url)}" alt="${escHtml(v.artwork_title)}" width="200" height="200"
          style="display:block;border-radius:8px;width:200px;height:200px;object-fit:cover;background-color:${BRAND.colors.surface2};">
      </div>`
    : '';

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`Great news ${firstName} — your artwork "${v.artwork_title}" has been sold!`)}
    ${EmailLabel('Sale Notification')}
    <div style="margin-bottom:16px;">
      ${EmailStatusBadge('Sold', 'success')}
    </div>
    ${EmailHeading(`Your artwork has been sold!`)}
    ${imgBlock}
    ${EmailText(`Congratulations, ${escHtml(firstName)}! Your artwork <strong style="color:${BRAND.colors.linen};">"${escHtml(v.artwork_title)}"</strong> has been purchased by a collector.`)}
    ${EmailDivider()}
    ${EmailInfoRow('Artwork', v.artwork_title)}
    ${EmailInfoRow('Order Reference', v.order_reference)}
    ${EmailInfoRow('Sale Amount', v.sale_amount, true)}
    ${EmailDivider()}
    ${EmailText(`The buyer will receive a Certificate of Authenticity along with their order. You'll receive shipping details and instructions to fulfil the order in your artist dashboard.`)}
    ${EmailButton('View Order Details', v.dashboard_url)}
    ${EmailText(`Please check your dashboard and accept the order within 48 hours.`, { small: true, muted: true })}
  `);

  return EmailLayout(content, `Your artwork has been sold — Fameuxarte`);
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as ArtworkSoldEmailVars;
  const firstName = v.artist_name.split(' ')[0];
  return `Congratulations, ${firstName}!

Your artwork "${v.artwork_title}" has been sold!

Order Reference: ${v.order_reference}
Sale Amount: ${v.sale_amount}

The buyer will receive a Certificate of Authenticity. You'll receive shipping details in your dashboard.

View order details and accept: ${v.dashboard_url}

Please accept the order within 48 hours.

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const artworkSoldTemplate: TemplateDefinition = {
  type: 'artwork_sold',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'Your artwork has been sold — Fameuxarte',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
