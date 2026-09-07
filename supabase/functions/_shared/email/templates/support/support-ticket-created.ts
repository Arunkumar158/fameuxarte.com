/**
 * templates/support/support-ticket-created.ts
 * Auto-response when a support ticket is created
 */

import type { TemplateDefinition, SupportTicketCreatedEmailVars, ValidationResult } from '../../types.ts';
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
  if (!vars.ticket_category || typeof vars.ticket_category !== 'string') errors.push('ticket_category is required');
  if (!vars.created_at || typeof vars.created_at !== 'string') errors.push('created_at is required');
  if (!vars.ticket_url || typeof vars.ticket_url !== 'string') errors.push('ticket_url is required');
  return { valid: errors.length === 0, errors };
}

function renderHtml(vars: Record<string, unknown>): string {
  const v = vars as SupportTicketCreatedEmailVars;
  const firstName = v.customer_name.split(' ')[0];

  const content = EmailCard(`
    ${EmailAccentBar()}
    ${EmailPreheader(`Support ticket ${v.ticket_number} received. Our team will respond within 24 hours.`)}
    <div style="margin-bottom:16px;">
      ${EmailStatusBadge('Ticket Open', 'info')}
    </div>
    ${EmailHeading(`We've received your request, ${escHtml(firstName)}.`)}
    ${EmailText(`Your support ticket has been created. Our team typically responds within <strong style="color:${BRAND.colors.linen};">24 hours</strong> during business days.`)}
    ${EmailDivider()}
    ${EmailLabel('Ticket Details')}
    ${EmailInfoRow('Ticket Number', v.ticket_number)}
    ${EmailInfoRow('Subject', v.ticket_subject)}
    ${EmailInfoRow('Category', v.ticket_category)}
    ${EmailInfoRow('Created', v.created_at)}
    ${EmailDivider()}
    ${EmailText(`You can track the status of your ticket and view any replies in the support centre.`, { muted: true })}
    ${EmailButton('View Ticket', v.ticket_url)}
    ${EmailText(`Please do not create duplicate tickets for the same issue. All replies will be sent to this email address.`, { small: true, muted: true })}
  `);

  return EmailLayout(content, `Support ticket ${v.ticket_number} received`);
}

function renderText(vars: Record<string, unknown>): string {
  const v = vars as SupportTicketCreatedEmailVars;
  const firstName = v.customer_name.split(' ')[0];
  return `Hi ${firstName},

Your support ticket has been created.

Ticket Number: ${v.ticket_number}
Subject: ${v.ticket_subject}
Category: ${v.ticket_category}
Created: ${v.created_at}

Our team typically responds within 24 hours during business days.

View your ticket: ${v.ticket_url}

© ${BRAND.brand.year} Fameuxarte. All rights reserved.
`;
}

export const supportTicketCreatedTemplate: TemplateDefinition = {
  type: 'support_ticket_created',
  version: '1.0',
  category: 'transactional',
  defaultSubject: 'Support ticket received — Fameuxarte',
  from: 'Fameuxarte <noreply@fameuxarte.com>',
  renderHtml,
  renderText,
  validate,
};
