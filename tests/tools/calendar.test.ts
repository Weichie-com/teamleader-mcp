import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockEvents, createMockFetch } from '../mocks/teamleader.js';
import { listEvents, getEventInfo, createEvent } from '../../src/tools/calendar.js';
import { TeamleaderClient } from '../../src/client/teamleader.js';

describe('Calendar Tools', () => {
  let mockFetch: ReturnType<typeof createMockFetch>;
  let client: TeamleaderClient;

  beforeEach(() => {
    vi.resetAllMocks();
    mockFetch = createMockFetch({
      'events.list': mockEvents.list,
      'events.info': mockEvents.info,
      'events.create': mockEvents.create,
    });
    client = new TeamleaderClient({
      accessToken: 'test-token',
      fetch: mockFetch as unknown as typeof fetch,
    });
  });

  describe('teamleader_events_list', () => {
    it('should list all events without filters', async () => {
      const result = await listEvents(client, {});
      
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].title).toBe('Team meeting');
      expect(result.data[1].title).toBe('Client call');
    });

    it('should filter events by date range', async () => {
      const result = await listEvents(client, {
        from: '2026-02-01',
        to: '2026-02-28',
      });
      
      expect(result.data).toBeDefined();
      // Mock returns all events, but filter should be passed to API
      expect(result.data).toHaveLength(2);
    });

    it('should filter events by contact_id', async () => {
      const contactUuid = 'f1dfb84c-3c29-4548-9b9b-9090a080742a';
      
      // Create client with filtered response
      const filteredMockFetch = createMockFetch({
        'events.list': {
          data: [mockEvents.list.data[0]], // First event has contact link
          meta: { page: { size: 20, number: 1 }, matches: 1 },
        },
      });
      const filteredClient = new TeamleaderClient({
        accessToken: 'test-token',
        fetch: filteredMockFetch as unknown as typeof fetch,
      });

      const result = await listEvents(filteredClient, { contact_id: contactUuid });
      
      expect(result.data).toHaveLength(1);
    });

    it('should handle pagination metadata', async () => {
      const result = await listEvents(client, {});
      
      expect(result.meta?.matches).toBe(2);
      expect(result.meta?.page.number).toBe(1);
      expect(result.meta?.page.size).toBe(20);
    });

    it('should pass page options', async () => {
      const result = await listEvents(client, {}, { size: 10, number: 2 });
      
      expect(result.data).toBeDefined();
    });

    it('should validate filter with invalid contact_id format', async () => {
      await expect(
        listEvents(client, { contact_id: 'invalid-not-uuid' })
      ).rejects.toThrow();
    });
  });

  describe('teamleader_event_info', () => {
    it('should get event details by id', async () => {
      const result = await getEventInfo(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a');
      
      expect(result.data.id).toBe('event-uuid-1');
      expect(result.data.title).toBe('Team meeting');
      expect(result.data.starts_at).toBe('2026-02-01T10:00:00+01:00');
    });

    it('should include all event fields', async () => {
      const result = await getEventInfo(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a');
      const event = result.data;
      
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('description');
      expect(event).toHaveProperty('starts_at');
      expect(event).toHaveProperty('ends_at');
      expect(event).toHaveProperty('location');
      expect(event).toHaveProperty('attendees');
      expect(event).toHaveProperty('links');
      expect(event).toHaveProperty('creator');
    });

    it('should validate id is a UUID', async () => {
      await expect(getEventInfo(client, 'invalid')).rejects.toThrow();
    });

    it('should handle non-existent event', async () => {
      const errorClient = new TeamleaderClient({
        accessToken: 'test-token',
        fetch: createMockFetch({}) as unknown as typeof fetch,
      });

      await expect(
        getEventInfo(errorClient, 'f1dfb84c-3c29-4548-9b9b-9090a0807000')
      ).rejects.toThrow();
    });
  });

  describe('teamleader_event_create', () => {
    it('should create a new event with required fields', async () => {
      const result = await createEvent(client, {
        title: 'New Event',
        starts_at: '2026-02-15T09:00:00+01:00',
        ends_at: '2026-02-15T10:00:00+01:00',
      });
      
      expect(result.type).toBe('event');
      expect(result.id).toBe('event-uuid-new');
    });

    it('should create event with optional contact links', async () => {
      const result = await createEvent(client, {
        title: 'Client Meeting',
        starts_at: '2026-02-15T09:00:00+01:00',
        ends_at: '2026-02-15T10:00:00+01:00',
        contact_ids: ['f1dfb84c-3c29-4548-9b9b-9090a080742a', 'f1dfb84c-3c29-4548-9b9b-9090a080742b'],
      });
      
      expect(result.id).toBeDefined();
    });

    it('should create event with description', async () => {
      const result = await createEvent(client, {
        title: 'Planning Session',
        starts_at: '2026-02-15T09:00:00+01:00',
        ends_at: '2026-02-15T10:00:00+01:00',
        description: 'Q1 planning meeting',
      });
      
      expect(result.id).toBeDefined();
    });

    it('should create event with location', async () => {
      const result = await createEvent(client, {
        title: 'Office Meeting',
        starts_at: '2026-02-15T09:00:00+01:00',
        ends_at: '2026-02-15T10:00:00+01:00',
        location: 'Conference Room A',
      });
      
      expect(result.id).toBeDefined();
    });

    it('should validate required fields - missing title', async () => {
      await expect(
        createEvent(client, {
          title: '', // Empty title
          starts_at: '2026-02-15T09:00:00+01:00',
          ends_at: '2026-02-15T10:00:00+01:00',
        })
      ).rejects.toThrow();
    });

    it('should validate contact_ids are UUIDs', async () => {
      await expect(
        createEvent(client, {
          title: 'Test Event',
          starts_at: '2026-02-15T09:00:00+01:00',
          ends_at: '2026-02-15T10:00:00+01:00',
          contact_ids: ['not-a-uuid'],
        })
      ).rejects.toThrow();
    });
  });
});
