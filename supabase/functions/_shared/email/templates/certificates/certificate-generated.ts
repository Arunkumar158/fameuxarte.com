/**
 * templates/certificates/certificate-generated.ts
 * Certificate of Authenticity issuance email
 */

import type { TemplateDefinition, CertificateGeneratedEmailVars, ValidationResult } from '../../types.ts';
import {
  EmailLayout, EmailCard, EmailHeading, EmailText, EmailButton,
  EmailDivider, EmailInfoRow, EmailPreheader, EmailAccentBar, EmailLabel,
  EmailCertificateNumber, EmailStatusBadge, escHtml, BRAND,
} from '../../design-system.ts';

function validate(vars: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!vars.customer_name || typeof vars.customer_name !== 'string') errors.push('customer_name is required');
  if (!vars.artwork_title || typeof vars.artwork_title !== 'string') errors.push('artwork_title is required');
  if (!vars.artist_name || typeof vars.artist_name !== 'string') errors.push('artist_name is required');
  if (!vars.certificate_number || typeof vars.certificate_number !== 'string') errors.push('certificate_number is required');
  if (!vars.certificate_url || typeof vars.certificate_url !== 'string') errors.push('certificate_url is required');
  if (!vars.issued_at || typeof vars.issued_at !== 'string') errors.push('issued_at is required');
  if (!vars.verification_url || typeof vars.verification_url !== 'string') errors.push('verification_url is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as CertificateGeneratedEmailVars;
  const firstName = v.customer_name.split(' ')[0];

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`Your Certificate of Authenticity for "${v.artwork_title}" by ${v.artist_name} has been issued.`)}
    <div style="margin-bottom:16px;">
      ${EmailStatusBadge('Certificate Issued', 'success')}
    </div>
    ${EmailHeading(`Certificate of Authenticity`)}
    ${EmailText(`Hi ${escHtml(firstName)}, your Certificate of Authenticity has been issued for your recent purchase.`)}
    ${EmailDivider()}
    ${EmailLabel('Artwork')}
    ${EmailInfoRow('Title', v.artwork_title)}
    ${EmailInfoRow('Artist', v.artist_name)}
    ${EmailInfoRow('Issued', v.issued_at)}
    ${EmailCertificateNumber(v.certificate_number)}
    ${EmailDivider()}
    ${EmailText(`This certificate verifies the authenticity and provenance of your artwork. You can download the full certificate PDF and verify its authenticity at any time.`, { muted: true })}
    ${EmailButton('View Certificate', v.certificate_url)}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px 0;">
      <tr>
        <td>
          <a href="${escHtml(v.verification_url)}"
            style="font-family:${BRAND.fonts.body};font-size:13px;color:${BRAND.colors.gold};text-decoration:none;">
            Verify certificate publicly &rarr;
          </a>
        </td>
      </tr>
    </table>
    ${EmailText(`This certificate is permanently linked to your artwork's unique record on Fameuxarte and cannot be transferred or duplicated.`, { small: true, muted: true })}
  `);

  return EmailLayout(content, `Certificate of Authenticity — ${v.artwork_title}`);
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as CertificateGeneratedEmailVars;
  const firstName = v.customer_name.split(' ')[0];
  return `Hi ${firstName},

Your Certificate of Authenticity has been issued.

Artwork: "${v.artwork_title}"
Artist: ${v.artist_name}
Certificate Number: ${v.certificate_number}
Issued: ${v.issued_at}

View your certificate: ${v.certificate_url}

Verify certificate publicly: ${v.verification_url}

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const certificateGeneratedTemplate: TemplateDefinition = {
  type: 'certificate_generated',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'Your Certificate of Authenticity — Fameuxarte',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
