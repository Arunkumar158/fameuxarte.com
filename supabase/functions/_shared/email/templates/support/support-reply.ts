/**
 * templates/support/support-reply.ts
 * New reply notification email — sent to customer when agent replies to their ticket
 *
 * Security note: Only the first ~200 chars of the reply are previewed.
 * The full conversation is NOT included in the email — customer must
 * log in to read the full reply. This prevents sensitive admin notes
 * from appearing in emails even if fields are confused.
 */

import type { TemplateDefinition, SupportReplyEmailVars, ValidationResult } from '../../types.ts';
import {
  EmailLayout, EmailCard, EmailHeading, EmailText, EmailButton,
  EmailDivider, EmailInfoRow, EmailPreheader, EmailAccentBar, EmailLabel,
  escHtml, BRAND,
} from '../../design-system.ts';

function validate(vars: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!vars.customer_name || typeof vars.customer_name !== 'string') errors.push('customer_name is required');
  if (!vars.ticket_number || typeof vars.ticket_number !== 'string') errors.push('ticket_number is required');
  if (!vars.ticket_subject || typeof vars.ticket_subject !== 'string') errors.push('ticket_subject is required');
  if (!vars.reply_preview || typeof vars.reply_preview !== 'string') errors.push('reply_preview is required');
  if (!vars.ticket_url || typeof vars.ticket_url !== 'string') errors.push('ticket_url is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as SupportReplyEmailVars;
  const firstName = v.customer_name.split(' ')[0];
  // Truncate preview at 200 chars for safety
  const safePreview = String(v.reply_preview).substring(0, 200);

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`A Fameuxarte support agent has replied to your ticket ${v.ticket_number}.`)}
    ${EmailHeading(`New reply to your support ticket`)}
    ${EmailText(`Hi ${escHtml(firstName)}, our support team has replied to your ticket.`)}
    ${EmailDivider()}
    ${EmailInfoRow('Ticket Number', v.ticket_number)}
    ${EmailInfoRow('Subject', v.ticket_subject)}
    ${EmailDivider()}
    ${EmailLabel('Reply Preview')}
    <div style="
      background-color:${BRAND.colors.surface2};
      border-left:3px solid ${BRAND.colors.gold};
      border-radius:4px;
      padding:16px;
      margin-bottom:20px;
    ">
      <p style="font-family:${BRAND.fonts.body};font-size:14px;color:${BRAND.colors.linen};margin:0;line-height:1.6;">${escHtml(safePreview)}${safePreview.length >= 200 ? '...' : ''}</p>
    </div>
    ${EmailText(`To read the full reply and respond, please visit your support ticket.`, { muted: true })}
    ${EmailButton('Read Full Reply', v.ticket_url)}
  `);

  return EmailLayout(content, `New reply to ticket ${v.ticket_number}`);
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as SupportReplyEmailVars;
  const firstName = v.customer_name.split(' ')[0];
  const safePreview = String(v.reply_preview).substring(0, 200);
  return `Hi ${firstName},

Our support team has replied to your ticket.

Ticket Number: ${v.ticket_number}
Subject: ${v.ticket_subject}

Reply Preview:
"${safePreview}${safePreview.length >= 200 ? '...' : ''}"

Read the full reply and respond: ${v.ticket_url}

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const supportReplyTemplate: TemplateDefinition = {
  type: 'support_reply',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'New reply to your Fameuxarte support ticket',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
