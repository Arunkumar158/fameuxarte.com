/**
 * templates/support/support-ticket-resolved.ts
 * Support ticket resolved notification
 */

import type { TemplateDefinition, SupportTicketResolvedEmailVars, ValidationResult } from '../../types.ts';
import {
  EmailLayout, EmailCard, EmailHeading, EmailText, EmailButton,
  EmailDivider, EmailInfoRow, EmailPreheader, EmailAccentBar, EmailLabel,
  EmailStatusBadge, escHtml, BRAND,
} from '../../design-system.ts';

function validate(vars: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!vars.customer_name || typeof vars.customer_name !== 'string') errors.push('customer_name is required');
  if (!vars.ticket_number || typeof vars.ticket_number !== 'string') errors.push('ticket_number is required');
  if (!vars.ticket_subject || typeof vars.ticket_subject !== 'string') errors.push('ticket_subject is required');
  if (!vars.ticket_url || typeof vars.ticket_url !== 'string') errors.push('ticket_url is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as SupportTicketResolvedEmailVars;
  const firstName = v.customer_name.split(' ')[0];

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`Your support ticket ${v.ticket_number} has been resolved.`)}
    <div style="margin-bottom:16px;">
      ${EmailStatusBadge('Resolved', 'success')}
    </div>
    ${EmailHeading(`Your ticket has been resolved`)}
    ${EmailText(`Hi ${escHtml(firstName)}, we're pleased to let you know that your support ticket has been resolved.`)}
    ${EmailDivider()}
    ${EmailInfoRow('Ticket Number', v.ticket_number)}
    ${EmailInfoRow('Subject', v.ticket_subject)}
    ${v.resolution_summary ? `${EmailDivider()}${EmailLabel('Resolution Summary')}${EmailText(escHtml(v.resolution_summary), { muted: true })}` : ''}
    ${EmailDivider()}
    ${EmailText(`If you have any further questions or if this issue recurs, please don't hesitate to reach out again.`, { muted: true })}
    ${EmailButton('View Ticket', v.ticket_url)}
    ${EmailText(`Thank you for your patience. We're always here to help.`, { small: true, muted: true })}
  `);

  return EmailLayout(content, `Ticket ${v.ticket_number} resolved — Fameuxarte`);
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as SupportTicketResolvedEmailVars;
  const firstName = v.customer_name.split(' ')[0];
  return `Hi ${firstName},

Your support ticket has been resolved.

Ticket Number: ${v.ticket_number}
Subject: ${v.ticket_subject}
${v.resolution_summary ? `\nResolution: ${v.resolution_summary}\n` : ''}

If you need further assistance, please don't hesitate to open a new ticket.

View ticket: ${v.ticket_url}

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const supportTicketResolvedTemplate: TemplateDefinition = {
  type: 'support_ticket_resolved',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'Your support ticket has been resolved — Fameuxarte',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
