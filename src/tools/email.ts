/**
 * Email Tools for Teamleader Focus
 * 
 * NOTE: Teamleader Focus API does NOT have a direct emails.send endpoint
 * for sending arbitrary emails.
 * 
 * Available email-related functionality:
 * - emailTracking.create - Track/log an email sent externally
 * - emailTracking.list - List tracked emails
 * - invoices.send - Send invoice via email (document-specific)
 * - quotations.send - Send quotation via email (document-specific)
 * 
 * For arbitrary email sending, integrate with external email services
 * (SendGrid, Mailgun, SMTP, etc.) and use emailTracking to log them.
 */

import { z } from 'zod';
import type { TeamleaderClient, ApiResponse, CreateResponse } from '../client/teamleader.js';

// Email tracking schemas
export const EmailTrackingCreateSchema = z.object({
  subject: z.string().describe('Email subject'),
  body: z.string().describe('Email body (HTML supported)'),
  from: z.string().email().describe('Sender email address'),
  to: z.array(z.string().email()).describe('Recipient email addresses'),
  cc: z.array(z.string().email()).optional().describe('CC recipients'),
  bcc: z.array(z.string().email()).optional().describe('BCC recipients'),
  sent_at: z.string().optional().describe('When the email was sent (ISO 8601)'),
  // Link to Teamleader entity
  subject_type: z.enum(['contact', 'company', 'deal', 'nextgenProject']).describe('Type of linked entity'),
  subject_id: z.string().uuid().describe('ID of linked entity'),
}).strict();

export type EmailTrackingCreateInput = z.infer<typeof EmailTrackingCreateSchema>;

// Email tracking response types
export interface EmailTrackingAttachment {
  filename: string;
  url: string;
}

export interface EmailTracking {
  id: string;
  subject: string;
  body: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  sent_at: string;
  subject_type: string;
  subject_id: string;
  attachments: EmailTrackingAttachment[];
}

export interface EmailTrackingFilter {
  subject_type?: 'contact' | 'company' | 'deal' | 'nextgenProject';
  subject_id?: string;
}

/**
 * Track an externally sent email in Teamleader
 * 
 * Use this to log emails sent through external email services
 * (SendGrid, Mailgun, SMTP, etc.) so they appear in Teamleader's
 * activity timeline for the linked contact/company/deal.
 */
export async function trackEmail(
  client: TeamleaderClient,
  input: EmailTrackingCreateInput
): Promise<CreateResponse> {
  const validated = EmailTrackingCreateSchema.parse(input);
  
  const body: Record<string, unknown> = {
    subject: validated.subject,
    body: validated.body,
    from: validated.from,
    to: validated.to,
    // Link to Teamleader entity
    linked_subject: {
      type: validated.subject_type,
      id: validated.subject_id,
    },
  };
  
  if (validated.cc && validated.cc.length > 0) {
    body.cc = validated.cc;
  }
  if (validated.bcc && validated.bcc.length > 0) {
    body.bcc = validated.bcc;
  }
  if (validated.sent_at) {
    body.sent_at = validated.sent_at;
  }
  
  return client.create('emailTracking.create', body);
}

/**
 * List tracked emails
 */
export async function listTrackedEmails(
  client: TeamleaderClient,
  filter: EmailTrackingFilter = {},
  page?: { size?: number; number?: number }
): Promise<ApiResponse<EmailTracking[]>> {
  const body: Record<string, unknown> = {};
  
  if (filter.subject_type && filter.subject_id) {
    body.filter = {
      subject: {
        type: filter.subject_type,
        id: filter.subject_id,
      },
    };
  }
  
  if (page) {
    body.page = {
      size: page.size || 20,
      number: page.number || 1,
    };
  }
  
  return client.request<EmailTracking[]>('emailTracking.list', body);
}

// Invoice sending (document-specific)
export interface InvoiceRecipients {
  to?: Array<{ email: string; name?: string }>;
  cc?: Array<{ email: string; name?: string }>;
  bcc?: Array<{ email: string; name?: string }>;
}

/**
 * Send an invoice via email
 * 
 * This sends the invoice document (PDF) to the specified recipients.
 */
export async function sendInvoice(
  client: TeamleaderClient,
  invoiceId: string,
  recipients: InvoiceRecipients,
  options?: {
    mail_template_id?: string;
  }
): Promise<void> {
  z.string().uuid().parse(invoiceId);
  
  const body: Record<string, unknown> = {
    id: invoiceId,
    recipients,
  };
  
  if (options?.mail_template_id) {
    body.mail_template_id = options.mail_template_id;
  }
  
  await client.request('invoices.send', body);
}

// Quotation sending (document-specific)
export interface QuotationRecipients {
  to?: Array<{ email: string; name?: string }>;
  cc?: Array<{ email: string; name?: string }>;
  bcc?: Array<{ email: string; name?: string }>;
}

/**
 * Send a quotation via email
 * 
 * This sends the quotation document to the specified recipients.
 */
export async function sendQuotation(
  client: TeamleaderClient,
  quotationId: string,
  recipients: QuotationRecipients
): Promise<void> {
  z.string().uuid().parse(quotationId);
  
  const body: Record<string, unknown> = {
    id: quotationId,
    recipients,
  };
  
  await client.request('quotations.send', body);
}
