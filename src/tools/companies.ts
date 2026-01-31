/**
 * Companies Tools for Teamleader Focus
 * 
 * API Endpoints:
 * - POST companies.list - List companies
 * - POST companies.info - Get company details
 * - POST companies.add - Create a new company
 * - POST companies.update - Update a company
 */

import { z } from 'zod';
import type { TeamleaderClient, ApiResponse, CreateResponse } from '../client/teamleader.js';

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const EmailSchema = z.object({
  type: z.enum(['primary', 'invoicing']),
  email: z.string().email(),
});

const TelephoneSchema = z.object({
  type: z.enum(['phone', 'mobile', 'fax']),
  number: z.string(),
});

const AddressSchema = z.object({
  line_1: z.string().nullable().optional(),
  postal_code: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().length(2),
  area_level_two_id: z.string().uuid().optional(),
});

const AddressWithTypeSchema = z.object({
  type: z.enum(['primary', 'invoicing', 'delivery', 'visiting']),
  address: AddressSchema,
});

const PaymentTermSchema = z.object({
  type: z.enum(['cash', 'end_of_month', 'after_invoice_date']),
  days: z.number().optional(),
});

const CustomFieldValueSchema = z.object({
  id: z.string().uuid(),
  value: z.unknown(),
});

// Filter schema for listing
export const CompaniesListFilterSchema = z.object({
  email: z.object({
    type: z.enum(['primary']),
    email: z.string().email(),
  }).optional(),
  ids: z.array(z.string().uuid()).optional(),
  term: z.string().optional().describe('Search term for name, VAT number, emails and telephones'),
  updated_since: z.string().optional(),
  tags: z.array(z.string()).optional(),
  vat_number: z.string().optional(),
  status: z.enum(['active', 'deactivated']).optional(),
}).strict();

// Schema for creating a company
export const CompanyCreateSchema = z.object({
  name: z.string().min(1),
  business_type_id: z.string().uuid().optional(),
  vat_number: z.string().optional(),
  national_identification_number: z.string().optional(),
  emails: z.array(EmailSchema).optional(),
  telephones: z.array(TelephoneSchema).optional(),
  website: z.string().url().optional(),
  addresses: z.array(AddressWithTypeSchema).optional(),
  iban: z.string().optional(),
  bic: z.string().optional(),
  language: z.string().optional(),
  responsible_user_id: z.string().uuid().optional(),
  remarks: z.string().optional().describe('Uses Markdown formatting'),
  tags: z.array(z.string()).optional(),
  custom_fields: z.array(CustomFieldValueSchema).optional(),
  marketing_mails_consent: z.boolean().optional(),
  preferred_currency: z.string().length(3).optional(),
}).strict();

// Schema for updating a company
export const CompanyUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  business_type_id: z.string().uuid().optional().nullable(),
  vat_number: z.string().optional().nullable(),
  national_identification_number: z.string().optional().nullable(),
  emails: z.array(EmailSchema).optional(),
  telephones: z.array(TelephoneSchema).optional(),
  website: z.string().url().optional().nullable(),
  addresses: z.array(AddressWithTypeSchema).optional(),
  iban: z.string().optional().nullable(),
  bic: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  responsible_user_id: z.string().uuid().optional().nullable(),
  remarks: z.string().optional().nullable().describe('Uses Markdown formatting'),
  tags: z.array(z.string()).optional().describe('This will overwrite existing tags'),
  custom_fields: z.array(CustomFieldValueSchema).optional(),
  marketing_mails_consent: z.boolean().optional(),
  preferred_currency: z.string().length(3).optional().nullable(),
}).strict();

export type CompaniesListFilter = z.infer<typeof CompaniesListFilterSchema>;
export type CompanyCreateInput = z.infer<typeof CompanyCreateSchema>;
export type CompanyUpdateInput = z.infer<typeof CompanyUpdateSchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface CompanyAddress {
  line_1: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
  area_level_two?: {
    type: string;
    id: string;
  } | null;
}

