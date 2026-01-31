/**
 * Invoices Tools for Teamleader Focus
 * 
 * API Endpoints:
 * - POST invoices.list - List invoices
 * - POST invoices.info - Get invoice details
 * - POST invoices.draft - Create a draft invoice
 * - POST invoices.send - Send an invoice via email
 */

import { z } from 'zod';
import type { TeamleaderClient, ApiResponse, CreateResponse } from '../client/teamleader.js';

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const CustomerSchema = z.object({
  type: z.enum(['contact', 'company']),
  id: z.string().uuid(),
});

const MoneySchema = z.object({
  amount: z.number(),
  currency: z.string().default('EUR'),
});

const UnitPriceSchema = z.object({
  amount: z.number(),
  tax: z.enum(['excluding', 'including']).default('excluding'),
});

const LineItemSchema = z.object({
  quantity: z.number().positive(),
  description: z.string(),
  extended_description: z.string().optional(),
  unit_of_measure_id: z.string().uuid().optional().nullable(),
  unit_price: UnitPriceSchema,
  tax_rate_id: z.string().uuid(),
  discount: z.object({
    value: z.number(),
    type: z.enum(['percentage']),
  }).optional(),
  product_id: z.string().uuid().optional(),
  purchase_price: MoneySchema.optional().nullable(),
});

const GroupedLinesSchema = z.object({
  section: z.object({
    title: z.string(),
  }).optional(),
  line_items: z.array(LineItemSchema),
});

const ForAttentionOfSchema = z.union([
  z.object({ name: z.string() }),
  z.object({ contact_id: z.string().uuid() }),
]);

const InvoiceeSchema = z.object({
  customer: CustomerSchema,
  for_attention_of: ForAttentionOfSchema.optional(),
});

const PaymentTermSchema = z.object({
  type: z.enum(['cash', 'end_of_month', 'after_invoice_date']),
  days: z.number().optional(),
});

// Filter schemas
export const InvoicesListFilterSchema = z.object({
  ids: z.array(z.string().uuid()).optional(),
  term: z.string().optional().describe('Search term for invoice number, customer name, etc.'),
  invoice_number: z.string().optional(),
  department_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  subscription_id: z.string().uuid().optional(),
  status: z.array(z.enum(['draft', 'outstanding', 'matched'])).optional(),
  updated_since: z.string().optional(),
  purchase_order_number: z.string().optional(),
  payment_reference: z.string().optional(),
  invoice_date_after: z.string().optional(),
  invoice_date_before: z.string().optional(),
  customer: CustomerSchema.optional(),
}).strict();

export const InvoiceDraftSchema = z.object({
  invoicee: InvoiceeSchema,
  department_id: z.string().uuid(),
  payment_term: PaymentTermSchema,
  currency: z.object({
    code: z.string().default('EUR'),
    exchange_rate: z.number().optional(),
  }).optional(),
  project_id: z.string().uuid().optional(),
  purchase_order_number: z.string().optional(),
  grouped_lines: z.array(GroupedLinesSchema),
  invoice_date: z.string().optional(),
  discounts: z.array(z.object({
    description: z.string(),
    type: z.enum(['percentage', 'amount']),
    value: z.number(),
  })).optional(),
  note: z.string().optional(),
  custom_fields: z.array(z.object({
    id: z.string().uuid(),
    value: z.unknown(),
  })).optional(),
  document_template_id: z.string().uuid().optional(),
}).strict();

export const InvoiceSendSchema = z.object({
  id: z.string().uuid(),
  content: z.object({
    subject: z.string(),
    body: z.string(),
    mail_template_id: z.string().uuid().optional().nullable(),
  }),
  recipients: z.object({
    to: z.array(z.object({
      customer: CustomerSchema.optional().nullable(),
      email: z.string().email(),
    })),
    cc: z.array(z.object({
      customer: CustomerSchema.optional().nullable(),
      email: z.string().email(),
    })).optional(),
    bcc: z.array(z.object({
      customer: CustomerSchema.optional().nullable(),
      email: z.string().email(),
    })).optional(),
  }).optional(),
  attachments: z.array(z.string().uuid()).optional(),
}).strict();

export type InvoicesListFilter = z.infer<typeof InvoicesListFilterSchema>;
export type InvoiceDraftInput = z.infer<typeof InvoiceDraftSchema>;
export type InvoiceSendInput = z.infer<typeof InvoiceSendSchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface Money {
  amount: number;
  currency: string;
}

export interface InvoiceLineItem {
  product: { type: string; id: string } | null;
  product_category: { type: string; id: string } | null;
  quantity: number;
  description: string;
  extended_description: string | null;
  unit: { type: string; id: string } | null;
  unit_price: {
    amount: number;
    tax: 'excluding' | 'including';
  };
  tax: {
    type: string;
    id: string;
  };
  discount: {
    type: 'percentage';
    value: number;
  } | null;
  total: {
    tax_exclusive: Money;
    tax_exclusive_before_discount: Money;
    tax_inclusive: Money;
    tax_inclusive_before_discount: Money;
  };
  withheld_tax: { type: string; id: string } | null;
}

export interface InvoiceGroupedLine {
  section: {
    title: string;
  };
  line_items: InvoiceLineItem[];
}

