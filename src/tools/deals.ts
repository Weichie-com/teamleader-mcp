/**
 * Deals Tools for Teamleader Focus
 * 
 * API Endpoints:
 * - POST deals.list - List deals
 * - POST deals.info - Get deal details
 * - POST deals.create - Create a new deal
 * - POST deals.update - Update a deal
 * - POST deals.move - Move deal to different phase
 * - POST deals.win - Mark deal as won
 * - POST deals.lose - Mark deal as lost
 * - POST deals.delete - Delete a deal
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

const CustomFieldValueSchema = z.object({
  id: z.string().uuid(),
  value: z.unknown(),
});

// Filter schema for listing deals
export const DealsListFilterSchema = z.object({
  ids: z.array(z.string().uuid()).optional(),
  term: z.string().optional().describe('Filters on title, reference and customer name'),
  customer: CustomerSchema.optional(),
  phase_id: z.string().uuid().optional(),
  estimated_closing_date: z.string().optional().nullable(),
  estimated_closing_date_from: z.string().optional(),
  estimated_closing_date_until: z.string().optional(),
  responsible_user_id: z.union([
    z.string().uuid(),
    z.array(z.string().uuid()),
  ]).optional(),
  updated_since: z.string().optional(),
  created_before: z.string().optional(),
  status: z.array(z.enum(['open', 'won', 'lost'])).optional(),
  pipeline_ids: z.array(z.string().uuid()).optional(),
}).strict();

// Schema for creating a deal
export const DealCreateSchema = z.object({
  lead: z.object({
    customer: CustomerSchema,
    contact_person_id: z.string().uuid().optional(),
  }),
  title: z.string().min(1),
  summary: z.string().optional(),
  source_id: z.string().uuid().optional(),
  department_id: z.string().uuid().optional(),
  responsible_user_id: z.string().uuid().optional(),
  phase_id: z.string().uuid().optional(),
  estimated_value: MoneySchema.optional(),
  estimated_probability: z.number().min(0).max(1).optional().describe('A number between 0 and 1'),
  estimated_closing_date: z.string().optional(),
  custom_fields: z.array(CustomFieldValueSchema).optional(),
  currency: z.object({
    code: z.string().length(3),
    exchange_rate: z.number(),
  }).optional(),
}).strict();

// Schema for updating a deal
export const DealUpdateSchema = z.object({
  id: z.string().uuid(),
  lead: z.object({
    customer: CustomerSchema,
    contact_person_id: z.string().uuid().optional(),
  }).optional(),
  title: z.string().min(1).optional(),
  summary: z.string().optional().nullable(),
  source_id: z.string().uuid().optional().nullable(),
  department_id: z.string().uuid().optional().nullable(),
  responsible_user_id: z.string().uuid().optional().nullable(),
  estimated_value: MoneySchema.optional().nullable(),
  estimated_probability: z.number().min(0).max(1).optional().nullable(),
  estimated_closing_date: z.string().optional().nullable(),
  custom_fields: z.array(CustomFieldValueSchema).optional(),
  currency: z.object({
    code: z.string().length(3),
    exchange_rate: z.number(),
  }).optional(),
}).strict();

export type DealsListFilter = z.infer<typeof DealsListFilterSchema>;
export type DealCreateInput = z.infer<typeof DealCreateSchema>;
export type DealUpdateInput = z.infer<typeof DealUpdateSchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface Money {
  amount: number;
  currency: string;
}

export interface Deal {
  id: string;
  title: string;
  summary: string | null;
  reference: string;
  status: 'new' | 'open' | 'won' | 'lost';
  lead: {
    customer: {
      type: 'contact' | 'company';
      id: string;
    };
    contact_person?: {
      type: string;
      id: string;
    } | null;
  };
  department?: {
    type: string;
    id: string;
  };
  estimated_value?: Money;
  estimated_closing_date: string | null;
  estimated_probability: number | null;
  weighted_value?: Money;
  purchase_order_number: string | null;
  current_phase: {
    type: string;
    id: string;
  };
  responsible_user: {
    type: string;
    id: string;
  };
  closed_at: string | null;
  source?: {
    type: string;
    id: string;
  } | null;
  phase_history?: Array<{
    phase: {
      type: string;
      id: string;
    };
    started_at: string;
    started_by: {
      type: string;
      id: string;
    };
  }>;
  quotations?: Array<{
    id: string;
    type: string;
  }>;
  lost_reason: {
    reason: {
      type: string;
      id: string;
    } | null;
    remark: string | null;
  } | null;
  created_at: string;
  updated_at: string;
  web_url: string;
  custom_fields?: Array<{ id: string; value: unknown }>;
  currency_exchange_rate?: {
    from: string;
    to: string;
    rate: number;
  };
  pipeline?: {
    type: string;
    id: string;
  };
}

// ============================================================================
// TOOL FUNCTIONS
// ============================================================================

/**
 * List deals with optional filters
 */
