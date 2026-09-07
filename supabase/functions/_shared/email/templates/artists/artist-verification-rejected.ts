/**
 * templates/artists/artist-verification-rejected.ts
 * Rejection email — sensitive, respectful, actionable
 */

import type { TemplateDefinition, ArtistVerificationRejectedEmailVars, ValidationResult } from '../../types.ts';
import {
  EmailLayout, EmailCard, EmailHeading, EmailText, EmailButton,
  EmailDivider, EmailPreheader, EmailAccentBar, EmailLabel, EmailStatusBadge,
  EmailSupportBox, escHtml, BRAND,
} from '../../design-system.ts';

function validate(vars: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!vars.artist_name || typeof vars.artist_name !== 'string') errors.push('artist_name is required');
  if (!vars.reason || typeof vars.reason !== 'string') errors.push('reason is required');
  if (!vars.action_required || typeof vars.action_required !== 'string') errors.push('action_required is required');
  if (!vars.dashboard_url || typeof vars.dashboard_url !== 'string') errors.push('dashboard_url is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as ArtistVerificationRejectedEmailVars;
  const firstName = v.artist_name.split(' ')[0];

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`An update on your Fameuxarte artist application.`)}
    ${EmailLabel('Verification Update')}
    <div style="margin-bottom:16px;">
      ${EmailStatusBadge('Action Required', 'warning')}
    </div>
    ${EmailHeading(`An update on your application, ${escHtml(firstName)}`)}
    ${EmailText(`We've reviewed your identity documents and, unfortunately, we are unable to verify your application at this time.`)}
    ${EmailDivider()}
    ${EmailText(`<strong style="color:${BRAND.colors.linen};">Reason:</strong><br>${escHtml(v.reason)}`, { muted: true })}
    ${EmailText(`<strong style="color:${BRAND.colors.linen};">What's required:</strong><br>${escHtml(v.action_required)}`, { muted: true })}
    ${EmailDivider()}
    ${EmailText(`You are welcome to resubmit your application once you have addressed the above. Log in to your dashboard to resubmit.`)}
    ${EmailButton('Resubmit Application', v.dashboard_url)}
    ${EmailText(`If you believe this decision was made in error or need further assistance, please contact our support team.`, { small: true, muted: true })}
    ${EmailSupportBox()}
  `);

  return EmailLayout(content, 'Update on your Fameuxarte artist application');
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as ArtistVerificationRejectedEmailVars;
  const firstName = v.artist_name.split(' ')[0];
  return `Hi ${firstName},

We've reviewed your identity documents and, unfortunately, we are unable to verify your application at this time.

Reason: ${v.reason}

What's required: ${v.action_required}

You are welcome to resubmit your application once you have addressed the above:
${v.dashboard_url}

If you believe this decision was made in error, please contact us:
https://fameuxarte.com/contact-us

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const artistVerificationRejectedTemplate: TemplateDefinition = {
  type: 'artist_verification_rejected',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'An update on your Fameuxarte artist application',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
