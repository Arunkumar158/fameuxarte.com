/**
 * templates/marketing/newsletter.ts
 * Newsletter template foundation
 *
 * IMPORTANT: This template requires:
 * 1. Marketing consent/preferences system (email_preferences table — already built)
 * 2. Subscriber list management
 * 3. Unsubscribe URL generation per recipient
 *
 * The template is built and ready. DO NOT send without:
 *   - Verifying user has marketing_enabled = true in email_preferences
 *   - Generating a valid, working unsubscribe_url per recipient
 *
 * The email service will BLOCK sending this template if category = 'marketing'
 * and the user has opted out. See docs/email-system.md §17 (Transactional vs Marketing).
 */

import type { TemplateDefinition, NewsletterEmailVars, ValidationResult } from '../../types.ts';
import {
  EmailLayout, EmailCard, EmailHeading, EmailText,
  EmailPreheader, EmailFooter, EmailHeader, escHtml, BRAND,
} from '../../design-system.ts';

function validate(vars: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!vars.customer_name || typeof vars.customer_name !== 'string') errors.push('customer_name is required');
  if (!vars.content_html || typeof vars.content_html !== 'string') errors.push('content_html is required');
  if (!vars.unsubscribe_url || typeof vars.unsubscribe_url !== 'string') errors.push('unsubscribe_url is required — required for marketing email compliance');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as NewsletterEmailVars;

  // Newsletter uses a custom footer with unsubscribe link
  const customContent = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fameuxarte Newsletter</title>
  <style>
    body { margin:0;padding:0;background-color:${BRAND.colors.obsidian};font-family:${BRAND.fonts.body}; }
    @media only screen and (max-width:600px){.email-container{width:100%!important;}.email-pad{padding:20px!important;}}
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.colors.obsidian};">
  ${EmailPreheader('The latest from Fameuxarte — art, artists, and stories worth discovering.')}
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${BRAND.colors.obsidian};">
    <tr>
      <td align="center" style="padding:40px 20px;" class="email-pad">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="max-width:600px;width:100%;">
          ${EmailHeader()}
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                style="background-color:${BRAND.colors.surface1};border-radius:12px;border:1px solid ${BRAND.colors.border};overflow:hidden;">
                <tr>
                  <td style="padding:32px;" class="card-pad">
                    ${v.content_html}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${EmailFooter({ unsubscribeUrl: v.unsubscribe_url })}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return customContent;
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as NewsletterEmailVars;
  // Strip HTML tags from content for plain text
  const plainContent = v.content_html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return `Fameuxarte Newsletter
──────────────────────

${v.customer_name ? `Hi ${v.customer_name},\n` : ''}

${plainContent}

──────────────────────
To unsubscribe from marketing emails: ${v.unsubscribe_url}

Privacy Policy: https://fameuxarte.com/legal/privacy
© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const newsletterTemplate: TemplateDefinition = {
  type: 'newsletter',
  version: '1.0',
  category: 'marketing',
  defaultSubject: 'From Fameuxarte — art worth discovering',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
