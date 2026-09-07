/**
 * templates/auth/welcome.ts
 * Welcome Email — sent when a new user registers on Fameuxarte
 */

import type { TemplateDefinition, WelcomeEmailVars, ValidationResult } from '../../types.ts';
import {
  EmailLayout, EmailCard, EmailHeading, EmailText, EmailButton,
  EmailSupportBox, EmailPreheader, EmailDivider, EmailAccentBar, escHtml,
  BRAND,
} from '../../design-system.ts';

function validate(vars: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!vars.customer_name || typeof vars.customer_name !== 'string') errors.push('customer_name is required');
  if (!vars.explore_url || typeof vars.explore_url !== 'string') errors.push('explore_url is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as WelcomeEmailVars;
  const firstName = v.customer_name.split(' ')[0];

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`Welcome to Fameuxarte, ${firstName}. Discover original art from emerging artists worldwide.`)}
    ${EmailHeading(`Welcome to Fameuxarte, ${escHtml(firstName)}.`)}
    ${EmailText(`We're delighted to have you with us.`)}
    ${EmailText(`Fameuxarte is where emerging artists share their work and collectors discover meaningful original art — curated, verified, and delivered to your door.`)}
    ${EmailDivider()}
    ${EmailText(`Start exploring our collection of original artworks — paintings, sculptures, photography, and more — from verified artists around the world.`, { muted: true })}
    ${EmailButton('Explore Fameuxarte', v.explore_url)}
    ${EmailText(`As a member of Fameuxarte, you can:<br>
      &bull; &nbsp;Save artworks to your wishlist<br>
      &bull; &nbsp;Follow your favourite artists<br>
      &bull; &nbsp;Receive a Certificate of Authenticity with every purchase<br>
      &bull; &nbsp;Contact our support team at any time`, { small: true })}
    ${EmailSupportBox()}
  `);

  return EmailLayout(content, 'Welcome to Fameuxarte');
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as WelcomeEmailVars;
  const firstName = v.customer_name.split(' ')[0];
  return `Welcome to Fameuxarte, ${firstName}.

We're delighted to have you with us.

Fameuxarte is where emerging artists share their work and collectors discover meaningful original art — curated, verified, and delivered to your door.

Start exploring: ${v.explore_url}

As a member of Fameuxarte, you can:
- Save artworks to your wishlist
- Follow your favourite artists  
- Receive a Certificate of Authenticity with every purchase
- Contact our support team at any time

Need help? Visit https://fameuxarte.com/collector/support

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const welcomeTemplate: TemplateDefinition = {
  type: 'welcome',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'Welcome to Fameuxarte',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