export async function listDeals(
  client: TeamleaderClient,
  filter: DealsListFilter = {},
  page?: { size?: number; number?: number },
  sort?: Array<{ field: 'created_at' | 'weighted_value'; order?: 'asc' | 'desc' }>,
  includes?: string[]
): Promise<ApiResponse<Deal[]>> {
  const validatedFilter = DealsListFilterSchema.parse(filter);
  
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
  
  if (sort) {
    body.sort = sort;
  }
  
  if (includes && includes.length > 0) {
    body.includes = includes.join(',');
  }
  
  return client.request<Deal[]>('deals.list', body);
}

/**
 * Get deal details by ID
 */
export async function getDealInfo(
  client: TeamleaderClient,
  id: string
): Promise<ApiResponse<Deal>> {
  z.string().uuid().parse(id);
  
  return client.request<Deal>('deals.info', { id });
}

/**
 * Create a new deal
 */
export async function createDeal(
  client: TeamleaderClient,
  input: DealCreateInput
): Promise<CreateResponse> {
  const validated = DealCreateSchema.parse(input);
  
  return client.create('deals.create', validated);
}

/**
 * Update an existing deal
 */
export async function updateDeal(
  client: TeamleaderClient,
  input: DealUpdateInput
): Promise<void> {
  const validated = DealUpdateSchema.parse(input);
  
  await client.request('deals.update', validated);
}

/**
 * Move a deal to a different phase
 */
export async function moveDeal(
  client: TeamleaderClient,
  id: string,
  phaseId: string
): Promise<void> {
  z.string().uuid().parse(id);
  z.string().uuid().parse(phaseId);
  
  await client.request('deals.move', { id, phase_id: phaseId });
}

/**
 * Mark a deal as won
 */
export async function winDeal(
  client: TeamleaderClient,
  id: string
): Promise<void> {
  z.string().uuid().parse(id);
  
  await client.request('deals.win', { id });
}

/**
 * Mark a deal as lost
 */
export async function loseDeal(
  client: TeamleaderClient,
  id: string,
  reasonId?: string,
  extraInfo?: string
): Promise<void> {
  z.string().uuid().parse(id);
  if (reasonId) z.string().uuid().parse(reasonId);
  
  const body: Record<string, unknown> = { id };
  if (reasonId) body.reason_id = reasonId;
  if (extraInfo) body.extra_info = extraInfo;
  
  await client.request('deals.lose', body);
}

/**
 * Delete a deal
 */
export async function deleteDeal(
  client: TeamleaderClient,
  id: string
): Promise<void> {
  z.string().uuid().parse(id);
  
  await client.request('deals.delete', { id });
}

/**
 * List deal phases
 */
export async function listDealPhases(
  client: TeamleaderClient,
  filter?: { ids?: string[]; deal_pipeline_id?: string },
  page?: { size?: number; number?: number }
): Promise<ApiResponse<Array<{
  id: string;
  name: string;
  actions?: string[];
  requires_attention_after?: {
    amount: number;
    unit: 'days' | 'weeks';
  };
  probability?: number;
}>>> {
  const body: Record<string, unknown> = {};
  
  if (filter) {
    body.filter = filter;
  }
  
  if (page) {
    body.page = {
      size: page.size || 20,
      number: page.number || 1,
    };
  }
  
  return client.request('dealPhases.list', body);
}

/**
 * List lost reasons
 */
export async function listLostReasons(
  client: TeamleaderClient,
  filter?: { ids?: string[] },
  page?: { size?: number; number?: number }
): Promise<ApiResponse<Array<{
  id: string;
  name: string;
}>>> {
  const body: Record<string, unknown> = {};
  
  if (filter) {
    body.filter = filter;
  }
  
  if (page) {
    body.page = {
      size: page.size || 20,
      number: page.number || 1,
    };
  }
  
  return client.request('lostReasons.list', body);
}
