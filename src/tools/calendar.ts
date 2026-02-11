/**
 * Calendar/Events Tools for Teamleader Focus
 * 
 * API Endpoints:
 * - POST events.list - List calendar events
 * - POST events.info - Get event details
 * - POST events.create - Create a new event
 * - POST events.update - Update an event
 * - POST events.delete - Delete an event
 */

import { z } from 'zod';
import type { TeamleaderClient, ApiResponse, CreateResponse } from '../client/teamleader.js';

// Zod schemas for validation
export const EventsListFilterSchema = z.object({
  from: z.string().optional().describe('Start date (ISO 8601)'),
  to: z.string().optional().describe('End date (ISO 8601)'),
  contact_id: z.string().uuid().optional().describe('Filter by linked contact'),
  company_id: z.string().uuid().optional().describe('Filter by linked company'),
  deal_id: z.string().uuid().optional().describe('Filter by linked deal'),
  user_id: z.string().uuid().optional().describe('Filter by user/attendee'),
  ids: z.array(z.string().uuid()).optional().describe('Filter by specific event IDs'),
  done: z.boolean().optional().describe('Filter by completion status'),
}).strict();

export const EventCreateSchema = z.object({
  title: z.string().min(1).describe('Event title'),
  starts_at: z.string().describe('Start datetime (ISO 8601)'),
  ends_at: z.string().describe('End datetime (ISO 8601)'),
  activity_type_id: z.string().uuid().optional().describe('Activity type ID (required for some Teamleader setups)'),
  description: z.string().optional().describe('Event description'),
  location: z.string().optional().describe('Event location'),
  attendee_ids: z.array(z.string().uuid()).optional().describe('User IDs of attendees'),
  contact_ids: z.array(z.string().uuid()).optional().describe('Linked contact IDs'),
  company_ids: z.array(z.string().uuid()).optional().describe('Linked company IDs'),
  deal_ids: z.array(z.string().uuid()).optional().describe('Linked deal IDs'),
}).strict();

export type EventsListFilter = z.infer<typeof EventsListFilterSchema>;
export type EventCreateInput = z.infer<typeof EventCreateSchema>;

// API Response types
export interface EventAttendee {
  type: 'user';
  id: string;
}

export interface EventLink {
  type: 'contact' | 'company' | 'deal';
  id: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  location: string | null;
  attendees: EventAttendee[];
  links: EventLink[];
  creator: {
    type: 'user';
    id: string;
  };
  task: unknown | null;
  recurrence: unknown | null;
}

/**
 * List calendar events
 */
export async function listEvents(
  client: TeamleaderClient,
  filter: EventsListFilter = {},
  page?: { size?: number; number?: number }
): Promise<ApiResponse<Event[]>> {
  const validatedFilter = EventsListFilterSchema.parse(filter);
  
  // Build the request body
  const body: Record<string, unknown> = {};
  
  // Map our filter to Teamleader's expected format
  if (Object.keys(validatedFilter).length > 0) {
    const apiFilter: Record<string, unknown> = {};
    
    if (validatedFilter.from) {
      apiFilter.starts_after = validatedFilter.from;
    }
    if (validatedFilter.to) {
      apiFilter.starts_before = validatedFilter.to;
    }
    if (validatedFilter.ids) {
      apiFilter.ids = validatedFilter.ids;
    }
    if (validatedFilter.user_id) {
      apiFilter.user_id = validatedFilter.user_id;
    }
    if (validatedFilter.done !== undefined) {
      apiFilter.done = validatedFilter.done;
    }
    
    // Links filter (contact, company, deal)
    if (validatedFilter.contact_id || validatedFilter.company_id || validatedFilter.deal_id) {
      const links: Record<string, string>[] = [];
      if (validatedFilter.contact_id) {
        links.push({ type: 'contact', id: validatedFilter.contact_id });
      }
      if (validatedFilter.company_id) {
        links.push({ type: 'company', id: validatedFilter.company_id });
      }
      if (validatedFilter.deal_id) {
        links.push({ type: 'deal', id: validatedFilter.deal_id });
      }
      // Note: Teamleader may use different filter structure for links
      // This might need adjustment based on actual API behavior
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
  
  return client.request<Event[]>('events.list', body);
}

/**
 * Get event details by ID
 */
export async function getEventInfo(
  client: TeamleaderClient,
  id: string
): Promise<ApiResponse<Event>> {
  z.string().uuid().parse(id);
  
  return client.request<Event>('events.info', { id });
}

/**
 * Create a new calendar event
 */
export async function createEvent(
  client: TeamleaderClient,
  input: EventCreateInput
): Promise<CreateResponse> {
  const validated = EventCreateSchema.parse(input);
  
  // Build the request body in Teamleader's expected format
  const body: Record<string, unknown> = {
    title: validated.title,
    starts_at: validated.starts_at,
    ends_at: validated.ends_at,
  };
  
  // Add activity_type_id if provided
  if (validated.activity_type_id) {
    body.activity_type_id = validated.activity_type_id;
  }
  
  if (validated.description) {
    body.description = validated.description;
  }
  
  if (validated.location) {
    body.location = validated.location;
  }
  
  if (validated.attendee_ids && validated.attendee_ids.length > 0) {
    body.attendees = validated.attendee_ids.map((id) => ({
      type: 'user',
      id,
    }));
  }
  
  // Build links array for contacts, companies, deals
  const links: EventLink[] = [];
  
  if (validated.contact_ids) {
    validated.contact_ids.forEach((id) => {
      links.push({ type: 'contact', id });
    });
  }
  
  if (validated.company_ids) {
    validated.company_ids.forEach((id) => {
      links.push({ type: 'company', id });
    });
  }
  
  if (validated.deal_ids) {
    validated.deal_ids.forEach((id) => {
      links.push({ type: 'deal', id });
    });
  }
  
  if (links.length > 0) {
    body.links = links;
  }
  
  return client.create('events.create', body);
}

/**
 * Update an existing event
 */
export async function updateEvent(
  client: TeamleaderClient,
  id: string,
  input: Partial<EventCreateInput>
): Promise<void> {
  z.string().uuid().parse(id);
  
  const body: Record<string, unknown> = { id };
  
  if (input.title) body.title = input.title;
  if (input.starts_at) body.starts_at = input.starts_at;
  if (input.ends_at) body.ends_at = input.ends_at;
  if (input.description !== undefined) body.description = input.description;
  if (input.location !== undefined) body.location = input.location;
  
  if (input.attendee_ids) {
    body.attendees = input.attendee_ids.map((id) => ({
      type: 'user',
      id,
    }));
  }
  
  // Links need to be provided in full (they replace existing)
  const links: EventLink[] = [];
  if (input.contact_ids) {
    input.contact_ids.forEach((id) => links.push({ type: 'contact', id }));
  }
  if (input.company_ids) {
    input.company_ids.forEach((id) => links.push({ type: 'company', id }));
  }
  if (input.deal_ids) {
    input.deal_ids.forEach((id) => links.push({ type: 'deal', id }));
  }
  if (links.length > 0) {
    body.links = links;
  }
  
  await client.request('events.update', body);
}

/**
 * Delete an event
 */
export async function deleteEvent(
  client: TeamleaderClient,
  id: string
): Promise<void> {
  z.string().uuid().parse(id);
  
  await client.request('events.delete', { id });
}