export interface Company {
  id: string;
  name: string;
  status: 'active' | 'deactivated';
  business_type?: {
    type: string;
    id: string;
  };
  vat_number: string | null;
  national_identification_number: string | null;
  emails: Array<{
    type: 'primary' | 'invoicing';
    email: string;
  }>;
  telephones: Array<{
    type: 'phone' | 'mobile' | 'fax';
    number: string;
  }>;
  website: string | null;
  primary_address?: CompanyAddress | null;
  addresses?: Array<{
    type: 'primary' | 'invoicing' | 'delivery' | 'visiting';
    address: CompanyAddress;
  }>;
  iban: string | null;
  bic: string | null;
  language: string | null;
  preferred_currency: string | null;
  payment_term: {
    type: string;
    days?: number;
  } | null;
  invoicing_preferences: {
    electronic_invoicing_address: string | null;
  };
  responsible_user?: {
    type: string;
    id: string;
  } | null;
  remarks?: string;
  added_at: string;
  updated_at: string;
  web_url: string;
  tags: string[];
  custom_fields?: Array<{ id: string; value: unknown }>;
  marketing_mails_consent?: boolean;
  related_companies?: Array<{ type: string; id: string }>;
  related_contacts?: Array<{
    type: string;
    id: string;
    position: string | null;
    secondary_position: string | null;
    division: string | null;
    is_decision_maker: boolean;
  }>;
}

// ============================================================================
// TOOL FUNCTIONS
// ============================================================================

/**
 * List companies with optional filters
 */
export async function listCompanies(
  client: TeamleaderClient,
  filter: CompaniesListFilter = {},
  page?: { size?: number; number?: number },
  sort?: Array<{ field: 'name' | 'added_at' | 'updated_at'; order?: 'asc' | 'desc' }>,
  includes?: string[]
): Promise<ApiResponse<Company[]>> {
  const validatedFilter = CompaniesListFilterSchema.parse(filter);
  
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
  
  return client.request<Company[]>('companies.list', body);
}

/**
 * Get company details by ID
 */
export async function getCompanyInfo(
  client: TeamleaderClient,
  id: string,
  includes?: string[]
): Promise<ApiResponse<Company>> {
  z.string().uuid().parse(id);
  
  const body: Record<string, unknown> = { id };
  
  if (includes && includes.length > 0) {
    body.includes = includes.join(',');
  }
  
  return client.request<Company>('companies.info', body);
}

/**
 * Create a new company
 */
export async function createCompany(
  client: TeamleaderClient,
  input: CompanyCreateInput
): Promise<CreateResponse> {
  const validated = CompanyCreateSchema.parse(input);
  
  return client.create('companies.add', validated);
}

/**
 * Update an existing company
 */
export async function updateCompany(
  client: TeamleaderClient,
  input: CompanyUpdateInput
): Promise<void> {
  const validated = CompanyUpdateSchema.parse(input);
  
  await client.request('companies.update', validated);
}

/**
 * Delete a company
 */
export async function deleteCompany(
  client: TeamleaderClient,
  id: string
): Promise<void> {
  z.string().uuid().parse(id);
  
  await client.request('companies.delete', { id });
}

/**
 * Add tags to a company
 */
export async function tagCompany(
  client: TeamleaderClient,
  id: string,
  tags: string[]
): Promise<void> {
  z.string().uuid().parse(id);
  z.array(z.string()).min(1).parse(tags);
  
  await client.request('companies.tag', { id, tags });
}

/**
 * Remove tags from a company
 */
export async function untagCompany(
  client: TeamleaderClient,
  id: string,
  tags: string[]
): Promise<void> {
  z.string().uuid().parse(id);
  z.array(z.string()).min(1).parse(tags);
  
  await client.request('companies.untag', { id, tags });
}
