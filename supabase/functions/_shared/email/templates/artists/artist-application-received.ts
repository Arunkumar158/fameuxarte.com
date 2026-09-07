/**
 * templates/artists/artist-application-received.ts
 * Sent to the artist when they submit their identity documents for verification
 */

import type { TemplateDefinition, ArtistApplicationReceivedEmailVars, ValidationResult } from '../../types.ts';
import {
  EmailLayout, EmailCard, EmailHeading, EmailText, EmailButton,
  EmailDivider, EmailPreheader, EmailAccentBar, EmailLabel, escHtml, BRAND,
} from '../../design-system.ts';

function validate(vars: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!vars.artist_name || typeof vars.artist_name !== 'string') errors.push('artist_name is required');
  if (!vars.dashboard_url || typeof vars.dashboard_url !== 'string') errors.push('dashboard_url is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as ArtistApplicationReceivedEmailVars;
  const firstName = v.artist_name.split(' ')[0];

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`Your Fameuxarte artist application has been received. We'll review it shortly.`)}
    ${EmailLabel('Artist Application')}
    ${EmailHeading(`Application received, ${escHtml(firstName)}.`)}
    ${EmailText(`Thank you for applying to join Fameuxarte as a verified artist. We have received your identity documents and your application is now under review.`)}
    ${EmailDivider()}
    ${EmailText(`Our team typically reviews applications within <strong style="color:${BRAND.colors.linen};">3–5 business days</strong>. You will receive an email notification as soon as your review is complete.`, { muted: true })}
    ${EmailText(`While you wait, you can track your verification status in the artist dashboard.`, { muted: true })}
    ${EmailButton('Check Verification Status', v.dashboard_url)}
    ${EmailText(`If you have questions about the verification process, please contact our artist relations team.`, { small: true, muted: true })}
  `);

  return EmailLayout(content, 'Your Fameuxarte artist application is under review');
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as ArtistApplicationReceivedEmailVars;
  const firstName = v.artist_name.split(' ')[0];
  return `Hi ${firstName},

Thank you for applying to join Fameuxarte as a verified artist.

We have received your identity documents and your application is now under review. Our team typically reviews applications within 3–5 business days.

You will receive an email notification as soon as your review is complete.

Check your verification status: ${v.dashboard_url}

Questions? Contact us at https://fameuxarte.com/contact-us

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const artistApplicationReceivedTemplate: TemplateDefinition = {
  type: 'artist_application_received',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'Your Fameuxarte artist application is under review',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
