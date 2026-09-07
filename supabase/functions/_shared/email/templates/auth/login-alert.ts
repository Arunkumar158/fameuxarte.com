/**
 * templates/auth/login-alert.ts
 * Login Alert Email — sent when a new sign-in is detected
 *
 * Integration note: This template requires a server-side login hook.
 * Supabase Auth does not expose a reliable server-side login event
 * accessible from client code. This template is ready for when a
 * webhook/trigger mechanism is implemented.
 * See docs/email-system.md §19 for integration guidance.
 */

import type { TemplateDefinition, LoginAlertEmailVars, ValidationResult } from '../../types.ts';
import {
  EmailLayout, EmailCard, EmailHeading, EmailText, EmailButton,
  EmailInfoRow, EmailDivider, EmailPreheader, EmailAccentBar,
  EmailSupportBox, escHtml, BRAND,
} from '../../design-system.ts';

function validate(vars: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!vars.customer_name || typeof vars.customer_name !== 'string') errors.push('customer_name is required');
  if (!vars.login_time || typeof vars.login_time !== 'string') errors.push('login_time is required');
  if (!vars.account_url || typeof vars.account_url !== 'string') errors.push('account_url is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as LoginAlertEmailVars;
  const firstName = v.customer_name.split(' ')[0];

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`A new sign-in to your Fameuxarte account was detected.`)}
    ${EmailHeading(`New sign-in to your account`)}
    ${EmailText(`Hi ${escHtml(firstName)}, we noticed a new sign-in to your Fameuxarte account.`)}
    ${EmailDivider()}
    ${EmailInfoRow('Time', v.login_time)}
    ${v.login_device ? EmailInfoRow('Device', v.login_device) : ''}
    ${EmailDivider()}
    ${EmailText(`If this was you, no action is required. If you did not sign in, please secure your account immediately.`, { muted: true })}
    ${EmailButton('Review Account Security', v.account_url)}
    ${EmailText(`If you did not recognise this sign-in, change your password and contact our support team.`, { small: true, muted: true })}
    ${EmailSupportBox()}
  `);

  return EmailLayout(content, 'New login to your Fameuxarte account');
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as LoginAlertEmailVars;
  const firstName = v.customer_name.split(' ')[0];
  return `Hi ${firstName},

A new sign-in to your Fameuxarte account was detected.

Time: ${v.login_time}
${v.login_device ? `Device: ${v.login_device}` : ''}

If this was you, no action is required.

If you did not sign in, please secure your account immediately:
${v.account_url}

Need help? Visit https://fameuxarte.com/collector/support

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const loginAlertTemplate: TemplateDefinition = {
  type: 'login_alert',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'New login to your Fameuxarte account',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
