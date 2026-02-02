/**
 * Time Tracking Tools for Teamleader Focus
 * 
 * API Endpoints:
 * - POST timeTracking.list - List time tracking entries
 * - POST timeTracking.info - Get time tracking details
 * - POST timeTracking.add - Add a time tracking entry
 * - POST timeTracking.update - Update a time tracking entry
 * - POST timeTracking.delete - Delete a time tracking entry
 */

import { z } from 'zod';
import type { TeamleaderClient, ApiResponse, CreateResponse } from '../client/teamleader.js';

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const SubjectSchema = z.object({
  type: z.enum(['milestone', 'ticket', 'nextgenTask']),
  id: z.string().uuid(),
});

const CustomFieldValueSchema = z.object({
  id: z.string().uuid(),
  value: z.unknown(),
});

// Filter schema for listing time tracking
export const TimeTrackingListFilterSchema = z.object({
  ids: z.array(z.string().uuid()).optional(),
  user_id: z.string().uuid().optional(),
  started_after: z.string().optional().describe('Filter on entries started on or after this date (inclusive)'),
  started_before: z.string().optional().describe('Filter on entries started on or before this date (inclusive)'),
  ended_after: z.string().optional().describe('Filter on entries ended on or after this date (inclusive)'),
  ended_before: z.string().optional().describe('Filter on entries ended on or before this date (inclusive)'),
  subject: SubjectSchema.optional(),
}).strict();

// Schema for adding a time tracking entry
export const TimeTrackingAddSchema = z.object({
  user_id: z.string().uuid().optional().describe('When not provided, tracks time for current user'),
  work_type_id: z.string().uuid().optional(),
  started_on: z.string().optional().describe('Date in YYYY-MM-DD format'),
  started_at: z.string().describe('ISO 8601 datetime'),
  ended_at: z.string().describe('ISO 8601 datetime'),
  duration: z.number().int().positive().optional().describe('Duration in seconds, used when ended_at is not provided'),
  description: z.string().optional(),
  subject: SubjectSchema.optional(),
  invoiceable: z.boolean().optional().default(true),
}).strict();

// Schema for updating a time tracking entry
export const TimeTrackingUpdateSchema = z.object({
  id: z.string().uuid(),
  work_type_id: z.string().uuid().optional().nullable(),
  started_at: z.string().optional().describe('ISO 8601 datetime'),
  ended_at: z.string().optional().describe('ISO 8601 datetime'),
  duration: z.number().int().positive().optional().describe('Duration in seconds'),
  description: z.string().optional().nullable(),
  subject: SubjectSchema.optional().nullable(),
  invoiceable: z.boolean().optional(),
}).strict();

export type TimeTrackingListFilter = z.infer<typeof TimeTrackingListFilterSchema>;
export type TimeTrackingAddInput = z.infer<typeof TimeTrackingAddSchema>;
export type TimeTrackingUpdateInput = z.infer<typeof TimeTrackingUpdateSchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface Money {
  amount: number;
  currency: string;
}

export interface TimeTracking {
  id: string;
  user: {
    type: string;
    id: string;
  };
  work_type?: {
    type: string;
    id: string;
  } | null;
  started_on: string;
  started_at: string;
  ended_at: string;
  duration: number;  // in seconds
  description: string | null;
  subject?: {
    type: string;
    id: string;
  } | null;
  invoiceable: boolean;
  locked?: boolean;
  updatable?: boolean;
  billing_info?: {
    billed: boolean;
    invoice?: {
      type: string;
      id: string;
    } | null;
  };
  hourly_rate?: Money | null;
}

// ============================================================================
// TOOL FUNCTIONS
// ============================================================================

/**
 * List time tracking entries with optional filters
 */
export async function listTimeTracking(
  client: TeamleaderClient,
  filter: TimeTrackingListFilter = {},
  page?: { size?: number; number?: number },
  sort?: Array<{ field: 'started_at'; order?: 'asc' | 'desc' }>,
  includes?: string[]
): Promise<ApiResponse<TimeTracking[]>> {
  const validatedFilter = TimeTrackingListFilterSchema.parse(filter);
  
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
  
  return client.request<TimeTracking[]>('timeTracking.list', body);
}

/**
 * Get time tracking entry details by ID
 */
export async function getTimeTrackingInfo(
  client: TeamleaderClient,
  id: string,
  includes?: string[]
): Promise<ApiResponse<TimeTracking>> {
  z.string().uuid().parse(id);
  
  const body: Record<string, unknown> = { id };
  
  if (includes && includes.length > 0) {
    body.includes = includes.join(',');
  }
  
  return client.request<TimeTracking>('timeTracking.info', body);
}

/**
 * Add a new time tracking entry
 */
export async function addTimeTracking(
  client: TeamleaderClient,
  input: TimeTrackingAddInput
): Promise<CreateResponse> {
  const validated = TimeTrackingAddSchema.parse(input);
  
  return client.create('timeTracking.add', validated);
}

/**
 * Update an existing time tracking entry
 */
export async function updateTimeTracking(
  client: TeamleaderClient,
  input: TimeTrackingUpdateInput
): Promise<void> {
  const validated = TimeTrackingUpdateSchema.parse(input);
  
  await client.request('timeTracking.update', validated);
}

/**
 * Delete a time tracking entry
 */
export async function deleteTimeTracking(
  client: TeamleaderClient,
  id: string
): Promise<void> {
  z.string().uuid().parse(id);
  
  await client.request('timeTracking.delete', { id });
}

// ============================================================================
// TIMER FUNCTIONS
// ============================================================================

/**
 * Get the current running timer for the authenticated user
 */
export async function getCurrentTimer(
  client: TeamleaderClient
): Promise<ApiResponse<TimeTracking | null>> {
  return client.request<TimeTracking | null>('timers.current', {});
}

/**
 * Start a timer
 */
export async function startTimer(
  client: TeamleaderClient,
  workTypeId?: string,
  description?: string,
  subject?: { type: 'milestone' | 'ticket' | 'nextgenTask'; id: string },
  invoiceable?: boolean
): Promise<CreateResponse> {
  const body: Record<string, unknown> = {};
  
  if (workTypeId) {
    z.string().uuid().parse(workTypeId);
    body.work_type_id = workTypeId;
  }
  if (description) body.description = description;
  if (subject) body.subject = subject;
  if (invoiceable !== undefined) body.invoiceable = invoiceable;
  
  return client.create('timers.start', body);
}

/**
 * Update a running timer
 */
export async function updateTimer(
  client: TeamleaderClient,
  id: string,
  updates: {
    work_type_id?: string | null;
    description?: string | null;
    subject?: { type: 'milestone' | 'ticket' | 'nextgenTask'; id: string } | null;
    invoiceable?: boolean;
    started_at?: string;
  }
): Promise<void> {
  z.string().uuid().parse(id);
  
  await client.request('timers.update', { id, ...updates });
}

/**
 * Stop a running timer
 */
export async function stopTimer(
  client: TeamleaderClient,
  id: string
): Promise<void> {
  z.string().uuid().parse(id);
  
  await client.request('timers.stop', { id });
}

/**
 * Resume a stopped timer
 */
export async function resumeTimer(
  client: TeamleaderClient,
  id: string
): Promise<void> {
  z.string().uuid().parse(id);
  
  await client.request('timers.resume', { id });
}

/**
 * Discard a timer without saving
 */
export async function discardTimer(
  client: TeamleaderClient,
  id: string
): Promise<void> {
  z.string().uuid().parse(id);
  
  await client.request('timers.discard', { id });
}
