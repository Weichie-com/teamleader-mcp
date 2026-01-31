/**
 * Tests for Deals Tools
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listDeals,
  getDealInfo,
  createDeal,
  updateDeal,
  moveDeal,
  winDeal,
  loseDeal,
  deleteDeal,
  listDealPhases,
  listLostReasons,
  DealsListFilterSchema,
  DealCreateSchema,
  DealUpdateSchema,
} from '../../src/tools/deals.js';
import { mockDeals, mockDealPhases, mockLostReasons, createMockFetch } from '../mocks/teamleader.js';
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

describe('Deals Tools', () => {
  describe('listDeals', () => {
    it('should list deals without filters', async () => {
      const client = createMockClient({
        'deals.list': mockDeals.list,
      });

      const result = await listDeals(client);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].title).toBe('Website Redesign Project');
      expect(result.data[0].status).toBe('open');
      expect(result.data[1].status).toBe('won');
    });

    it('should list deals with status filter', async () => {
      const client = createMockClient({
        'deals.list': mockDeals.list,
      });

      const result = await listDeals(client, { status: ['open'] });

      expect(result.data).toBeDefined();
    });

    it('should list deals with customer filter', async () => {
      const client = createMockClient({
        'deals.list': mockDeals.list,
      });

      const result = await listDeals(client, {
        customer: { type: 'company', id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d' },
      });

      expect(result.data).toBeDefined();
    });

    it('should list deals with term search', async () => {
      const client = createMockClient({
        'deals.list': mockDeals.list,
      });

      const result = await listDeals(client, { term: 'Website' });

      expect(result.data).toBeDefined();
    });

    it('should list deals with pagination and sorting', async () => {
      const client = createMockClient({
        'deals.list': mockDeals.list,
      });

      const result = await listDeals(
        client,
        {},
        { size: 10, number: 1 },
        [{ field: 'created_at', order: 'desc' }]
      );

      expect(result.meta?.page).toBeDefined();
    });

    it('should list deals with custom_fields include', async () => {
      const client = createMockClient({
        'deals.list': mockDeals.list,
      });

      const result = await listDeals(client, {}, undefined, undefined, ['custom_fields']);

      expect(result.data).toBeDefined();
    });
  });

  describe('getDealInfo', () => {
    it('should get deal details by ID', async () => {
      const client = createMockClient({
        'deals.info': mockDeals.info,
      });

      const result = await getDealInfo(client, 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d');

      expect(result.data.id).toBe('deal-uuid-1');
      expect(result.data.title).toBe('Website Redesign Project');
      expect(result.data.estimated_value?.amount).toBe(15000);
      expect(result.data.phase_history).toHaveLength(2);
      expect(result.data.quotations).toHaveLength(1);
    });

    it('should throw error for invalid UUID', async () => {
      const client = createMockClient({});

      await expect(getDealInfo(client, 'invalid-id')).rejects.toThrow();
    });
  });

  describe('createDeal', () => {
    it('should create a deal with minimal data', async () => {
      const client = createMockClient({
        'deals.create': mockDeals.create,
      });

      const result = await createDeal(client, {
        lead: {
          customer: { type: 'company', id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d' },
        },
        title: 'New Deal',
      });

      expect(result.type).toBe('deal');
      expect(result.id).toBe('deal-uuid-new');
    });

    it('should create a deal with full data', async () => {
      const client = createMockClient({
        'deals.create': mockDeals.create,
      });

      const result = await createDeal(client, {
        lead: {
          customer: { type: 'company', id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d' },
          contact_person_id: 'ad48d4a3-b9dc-4eac-8071-5889c9f21e5a',
        },
        title: 'Full Deal',
        summary: 'A comprehensive deal',
        source_id: 'bd48d4a3-b9dc-4eac-8071-5889c9f21e5b',
        department_id: 'cd48d4a3-b9dc-4eac-8071-5889c9f21e5c',
        responsible_user_id: 'dd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        phase_id: 'ed48d4a3-b9dc-4eac-8071-5889c9f21e5e',
        estimated_value: { amount: 10000, currency: 'EUR' },
        estimated_probability: 0.5,
        estimated_closing_date: '2026-06-01',
      });

      expect(result.type).toBe('deal');
    });

    it('should throw error for missing title', async () => {
      const client = createMockClient({});

      await expect(createDeal(client, {
        lead: { customer: { type: 'company', id: 'company-uuid-1' } },
        title: '',
      })).rejects.toThrow();
    });

    it('should throw error for invalid probability', async () => {
      const client = createMockClient({});

      await expect(createDeal(client, {
        lead: { customer: { type: 'company', id: 'company-uuid-1' } },
        title: 'Test',
        estimated_probability: 1.5, // Must be 0-1
      })).rejects.toThrow();
    });
  });

  describe('updateDeal', () => {
    it('should update a deal', async () => {
      const client = createMockClient({
        'deals.update': {},
      });

      await expect(updateDeal(client, {
        id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        title: 'Updated Deal Title',
      })).resolves.toBeUndefined();
    });

    it('should update deal with nullable fields', async () => {
      const client = createMockClient({
        'deals.update': {},
      });

      await expect(updateDeal(client, {
        id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        summary: null,
        source_id: null,
      })).resolves.toBeUndefined();
    });
  });

  describe('moveDeal', () => {
    it('should move a deal to a different phase', async () => {
      const client = createMockClient({
        'deals.move': {},
      });

      await expect(moveDeal(client, 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d', 'ad48d4a3-b9dc-4eac-8071-5889c9f21e5a')).resolves.toBeUndefined();
    });

    it('should throw error for invalid deal ID', async () => {
      const client = createMockClient({});

      await expect(moveDeal(client, 'invalid', 'phase-uuid-3')).rejects.toThrow();
    });

    it('should throw error for invalid phase ID', async () => {
      const client = createMockClient({});

      await expect(moveDeal(client, 'deal-uuid-1', 'invalid')).rejects.toThrow();
    });
  });

  describe('winDeal', () => {
    it('should mark a deal as won', async () => {
      const client = createMockClient({
        'deals.win': {},
      });

      await expect(winDeal(client, 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d')).resolves.toBeUndefined();
    });
  });

  describe('loseDeal', () => {
    it('should mark a deal as lost without reason', async () => {
      const client = createMockClient({
        'deals.lose': {},
      });

      await expect(loseDeal(client, 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d')).resolves.toBeUndefined();
    });

    it('should mark a deal as lost with reason', async () => {
      const client = createMockClient({
        'deals.lose': {},
      });

      await expect(loseDeal(
        client,
        'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        'ad48d4a3-b9dc-4eac-8071-5889c9f21e5a',
        'Customer chose a cheaper option'
      )).resolves.toBeUndefined();
    });
  });

  describe('deleteDeal', () => {
    it('should delete a deal', async () => {
      const client = createMockClient({
        'deals.delete': {},
      });

      await expect(deleteDeal(client, 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d')).resolves.toBeUndefined();
    });
  });

  describe('listDealPhases', () => {
    it('should list deal phases', async () => {
      const client = createMockClient({
        'dealPhases.list': mockDealPhases.list,
      });

      const result = await listDealPhases(client);

      expect(result.data).toHaveLength(4);
      expect(result.data[0].name).toBe('New');
      expect(result.data[0].probability).toBe(0.1);
    });

    it('should list deal phases filtered by pipeline', async () => {
      const client = createMockClient({
        'dealPhases.list': mockDealPhases.list,
      });

      const result = await listDealPhases(client, { deal_pipeline_id: 'pipeline-uuid-1' });

      expect(result.data).toBeDefined();
    });
  });

  describe('listLostReasons', () => {
    it('should list lost reasons', async () => {
      const client = createMockClient({
        'lostReasons.list': mockLostReasons.list,
      });

      const result = await listLostReasons(client);

      expect(result.data).toHaveLength(3);
      expect(result.data[0].name).toBe('Price too high');
    });
  });

  describe('Schema Validation', () => {
    describe('DealsListFilterSchema', () => {
      it('should accept valid filter with term', () => {
        const result = DealsListFilterSchema.parse({ term: 'Website' });
        expect(result.term).toBe('Website');
      });

      it('should accept valid filter with status array', () => {
        const result = DealsListFilterSchema.parse({ status: ['open', 'won'] });
        expect(result.status).toEqual(['open', 'won']);
      });

      it('should accept valid filter with customer', () => {
        const result = DealsListFilterSchema.parse({
          customer: { type: 'company', id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d' },
        });
        expect(result.customer?.type).toBe('company');
      });

      it('should accept responsible_user_id as string', () => {
        const result = DealsListFilterSchema.parse({
          responsible_user_id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        });
        expect(result.responsible_user_id).toBe('fd48d4a3-b9dc-4eac-8071-5889c9f21e5d');
      });

      it('should accept responsible_user_id as array', () => {
        const result = DealsListFilterSchema.parse({
          responsible_user_id: ['fd48d4a3-b9dc-4eac-8071-5889c9f21e5d', 'ad48d4a3-b9dc-4eac-8071-5889c9f21e5a'],
        });
        expect(Array.isArray(result.responsible_user_id)).toBe(true);
      });

      it('should reject invalid status', () => {
        expect(() => DealsListFilterSchema.parse({ status: ['invalid'] })).toThrow();
      });
    });

    describe('DealCreateSchema', () => {
      it('should accept minimal deal data', () => {
        const result = DealCreateSchema.parse({
          lead: { customer: { type: 'company', id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d' } },
          title: 'Test Deal',
        });
        expect(result.title).toBe('Test Deal');
      });

      it('should validate probability range', () => {
        expect(() => DealCreateSchema.parse({
          lead: { customer: { type: 'company', id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d' } },
          title: 'Test',
          estimated_probability: -0.1,
        })).toThrow();

        expect(() => DealCreateSchema.parse({
          lead: { customer: { type: 'company', id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d' } },
          title: 'Test',
          estimated_probability: 1.1,
        })).toThrow();
      });

      it('should accept valid probability', () => {
        const result = DealCreateSchema.parse({
          lead: { customer: { type: 'company', id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d' } },
          title: 'Test',
          estimated_probability: 0.75,
        });
        expect(result.estimated_probability).toBe(0.75);
      });
    });

    describe('DealUpdateSchema', () => {
      it('should accept update with only ID', () => {
        const result = DealUpdateSchema.parse({
          id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        });
        expect(result.id).toBe('fd48d4a3-b9dc-4eac-8071-5889c9f21e5d');
      });

      it('should accept nullable fields', () => {
        const result = DealUpdateSchema.parse({
          id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
          summary: null,
          source_id: null,
          estimated_value: null,
        });
        expect(result.summary).toBeNull();
      });
    });
  });
});
