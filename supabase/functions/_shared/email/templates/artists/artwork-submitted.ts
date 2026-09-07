/**
 * templates/artists/artwork-submitted.ts
 * Sent to artist when they save an artwork as "available" (submitted for listing)
 *
 * Integration note: This fires when artist saves artwork with status = 'available'.
 * The admin artwork approval workflow does not yet exist (admin/Artworks.tsx is a stub).
 * When that workflow is built, the approval/rejection templates should be connected.
 * See docs/email-system.md §18 for integration guidance.
 */

import type { TemplateDefinition, ArtworkSubmittedEmailVars, ValidationResult } from '../../types.ts';
import {
  EmailLayout, EmailCard, EmailHeading, EmailText, EmailButton,
  EmailDivider, EmailPreheader, EmailAccentBar, EmailLabel, EmailInfoRow,
  escHtml, BRAND,
} from '../../design-system.ts';

function validate(vars: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!vars.artist_name || typeof vars.artist_name !== 'string') errors.push('artist_name is required');
  if (!vars.artwork_title || typeof vars.artwork_title !== 'string') errors.push('artwork_title is required');
  if (!vars.submitted_at || typeof vars.submitted_at !== 'string') errors.push('submitted_at is required');
  if (!vars.dashboard_url || typeof vars.dashboard_url !== 'string') errors.push('dashboard_url is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as ArtworkSubmittedEmailVars;
  const firstName = v.artist_name.split(' ')[0];

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`Your artwork "${v.artwork_title}" is now live on Fameuxarte.`)}
    ${EmailLabel('Artwork Listed')}
    ${EmailHeading(`"${escHtml(v.artwork_title)}" is now live`)}
    ${EmailText(`Your artwork is now listed on Fameuxarte and visible to collectors around the world.`)}
    ${EmailDivider()}
    ${EmailInfoRow('Artwork', v.artwork_title)}
    ${EmailInfoRow('Listed', v.submitted_at)}
    ${EmailDivider()}
    ${EmailText(`Share your listing link with your followers to start generating interest. You can track views, likes, and orders from your dashboard.`, { muted: true })}
    ${EmailButton('View in Dashboard', v.dashboard_url)}
    ${EmailText(`Ensure your artwork has high-quality photos, a compelling description, and an accurate price to attract serious collectors.`, { small: true, muted: true })}
  `);

  return EmailLayout(content, `Artwork listed — ${v.artwork_title}`);
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as ArtworkSubmittedEmailVars;
  return `Hi ${v.artist_name},

Your artwork "${v.artwork_title}" is now live on Fameuxarte!

Listed: ${v.submitted_at}

Share your listing and track performance in your dashboard:
${v.dashboard_url}

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const artworkSubmittedTemplate: TemplateDefinition = {
  type: 'artwork_submitted',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'Your artwork is now live on Fameuxarte',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
