/**
 * templates/artists/artist-verification-approved.ts
 * Congratulations email when artist identity is verified by admin
 */

import type { TemplateDefinition, ArtistVerificationApprovedEmailVars, ValidationResult } from '../../types.ts';
import {
  EmailLayout, EmailCard, EmailHeading, EmailText, EmailButton,
  EmailDivider, EmailPreheader, EmailAccentBar, EmailLabel, EmailStatusBadge,
  escHtml, BRAND,
} from '../../design-system.ts';

function validate(vars: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!vars.artist_name || typeof vars.artist_name !== 'string') errors.push('artist_name is required');
  if (!vars.dashboard_url || typeof vars.dashboard_url !== 'string') errors.push('dashboard_url is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as ArtistVerificationApprovedEmailVars;
  const firstName = v.artist_name.split(' ')[0];

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`Congratulations ${firstName} — your Fameuxarte artist profile is now verified.`)}
    ${EmailLabel('Verification Complete')}
    <div style="margin-bottom:16px;">
      ${EmailStatusBadge('Verified Artist', 'success')}
    </div>
    ${EmailHeading(`Congratulations, ${escHtml(firstName)}!`)}
    ${EmailText(`Your identity has been verified and your Fameuxarte artist profile is now active. You can now publish artworks, build your portfolio, and start selling on our platform.`)}
    ${EmailDivider()}
    ${EmailText(`Here's what you can do next:`, { muted: true })}
    ${EmailText(`<strong style="color:${BRAND.colors.linen};">1. Upload your first artwork</strong> — Add high-quality photos, set your price, and tell the story behind your work.<br><br>
<strong style="color:${BRAND.colors.linen};">2. Complete your profile</strong> — Add your bio, artist statement, and social links to build trust with collectors.<br><br>
<strong style="color:${BRAND.colors.linen};">3. Build your collection</strong> — Group artworks into collections to create a compelling portfolio.`, { muted: true })}
    ${EmailButton('Go to Artist Dashboard', v.dashboard_url)}
    ${EmailText(`Welcome to the Fameuxarte community. We look forward to helping you share your art with the world.`, { small: true, muted: true })}
  `);

  return EmailLayout(content, 'Your Fameuxarte artist profile is verified');
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as ArtistVerificationApprovedEmailVars;
  const firstName = v.artist_name.split(' ')[0];
  return `Congratulations, ${firstName}!

Your identity has been verified and your Fameuxarte artist profile is now active.

You can now publish artworks, build your portfolio, and start selling on Fameuxarte.

Next steps:
1. Upload your first artwork
2. Complete your artist profile
3. Build your collection

Go to your dashboard: ${v.dashboard_url}

Welcome to the Fameuxarte community!

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const artistVerificationApprovedTemplate: TemplateDefinition = {
  type: 'artist_verification_approved',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'Your Fameuxarte artist profile is now verified 🎨',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
