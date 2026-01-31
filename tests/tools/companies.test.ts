/**
 * Tests for Companies Tools
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listCompanies,
  getCompanyInfo,
  createCompany,
  updateCompany,
  deleteCompany,
  tagCompany,
  untagCompany,
  CompaniesListFilterSchema,
  CompanyCreateSchema,
  CompanyUpdateSchema,
} from '../../src/tools/companies.js';
import { mockCompanies, createMockFetch } from '../mocks/teamleader.js';
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

describe('Companies Tools', () => {
  describe('listCompanies', () => {
    it('should list companies without filters', async () => {
      const client = createMockClient({
        'companies.list': mockCompanies.list,
      });

      const result = await listCompanies(client);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Acme Corporation');
      expect(result.data[0].status).toBe('active');
      expect(result.data[0].vat_number).toBe('BE0899623035');
    });

    it('should list companies with term filter', async () => {
      const client = createMockClient({
        'companies.list': mockCompanies.list,
      });

      const result = await listCompanies(client, { term: 'Acme' });

      expect(result.data).toBeDefined();
    });

    it('should list companies with tags filter', async () => {
      const client = createMockClient({
        'companies.list': mockCompanies.list,
      });

      const result = await listCompanies(client, { tags: ['partner'] });

      expect(result.data).toBeDefined();
    });

    it('should list companies with pagination', async () => {
      const client = createMockClient({
        'companies.list': mockCompanies.list,
      });

      const result = await listCompanies(client, {}, { size: 10, number: 1 });

      expect(result.meta?.page).toBeDefined();
    });

    it('should list companies with custom_fields include', async () => {
      const client = createMockClient({
        'companies.list': mockCompanies.list,
      });

      const result = await listCompanies(client, {}, undefined, undefined, ['custom_fields']);

      expect(result.data).toBeDefined();
    });
  });

  describe('getCompanyInfo', () => {
    it('should get company details by ID', async () => {
      const client = createMockClient({
        'companies.info': mockCompanies.info,
      });

      const result = await getCompanyInfo(client, 'f3d67f3e-b8a9-45e8-99b1-17a3b14de8a6');

      expect(result.data.id).toBe('company-uuid-1');
      expect(result.data.name).toBe('Acme Corporation');
      expect(result.data.emails).toHaveLength(1);
      expect(result.data.addresses).toHaveLength(2);
      expect(result.data.remarks).toBe('Important partner company');
    });

    it('should get company with related contacts', async () => {
      const client = createMockClient({
        'companies.info': mockCompanies.info,
      });

      const result = await getCompanyInfo(client, 'f3d67f3e-b8a9-45e8-99b1-17a3b14de8a6', ['related_contacts']);

      expect(result.data).toBeDefined();
    });

    it('should throw error for invalid UUID', async () => {
      const client = createMockClient({});

      await expect(getCompanyInfo(client, 'invalid-id')).rejects.toThrow();
    });
  });

  describe('createCompany', () => {
    it('should create a company with minimal data', async () => {
      const client = createMockClient({
        'companies.add': mockCompanies.add,
      });

      const result = await createCompany(client, {
        name: 'New Company',
      });

      expect(result.type).toBe('company');
      expect(result.id).toBe('company-uuid-new');
    });

    it('should create a company with full data', async () => {
      const client = createMockClient({
        'companies.add': mockCompanies.add,
      });

      const result = await createCompany(client, {
        name: 'Full Company',
        vat_number: 'BE0123456789',
        emails: [{ type: 'primary', email: 'info@test.com' }],
        telephones: [{ type: 'phone', number: '+32 123 45 67' }],
        website: 'https://test.com',
        addresses: [{
          type: 'primary',
          address: {
            line_1: 'Test Street 1',
            postal_code: '1000',
            city: 'Brussels',
            country: 'BE',
          },
        }],
        language: 'nl',
        tags: ['new', 'prospect'],
        preferred_currency: 'EUR',
      });

      expect(result.type).toBe('company');
    });

    it('should throw error for missing name', async () => {
      const client = createMockClient({});

      await expect(createCompany(client, { name: '' })).rejects.toThrow();
    });
  });

  describe('updateCompany', () => {
    it('should update a company', async () => {
      const client = createMockClient({
        'companies.update': {}, // 204 response
      });

      await expect(updateCompany(client, {
        id: 'f3d67f3e-b8a9-45e8-99b1-17a3b14de8a6',
        name: 'Updated Company Name',
      })).resolves.toBeUndefined();
    });

    it('should update company tags', async () => {
      const client = createMockClient({
        'companies.update': {},
      });

      await expect(updateCompany(client, {
        id: 'f3d67f3e-b8a9-45e8-99b1-17a3b14de8a6',
        tags: ['updated', 'important'],
      })).resolves.toBeUndefined();
    });
  });

  describe('deleteCompany', () => {
    it('should delete a company', async () => {
      const client = createMockClient({
        'companies.delete': {},
      });

      await expect(deleteCompany(client, 'f3d67f3e-b8a9-45e8-99b1-17a3b14de8a6')).resolves.toBeUndefined();
    });
  });

  describe('tagCompany', () => {
    it('should add tags to a company', async () => {
      const client = createMockClient({
        'companies.tag': {},
      });

      await expect(tagCompany(client, 'f3d67f3e-b8a9-45e8-99b1-17a3b14de8a6', ['new-tag'])).resolves.toBeUndefined();
    });

    it('should throw for empty tags array', async () => {
      const client = createMockClient({});

      await expect(tagCompany(client, 'f3d67f3e-b8a9-45e8-99b1-17a3b14de8a6', [])).rejects.toThrow();
    });
  });

  describe('untagCompany', () => {
    it('should remove tags from a company', async () => {
      const client = createMockClient({
        'companies.untag': {},
      });

      await expect(untagCompany(client, 'f3d67f3e-b8a9-45e8-99b1-17a3b14de8a6', ['old-tag'])).resolves.toBeUndefined();
    });
  });

  describe('Schema Validation', () => {
    describe('CompaniesListFilterSchema', () => {
      it('should accept valid filter with term', () => {
        const result = CompaniesListFilterSchema.parse({ term: 'Acme' });
        expect(result.term).toBe('Acme');
      });

      it('should accept valid filter with status', () => {
        const result = CompaniesListFilterSchema.parse({ status: 'active' });
        expect(result.status).toBe('active');
      });

      it('should accept valid filter with vat_number', () => {
        const result = CompaniesListFilterSchema.parse({ vat_number: 'BE 0899.623.035' });
        expect(result.vat_number).toBe('BE 0899.623.035');
      });

      it('should accept valid filter with tags', () => {
        const result = CompaniesListFilterSchema.parse({ tags: ['partner', 'enterprise'] });
        expect(result.tags).toEqual(['partner', 'enterprise']);
      });

      it('should reject unknown filter fields', () => {
        expect(() => CompaniesListFilterSchema.parse({ unknown: 'field' })).toThrow();
      });
    });

    describe('CompanyCreateSchema', () => {
      it('should accept minimal company data', () => {
        const result = CompanyCreateSchema.parse({ name: 'Test Company' });
        expect(result.name).toBe('Test Company');
      });

      it('should accept full company data', () => {
        const input = {
          name: 'Full Company',
          business_type_id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
          vat_number: 'BE0899623035',
          emails: [{ type: 'primary' as const, email: 'info@test.com' }],
          telephones: [{ type: 'phone' as const, number: '+32 2 123 45 67' }],
          website: 'https://test.com',
          language: 'nl',
          tags: ['new'],
          preferred_currency: 'EUR',
        };
        const result = CompanyCreateSchema.parse(input);
        expect(result.name).toBe('Full Company');
        expect(result.emails).toHaveLength(1);
      });

      it('should reject empty name', () => {
        expect(() => CompanyCreateSchema.parse({ name: '' })).toThrow();
      });

      it('should reject invalid email format', () => {
        expect(() => CompanyCreateSchema.parse({
          name: 'Test',
          emails: [{ type: 'primary', email: 'invalid' }],
        })).toThrow();
      });

      it('should reject invalid currency code', () => {
        expect(() => CompanyCreateSchema.parse({
          name: 'Test',
          preferred_currency: 'EURO', // Should be 3 chars
        })).toThrow();
      });
    });

    describe('CompanyUpdateSchema', () => {
      it('should accept update with only ID', () => {
        const result = CompanyUpdateSchema.parse({
          id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        });
        expect(result.id).toBe('fd48d4a3-b9dc-4eac-8071-5889c9f21e5d');
      });

      it('should accept nullable fields', () => {
        const result = CompanyUpdateSchema.parse({
          id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
          vat_number: null,
          website: null,
          responsible_user_id: null,
        });
        expect(result.vat_number).toBeNull();
      });

      it('should reject invalid UUID for ID', () => {
        expect(() => CompanyUpdateSchema.parse({ id: 'invalid' })).toThrow();
      });
    });
  });
});
