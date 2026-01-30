/**
 * Contacts Tools for Teamleader Focus
 * 
 * API Endpoints:
 * - POST contacts.list - List contacts
 * - POST contacts.info - Get contact details
 * - POST contacts.add - Create a new contact
 * - POST contacts.update - Update a contact
 * - POST contacts.delete - Delete a contact
 */

import { z } from 'zod';
import type { TeamleaderClient, ApiResponse, CreateResponse } from '../client/teamleader.js';

// Zod schemas for validation
export const ContactsListFilterSchema = z.object({
  name: z.string().optional().describe('Search by name (first or last)'),
  email: z.string().optional().describe('Search by email address'),
  term: z.string().optional().describe('General search term'),
  company_id: z.string().uuid().optional().describe('Filter by linked company'),
  tags: z.array(z.string()).optional().describe('Filter by tags'),
  status: z.enum(['active', 'deactivated']).optional().describe('Filter by status'),
  ids: z.array(z.string().uuid()).optional().describe('Filter by specific contact IDs'),
  updated_since: z.string().optional().describe('Filter by update date (ISO 8601)'),
}).strict();

export type ContactsListFilter = z.infer<typeof ContactsListFilterSchema>;

// Contact response types
export interface ContactEmail {
  type: 'primary' | 'invoicing';
  email: string;
}

export interface ContactTelephone {
  type: 'phone' | 'mobile' | 'fax';
  number: string;
}

export interface ContactAddress {
  type: 'primary' | 'invoicing' | 'delivery';
  address: {
    line_1: string;
    postal_code: string;
    city: string;
    country: string;
    area_level_two?: string;
  };
}

export interface ContactCompanyLink {
  company: {
    type: 'company';
    id: string;
  };
  position: string | null;
  is_primary: boolean;
  secondary_position?: string;
  division?: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  salutation: string | null;
  emails: ContactEmail[];
  telephones: ContactTelephone[];
  website: string | null;
  addresses: ContactAddress[];
  gender: 'male' | 'female' | 'other' | null;
  birthdate: string | null;
  language: string;
  added_at: string;
  updated_at: string;
  tags: string[];
  status: 'active' | 'deactivated';
  companies?: ContactCompanyLink[];
  vat_number?: string;
  national_identification_number?: string;
}

/**
 * List contacts with optional filters
 */
export async function listContacts(
  client: TeamleaderClient,
  filter: ContactsListFilter = {},
  page?: { size?: number; number?: number }
): Promise<ApiResponse<Contact[]>> {
  const validatedFilter = ContactsListFilterSchema.parse(filter);
  
  const body: Record<string, unknown> = {};
  
  // Build filter object
  if (Object.keys(validatedFilter).length > 0) {
    const apiFilter: Record<string, unknown> = {};
    
    // Teamleader uses 'term' for name search
    if (validatedFilter.name) {
      apiFilter.term = validatedFilter.name;
    }
    if (validatedFilter.term) {
      apiFilter.term = validatedFilter.term;
    }
    if (validatedFilter.email) {
      apiFilter.email = validatedFilter.email;
    }
    if (validatedFilter.company_id) {
      apiFilter.company_id = validatedFilter.company_id;
    }
    if (validatedFilter.tags && validatedFilter.tags.length > 0) {
      apiFilter.tags = validatedFilter.tags;
    }
    if (validatedFilter.status) {
      apiFilter.status = validatedFilter.status;
    }
    if (validatedFilter.ids && validatedFilter.ids.length > 0) {
      apiFilter.ids = validatedFilter.ids;
    }
    if (validatedFilter.updated_since) {
      apiFilter.updated_since = validatedFilter.updated_since;
    }
    
    if (Object.keys(apiFilter).length > 0) {
      body.filter = apiFilter;
    }
  }
  
  if (page) {
    body.page = {
      size: page.size || 20,
      number: page.number || 1,
    };
  }
  
  return client.request<Contact[]>('contacts.list', body);
}

/**
 * Get contact details by ID
 */
export async function getContactInfo(
  client: TeamleaderClient,
  id: string,
  include?: string[]
): Promise<ApiResponse<Contact>> {
  z.string().uuid().parse(id);
  
  const body: Record<string, unknown> = { id };
  
  // Support sideloading related data
  if (include && include.length > 0) {
    body.include = include.join(',');
  }
  
  return client.request<Contact>('contacts.info', body);
}

/**
 * Create a new contact
 */
export async function createContact(
  client: TeamleaderClient,
  input: {
    first_name: string;
    last_name: string;
    salutation?: string;
    emails?: Array<{ type: string; email: string }>;
    telephones?: Array<{ type: string; number: string }>;
    website?: string;
    language?: string;
    gender?: 'male' | 'female' | 'other';
    birthdate?: string;
    tags?: string[];
  }
): Promise<CreateResponse> {
  const body: Record<string, unknown> = {
    first_name: input.first_name,
    last_name: input.last_name,
  };
  
  if (input.salutation) body.salutation = input.salutation;
  if (input.emails) body.emails = input.emails;
  if (input.telephones) body.telephones = input.telephones;
  if (input.website) body.website = input.website;
  if (input.language) body.language = input.language;
  if (input.gender) body.gender = input.gender;
  if (input.birthdate) body.birthdate = input.birthdate;
  if (input.tags) body.tags = input.tags;
  
  return client.create('contacts.add', body);
}

/**
 * Update an existing contact
 */
export async function updateContact(
  client: TeamleaderClient,
  id: string,
  input: Partial<{
    first_name: string;
    last_name: string;
    salutation: string;
    emails: Array<{ type: string; email: string }>;
    telephones: Array<{ type: string; number: string }>;
    website: string;
    language: string;
    gender: 'male' | 'female' | 'other';
    birthdate: string;
    tags: string[];
  }>
): Promise<void> {
  z.string().uuid().parse(id);
  
  const body: Record<string, unknown> = { id };
  
  if (input.first_name) body.first_name = input.first_name;
  if (input.last_name) body.last_name = input.last_name;
  if (input.salutation !== undefined) body.salutation = input.salutation;
  if (input.emails) body.emails = input.emails;
  if (input.telephones) body.telephones = input.telephones;
  if (input.website !== undefined) body.website = input.website;
  if (input.language) body.language = input.language;
  if (input.gender) body.gender = input.gender;
  if (input.birthdate !== undefined) body.birthdate = input.birthdate;
  if (input.tags) body.tags = input.tags;
  
  await client.request('contacts.update', body);
}

/**
 * Delete a contact
 */
export async function deleteContact(
  client: TeamleaderClient,
  id: string
): Promise<void> {
  z.string().uuid().parse(id);
  
  await client.request('contacts.delete', { id });
}

/**
 * Link a contact to a company
 */
export async function linkContactToCompany(
  client: TeamleaderClient,
  contactId: string,
  companyId: string,
  options?: {
    position?: string;
    is_primary?: boolean;
  }
): Promise<void> {
  z.string().uuid().parse(contactId);
  z.string().uuid().parse(companyId);
  
  const body: Record<string, unknown> = {
    id: contactId,
    company_id: companyId,
  };
  
  if (options?.position) body.position = options.position;
  if (options?.is_primary !== undefined) body.is_primary = options.is_primary;
  
  await client.request('contacts.linkToCompany', body);
}
