/**
 * Quotations Tools for Teamleader Focus
 * 
 * API Endpoints:
 * - POST quotations.list - List quotations
 * - POST quotations.info - Get quotation details  
 * - POST quotations.create - Create a new quotation
 * - POST quotations.send - Send a quotation via email
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

const PeriodicitySchema = z.object({
  unit: z.enum(['day', 'week', 'month', 'quarter', 'year']),
  period: z.number(),
}).nullable().optional();

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
  periodicity: PeriodicitySchema,
});

const GroupedLinesSchema = z.object({
  section: z.object({
    title: z.string(),
  }).optional(),
  line_items: z.array(LineItemSchema),
});

const DiscountSchema = z.object({
  description: z.string(),
  type: z.enum(['percentage', 'amount']),
  value: z.number(),
});

const CurrencySchema = z.object({
  code: z.string().default('EUR'),
  exchange_rate: z.number().optional(),
});

const ExpirySchema = z.object({
  expires_after: z.string().nullable(),
  action_after_expiry: z.enum(['lock', 'none']),
});

// Filter schemas
export const QuotationsListFilterSchema = z.object({
  ids: z.array(z.string().uuid()).optional(),
  status: z.enum(['open', 'accepted', 'expired', 'rejected', 'closed']).optional(),
}).strict();

export const QuotationCreateSchema = z.object({
  deal_id: z.string().uuid(),
  name: z.string().optional(),
  currency: CurrencySchema.optional(),
  grouped_lines: z.array(GroupedLinesSchema).optional(),
  discounts: z.array(DiscountSchema).optional(),
  text: z.string().optional(),
  document_template_id: z.string().uuid().optional(),
  expiry: ExpirySchema.optional(),
}).strict();

export const QuotationSendSchema = z.object({
  quotations: z.array(z.string().uuid()),
  from: z.object({
    sender: z.object({
      type: z.enum(['user', 'department']),
      id: z.string().uuid(),
    }),
    email_address: z.string().email(),
  }).optional(),
  recipients: z.object({
    to: z.array(z.object({
      customer: CustomerSchema.optional().nullable(),
      email_address: z.string().email(),
    })),
    cc: z.array(z.object({
      customer: CustomerSchema.optional().nullable(),
      email_address: z.string().email(),
    })).optional(),
    bcc: z.array(z.object({
      customer: CustomerSchema.optional().nullable(),
      email_address: z.string().email(),
    })).optional(),
  }),
  subject: z.string(),
  content: z.string(),
  attachments: z.array(z.string().uuid()).optional(),
  language: z.string(),
}).strict();

export type QuotationsListFilter = z.infer<typeof QuotationsListFilterSchema>;
export type QuotationCreateInput = z.infer<typeof QuotationCreateSchema>;
export type QuotationSendInput = z.infer<typeof QuotationSendSchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface Money {
  amount: number;
  currency: string;
}

export interface QuotationLineItem {
  product: { type: string; id: string } | null;
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
  purchase_price: Money | null;
  total: {
    tax_exclusive: Money;
    tax_exclusive_before_discount: Money;
    tax_inclusive: Money;
    tax_inclusive_before_discount: Money;
  };
  periodicity: {
    unit: string;
    period: number;
  } | null;
}

export interface QuotationGroupedLine {
  section: {
    title: string;
  };
  line_items: QuotationLineItem[];
}

export interface Quotation {
  id: string;
  deal: {
    type: string;
    id: string;
  };
  grouped_lines?: QuotationGroupedLine[];
  currency?: string;
  currency_exchange_rate: {
    from: string;
    to: string;
    rate: number;
  };
  total: {
    tax_exclusive: Money;
    tax_inclusive: Money;
    taxes: Array<{
      rate: number;
      taxable: Money;
      tax: Money;
    }>;
    purchase_price: Money | null;
  };
  discounts?: Array<{
    description: string;
    type: 'percentage' | 'amount';
    value: number;
  }>;
  created_at: string | null;
  updated_at: string | null;
  status: 'open' | 'accepted' | 'expired' | 'rejected' | 'closed';
  name: string;
  document_template?: {
    type: string;
    id: string;
  };
  expiry?: {
    expires_after: string;
    action_after_expiry: 'lock' | 'none';
  };
}

// ============================================================================
// TOOL FUNCTIONS
// ============================================================================

/**
 * List quotations with optional filters
 */
