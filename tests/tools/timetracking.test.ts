/**
 * Tests for Time Tracking Tools
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listTimeTracking,
  getTimeTrackingInfo,
  addTimeTracking,
  updateTimeTracking,
  deleteTimeTracking,
  getCurrentTimer,
  startTimer,
  updateTimer,
  stopTimer,
  resumeTimer,
  discardTimer,
  TimeTrackingListFilterSchema,
  TimeTrackingAddSchema,
  TimeTrackingUpdateSchema,
} from '../../src/tools/timetracking.js';
import { mockTimeTracking, mockTimers, createMockFetch } from '../mocks/teamleader.js';
import type { TeamleaderClient } from '../../src/client/teamleader.js';

// Mock client factory
function createMockClient(responses: Record<string, unknown>): TeamleaderClient {
  const mockFetch = createMockFetch(responses);
  
  return {
    request: async <T>(endpoint: string, body?: Record<string, unknown>) => {
      const response = await mockFetch(`https://api.focus.teamleader.eu/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return { data: data.data as T, meta: data.meta };
    },
    create: async (endpoint: string, body?: Record<string, unknown>) => {
      const response = await mockFetch(`https://api.focus.teamleader.eu/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return data;
    },
  } as TeamleaderClient;
}

describe('Time Tracking Tools', () => {
  describe('listTimeTracking', () => {
    it('should list time tracking entries without filters', async () => {
      const client = createMockClient({
        'timeTracking.list': mockTimeTracking.list,
      });

      const result = await listTimeTracking(client);

      expect(result.data).toHaveLength(3);
      expect(result.data[0].description).toBe('Frontend development for homepage');
      expect(result.data[0].duration).toBe(10800);
      expect(result.data[0].invoiceable).toBe(true);
    });

    it('should list time tracking with user_id filter', async () => {
      const client = createMockClient({
        'timeTracking.list': mockTimeTracking.list,
      });

      const result = await listTimeTracking(client, { user_id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d' });

      expect(result.data).toBeDefined();
    });

    it('should list time tracking with date range filter', async () => {
      const client = createMockClient({
        'timeTracking.list': mockTimeTracking.list,
      });

      const result = await listTimeTracking(client, {
        started_after: '2026-01-29T00:00:00+00:00',
        started_before: '2026-01-31T23:59:59+00:00',
      });

      expect(result.data).toBeDefined();
    });

    it('should list time tracking with subject filter', async () => {
      const client = createMockClient({
        'timeTracking.list': mockTimeTracking.list,
      });

      const result = await listTimeTracking(client, {
        subject: { type: 'milestone', id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d' },
      });

      expect(result.data).toBeDefined();
    });

    it('should list time tracking with pagination and sorting', async () => {
      const client = createMockClient({
        'timeTracking.list': mockTimeTracking.list,
      });

      const result = await listTimeTracking(
        client,
        {},
        { size: 10, number: 1 },
        [{ field: 'started_at', order: 'desc' }]
      );

      expect(result.meta?.page).toBeDefined();
    });

    it('should list time tracking with billing_info include', async () => {
      const client = createMockClient({
        'timeTracking.list': mockTimeTracking.list,
      });

      const result = await listTimeTracking(client, {}, undefined, undefined, ['billing_info']);

      expect(result.data[0].billing_info).toBeDefined();
    });
  });

  describe('getTimeTrackingInfo', () => {
    it('should get time tracking details by ID', async () => {
      const client = createMockClient({
        'timeTracking.info': mockTimeTracking.info,
      });

      const result = await getTimeTrackingInfo(client, 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d');

      expect(result.data.id).toBe('timetracking-uuid-1');
      expect(result.data.duration).toBe(10800);
      expect(result.data.locked).toBe(false);
      expect(result.data.updatable).toBe(true);
      expect(result.data.hourly_rate?.amount).toBe(100);
    });

    it('should throw error for invalid UUID', async () => {
      const client = createMockClient({});

      await expect(getTimeTrackingInfo(client, 'invalid-id')).rejects.toThrow();
    });
  });

  describe('addTimeTracking', () => {
    it('should add a time tracking entry', async () => {
      const client = createMockClient({
        'timeTracking.add': mockTimeTracking.add,
      });

      const result = await addTimeTracking(client, {
        started_at: '2026-01-31T09:00:00+01:00',
        ended_at: '2026-01-31T12:00:00+01:00',
      });

      expect(result.type).toBe('timeTracking');
      expect(result.id).toBe('timetracking-uuid-new');
    });

    it('should add time tracking with full data', async () => {
      const client = createMockClient({
        'timeTracking.add': mockTimeTracking.add,
      });

      const result = await addTimeTracking(client, {
        user_id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        work_type_id: 'ad48d4a3-b9dc-4eac-8071-5889c9f21e5a',
        started_on: '2026-01-31',
        started_at: '2026-01-31T09:00:00+01:00',
        ended_at: '2026-01-31T12:00:00+01:00',
        description: 'Development work',
        subject: { type: 'milestone', id: 'bd48d4a3-b9dc-4eac-8071-5889c9f21e5b' },
        invoiceable: true,
      });

      expect(result.type).toBe('timeTracking');
    });

    it('should add time tracking with duration instead of ended_at', async () => {
      const client = createMockClient({
        'timeTracking.add': mockTimeTracking.add,
      });

      const result = await addTimeTracking(client, {
        started_at: '2026-01-31T09:00:00+01:00',
        ended_at: '2026-01-31T12:00:00+01:00', // Required field
        duration: 3600, // 1 hour
      });

      expect(result.type).toBe('timeTracking');
    });
  });

  describe('updateTimeTracking', () => {
    it('should update a time tracking entry', async () => {
      const client = createMockClient({
        'timeTracking.update': {},
      });

      await expect(updateTimeTracking(client, {
        id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        description: 'Updated description',
      })).resolves.toBeUndefined();
    });

    it('should update time tracking with nullable fields', async () => {
      const client = createMockClient({
        'timeTracking.update': {},
      });

      await expect(updateTimeTracking(client, {
        id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        work_type_id: null,
        description: null,
        subject: null,
      })).resolves.toBeUndefined();
    });

    it('should update time tracking invoiceability', async () => {
      const client = createMockClient({
        'timeTracking.update': {},
      });

      await expect(updateTimeTracking(client, {
        id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        invoiceable: false,
      })).resolves.toBeUndefined();
    });
  });

  describe('deleteTimeTracking', () => {
    it('should delete a time tracking entry', async () => {
      const client = createMockClient({
        'timeTracking.delete': {},
      });

      await expect(deleteTimeTracking(client, 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d')).resolves.toBeUndefined();
    });

    it('should throw error for invalid UUID', async () => {
      const client = createMockClient({});

      await expect(deleteTimeTracking(client, 'invalid')).rejects.toThrow();
    });
  });

  describe('Timer Functions', () => {
    describe('getCurrentTimer', () => {
      it('should get the current running timer', async () => {
        const client = createMockClient({
          'timers.current': mockTimers.current,
        });

        const result = await getCurrentTimer(client);

        expect(result.data?.id).toBe('timer-uuid-1');
        expect(result.data?.description).toBe('Working on feature X');
      });
    });

    describe('startTimer', () => {
      it('should start a timer without parameters', async () => {
        const client = createMockClient({
          'timers.start': mockTimers.start,
        });

        const result = await startTimer(client);

        expect(result.type).toBe('timer');
        expect(result.id).toBe('timer-uuid-new');
      });

      it('should start a timer with all parameters', async () => {
        const client = createMockClient({
          'timers.start': mockTimers.start,
        });

        const result = await startTimer(
          client,
          'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
          'Working on something',
          { type: 'milestone', id: 'ad48d4a3-b9dc-4eac-8071-5889c9f21e5a' },
          true
        );

        expect(result.type).toBe('timer');
      });
    });

    describe('updateTimer', () => {
      it('should update a running timer', async () => {
        const client = createMockClient({
          'timers.update': {},
        });

        await expect(updateTimer(client, 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d', {
          description: 'Updated timer description',
        })).resolves.toBeUndefined();
      });
    });

    describe('stopTimer', () => {
      it('should stop a running timer', async () => {
        const client = createMockClient({
          'timers.stop': {},
        });

        await expect(stopTimer(client, 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d')).resolves.toBeUndefined();
      });
    });

    describe('resumeTimer', () => {
      it('should resume a stopped timer', async () => {
        const client = createMockClient({
          'timers.resume': {},
        });

        await expect(resumeTimer(client, 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d')).resolves.toBeUndefined();
      });
    });

    describe('discardTimer', () => {
      it('should discard a timer', async () => {
        const client = createMockClient({
          'timers.discard': {},
        });

        await expect(discardTimer(client, 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d')).resolves.toBeUndefined();
      });
    });
  });

  describe('Schema Validation', () => {
    describe('TimeTrackingListFilterSchema', () => {
      it('should accept valid filter with user_id', () => {
        const result = TimeTrackingListFilterSchema.parse({
          user_id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        });
        expect(result.user_id).toBe('fd48d4a3-b9dc-4eac-8071-5889c9f21e5d');
      });

      it('should accept valid filter with date range', () => {
        const result = TimeTrackingListFilterSchema.parse({
          started_after: '2026-01-01T00:00:00+00:00',
          started_before: '2026-01-31T23:59:59+00:00',
        });
        expect(result.started_after).toBeDefined();
      });

      it('should accept valid filter with subject', () => {
        const result = TimeTrackingListFilterSchema.parse({
          subject: { type: 'milestone', id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d' },
        });
        expect(result.subject?.type).toBe('milestone');
      });

      it('should reject invalid subject type', () => {
        expect(() => TimeTrackingListFilterSchema.parse({
          subject: { type: 'invalid', id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d' },
        })).toThrow();
      });
    });

    describe('TimeTrackingAddSchema', () => {
      it('should accept minimal time tracking data', () => {
        const result = TimeTrackingAddSchema.parse({
          started_at: '2026-01-31T09:00:00+01:00',
          ended_at: '2026-01-31T12:00:00+01:00',
        });
        expect(result.started_at).toBeDefined();
      });

      it('should accept full time tracking data', () => {
        const input = {
          user_id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
          work_type_id: 'ad48d4a3-b9dc-4eac-8071-5889c9f21e5a',
          started_on: '2026-01-31',
          started_at: '2026-01-31T09:00:00+01:00',
          ended_at: '2026-01-31T12:00:00+01:00',
          description: 'Development work',
          subject: { type: 'milestone' as const, id: 'bd48d4a3-b9dc-4eac-8071-5889c9f21e5b' },
          invoiceable: true,
        };
        const result = TimeTrackingAddSchema.parse(input);
        expect(result.invoiceable).toBe(true);
      });

      it('should default invoiceable to true', () => {
        const result = TimeTrackingAddSchema.parse({
          started_at: '2026-01-31T09:00:00+01:00',
          ended_at: '2026-01-31T12:00:00+01:00',
        });
        expect(result.invoiceable).toBe(true);
      });

      it('should accept duration as positive integer', () => {
        const result = TimeTrackingAddSchema.parse({
          started_at: '2026-01-31T09:00:00+01:00',
          ended_at: '2026-01-31T12:00:00+01:00',
          duration: 3600,
        });
        expect(result.duration).toBe(3600);
      });

      it('should reject negative duration', () => {
        expect(() => TimeTrackingAddSchema.parse({
          started_at: '2026-01-31T09:00:00+01:00',
          ended_at: '2026-01-31T12:00:00+01:00',
          duration: -100,
        })).toThrow();
      });
    });

    describe('TimeTrackingUpdateSchema', () => {
      it('should accept update with only ID', () => {
        const result = TimeTrackingUpdateSchema.parse({
          id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        });
        expect(result.id).toBe('fd48d4a3-b9dc-4eac-8071-5889c9f21e5d');
      });

      it('should accept nullable fields', () => {
        const result = TimeTrackingUpdateSchema.parse({
          id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
          work_type_id: null,
          description: null,
          subject: null,
        });
        expect(result.work_type_id).toBeNull();
      });

      it('should reject invalid UUID for ID', () => {
        expect(() => TimeTrackingUpdateSchema.parse({ id: 'invalid' })).toThrow();
      });
    });
  });
});