export interface Invoice {
  id: string;
  department: {
    type: string;
    id: string;
  };
  invoice_number: string | null;
  invoice_date: string | null;
  status: 'draft' | 'outstanding' | 'matched';
  due_on: string | null;
  paid: boolean;
  paid_at: string | null;
  sent: boolean;
  purchase_order_number: string | null;
  payment_reference: string | null;
  invoicee: {
    name: string;
    vat_number: string | null;
    customer: {
      type: string;
      id: string;
    };
    for_attention_of: {
      name: string | null;
      contact: { type: string; id: string } | null;
    } | null;
    email?: string | null;
    national_identification_number?: string | null;
  };
  total: {
    tax_exclusive: Money;
    tax_exclusive_before_discount?: Money;
    tax_inclusive: Money;
    tax_inclusive_before_discount?: Money;
    payable: Money;
    taxes: Array<{
      rate: number;
      taxable: Money;
      tax: Money;
    }>;
    withheld_taxes?: Array<{
      id: string;
      taxable: Money;
      withheld: Money;
    }>;
    due: Money;
  };
  discounts?: Array<{
    description: string;
    type: 'percentage' | 'amount';
    value: number;
  }>;
  grouped_lines?: InvoiceGroupedLine[];
  payment_term?: {
    type: string;
    days?: number;
  };
  payments?: Array<{
    paid_at: string;
    payment: Money;
  }>;
  note?: string | null;
  currency?: string;
  currency_exchange_rate: {
    from: string;
    to: string;
    rate: number;
  };
  expected_payment_method?: unknown | null;
  file: { type: string; id: string } | null;
  deal: { type: string; id: string } | null;
  project: { type: string; id: string } | null;
  on_hold_since?: string | null;
  custom_fields?: Array<{ id: string; value: unknown }>;
  created_at: string;
  updated_at: string;
  web_url?: string;
  document_template?: {
    type: string;
    id: string;
  };
}

// ============================================================================
// TOOL FUNCTIONS
// ============================================================================

/**
 * List invoices with optional filters
 */
export async function listInvoices(
  client: TeamleaderClient,
  filter: InvoicesListFilter = {},
  page?: { size?: number; number?: number }
): Promise<ApiResponse<Invoice[]>> {
  const validatedFilter = InvoicesListFilterSchema.parse(filter);
  
  const body: Record<string, unknown> = {};
  
  if (Object.keys(validatedFilter).length > 0) {
    body.filter = validatedFilter;
  }
  
  if (page) {
    body.page = {
      size: page.size || 20,
      number: page.number || 1,
    };
  }
  
  return client.request<Invoice[]>('invoices.list', body);
}

/**
 * Get invoice details by ID
 */
export async function getInvoiceInfo(
  client: TeamleaderClient,
  id: string,
  includes?: string[]
): Promise<ApiResponse<Invoice>> {
  z.string().uuid().parse(id);
  
  const body: Record<string, unknown> = { id };
  
  if (includes && includes.length > 0) {
    body.includes = includes.join(',');
  }
  
  return client.request<Invoice>('invoices.info', body);
}

/**
 * Create a draft invoice
 */
export async function draftInvoice(
  client: TeamleaderClient,
  input: InvoiceDraftInput
): Promise<CreateResponse> {
  const validated = InvoiceDraftSchema.parse(input);
  
  const body: Record<string, unknown> = {
    invoicee: validated.invoicee,
    department_id: validated.department_id,
    payment_term: validated.payment_term,
    grouped_lines: validated.grouped_lines,
  };
  
  if (validated.currency) body.currency = validated.currency;
  if (validated.project_id) body.project_id = validated.project_id;
  if (validated.purchase_order_number) body.purchase_order_number = validated.purchase_order_number;
  if (validated.invoice_date) body.invoice_date = validated.invoice_date;
  if (validated.discounts) body.discounts = validated.discounts;
  if (validated.note) body.note = validated.note;
  if (validated.custom_fields) body.custom_fields = validated.custom_fields;
  if (validated.document_template_id) body.document_template_id = validated.document_template_id;
  
  return client.create('invoices.draft', body);
}

/**
 * Send an invoice via email
 */
export async function sendInvoice(
  client: TeamleaderClient,
  input: InvoiceSendInput
): Promise<void> {
  const validated = InvoiceSendSchema.parse(input);
  
  const body: Record<string, unknown> = {
    id: validated.id,
    content: validated.content,
  };
  
  if (validated.recipients) body.recipients = validated.recipients;
  if (validated.attachments) body.attachments = validated.attachments;
  
  await client.request('invoices.send', body);
}

/**
 * Book a draft invoice
 */
export async function bookInvoice(
  client: TeamleaderClient,
  id: string,
  on: string
): Promise<void> {
  z.string().uuid().parse(id);
  z.string().parse(on); // Date string
  
  await client.request('invoices.book', { id, on });
}

/**
 * Delete an invoice (only draft or last booked)
 */
export async function deleteInvoice(
  client: TeamleaderClient,
  id: string
): Promise<void> {
  z.string().uuid().parse(id);
  
  await client.request('invoices.delete', { id });
}

/**
 * Register a payment for an invoice
 */
export async function registerPayment(
  client: TeamleaderClient,
  id: string,
  payment: Money,
  paidAt: string,
  paymentMethodId?: string
): Promise<void> {
  z.string().uuid().parse(id);
  
  const body: Record<string, unknown> = {
    id,
    payment,
    paid_at: paidAt,
  };
  
  if (paymentMethodId) {
    z.string().uuid().parse(paymentMethodId);
    body.payment_method_id = paymentMethodId;
  }
  
  await client.request('invoices.registerPayment', body);
}