export async function listQuotations(
  client: TeamleaderClient,
  filter: QuotationsListFilter = {},
  page?: { size?: number; number?: number }
): Promise<ApiResponse<Quotation[]>> {
  const validatedFilter = QuotationsListFilterSchema.parse(filter);
  
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
  
  return client.request<Quotation[]>('quotations.list', body);
}

/**
 * Get quotation details by ID
 */
export async function getQuotationInfo(
  client: TeamleaderClient,
  id: string,
  includes?: string[]
): Promise<ApiResponse<Quotation>> {
  z.string().uuid().parse(id);
  
  const body: Record<string, unknown> = { id };
  
  if (includes && includes.length > 0) {
    body.includes = includes.join(',');
  }
  
  return client.request<Quotation>('quotations.info', body);
}

/**
 * Create a new quotation
 */
export async function createQuotation(
  client: TeamleaderClient,
  input: QuotationCreateInput
): Promise<CreateResponse> {
  const validated = QuotationCreateSchema.parse(input);
  
  const body: Record<string, unknown> = {
    deal_id: validated.deal_id,
  };
  
  if (validated.name) body.name = validated.name;
  if (validated.currency) body.currency = validated.currency;
  if (validated.grouped_lines) body.grouped_lines = validated.grouped_lines;
  if (validated.discounts) body.discounts = validated.discounts;
  if (validated.text) body.text = validated.text;
  if (validated.document_template_id) body.document_template_id = validated.document_template_id;
  if (validated.expiry) body.expiry = validated.expiry;
  
  return client.create('quotations.create', body);
}

/**
 * Update an existing quotation
 */
export async function updateQuotation(
  client: TeamleaderClient,
  id: string,
  input: Partial<Omit<QuotationCreateInput, 'deal_id'>>
): Promise<void> {
  z.string().uuid().parse(id);
  
  const body: Record<string, unknown> = { id };
  
  if (input.name) body.name = input.name;
  if (input.currency) body.currency = input.currency;
  if (input.grouped_lines) body.grouped_lines = input.grouped_lines;
  if (input.discounts) body.discounts = input.discounts;
  if (input.text !== undefined) body.text = input.text;
  if (input.document_template_id) body.document_template_id = input.document_template_id;
  if (input.expiry) body.expiry = input.expiry;
  
  await client.request('quotations.update', body);
}

/**
 * Send quotation(s) via email
 */
export async function sendQuotation(
  client: TeamleaderClient,
  input: QuotationSendInput
): Promise<void> {
  const validated = QuotationSendSchema.parse(input);
  
  const body: Record<string, unknown> = {
    quotations: validated.quotations,
    recipients: validated.recipients,
    subject: validated.subject,
    content: validated.content,
    language: validated.language,
  };
  
  if (validated.from) body.from = validated.from;
  if (validated.attachments) body.attachments = validated.attachments;
  
  await client.request('quotations.send', body);
}

/**
 * Accept a quotation
 */
export async function acceptQuotation(
  client: TeamleaderClient,
  id: string
): Promise<void> {
  z.string().uuid().parse(id);
  
  await client.request('quotations.accept', { id });
}

/**
 * Delete a quotation
 */
export async function deleteQuotation(
  client: TeamleaderClient,
  id: string
): Promise<void> {
  z.string().uuid().parse(id);
  
  await client.request('quotations.delete', { id });
}

/**
 * Download a quotation as PDF
 */
export async function downloadQuotation(
  client: TeamleaderClient,
  id: string,
  format: 'pdf' = 'pdf'
): Promise<ApiResponse<{ location: string; expires: string }>> {
  z.string().uuid().parse(id);
  
  return client.request('quotations.download', { id, format });
}
