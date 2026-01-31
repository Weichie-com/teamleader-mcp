/**
 * Tests for Products Tools
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listProducts,
  getProductInfo,
  createProduct,
  updateProduct,
  deleteProduct,
  ProductsListFilterSchema,
  ProductCreateSchema,
  ProductUpdateSchema,
} from '../../src/tools/products.js';
import { mockProducts, createMockFetch } from '../mocks/teamleader.js';
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

describe('Products Tools', () => {
  describe('listProducts', () => {
    it('should list products without filters', async () => {
      const client = createMockClient({
        'products.list': mockProducts.list,
      });

      const result = await listProducts(client);

      expect(result.data).toHaveLength(3);
      expect(result.data[0].name).toBe('Web Development Hour');
      expect(result.data[0].code).toBe('WEB-DEV-HOUR');
      expect(result.data[0].selling_price?.amount).toBe(100);
    });

    it('should list products with term filter', async () => {
      const client = createMockClient({
        'products.list': mockProducts.list,
      });

      const result = await listProducts(client, { term: 'Hosting' });

      expect(result.data).toBeDefined();
    });

    it('should list products with updated_since filter', async () => {
      const client = createMockClient({
        'products.list': mockProducts.list,
      });

      const result = await listProducts(client, { updated_since: '2026-01-01T00:00:00+00:00' });

      expect(result.data).toBeDefined();
    });

    it('should list products with pagination', async () => {
      const client = createMockClient({
        'products.list': mockProducts.list,
      });

      const result = await listProducts(client, {}, { size: 10, number: 1 });

      expect(result.meta?.page).toBeDefined();
      expect(result.meta?.matches).toBe(3);
    });
  });

  describe('getProductInfo', () => {
    it('should get product details by ID', async () => {
      const client = createMockClient({
        'products.info': mockProducts.info,
      });

      const result = await getProductInfo(client, 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d');

      expect(result.data.id).toBe('product-uuid-1');
      expect(result.data.name).toBe('Web Development Hour');
      expect(result.data.description).toBe('One hour of web development work');
      expect(result.data.department?.id).toBe('department-uuid-1');
      expect(result.data.product_category?.id).toBe('category-uuid-services');
      expect(result.data.configuration?.stock_management_enabled).toBe(false);
    });

    it('should get product with suppliers include', async () => {
      const client = createMockClient({
        'products.info': mockProducts.info,
      });

      const result = await getProductInfo(client, 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d', ['suppliers']);

      expect(result.data).toBeDefined();
    });

    it('should throw error for invalid UUID', async () => {
      const client = createMockClient({});

      await expect(getProductInfo(client, 'invalid-id')).rejects.toThrow();
    });
  });

  describe('createProduct', () => {
    it('should create a product with minimal data', async () => {
      const client = createMockClient({
        'products.add': mockProducts.add,
      });

      const result = await createProduct(client, {
        name: 'New Product',
      });

      expect(result.type).toBe('product');
      expect(result.id).toBe('product-uuid-new');
    });

    it('should create a product with full data', async () => {
      const client = createMockClient({
        'products.add': mockProducts.add,
      });

      const result = await createProduct(client, {
        name: 'Full Product',
        description: 'A comprehensive product description in **Markdown**',
        code: 'FULL-PROD-001',
        purchase_price: { amount: 50, currency: 'EUR' },
        selling_price: { amount: 100, currency: 'EUR' },
        department_id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        product_category_id: 'ad48d4a3-b9dc-4eac-8071-5889c9f21e5a',
        tax_rate_id: 'bd48d4a3-b9dc-4eac-8071-5889c9f21e5b',
        unit_of_measure_id: 'cd48d4a3-b9dc-4eac-8071-5889c9f21e5c',
        stock: { amount: 100 },
        configuration: { stock_management_enabled: true },
      });

      expect(result.type).toBe('product');
    });

    it('should create a product with price list prices', async () => {
      const client = createMockClient({
        'products.add': mockProducts.add,
      });

      const result = await createProduct(client, {
        name: 'Product with Price Lists',
        price_list_prices: [
          { price_list_id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d', price: { amount: 90, currency: 'EUR' } },
          { price_list_id: 'ad48d4a3-b9dc-4eac-8071-5889c9f21e5a', price: { amount: 80, currency: 'EUR' } },
        ],
      });

      expect(result.type).toBe('product');
    });

    it('should throw error for missing name', async () => {
      const client = createMockClient({});

      await expect(createProduct(client, { name: '' })).rejects.toThrow();
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const client = createMockClient({
        'products.update': {},
      });

      await expect(updateProduct(client, {
        id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        name: 'Updated Product Name',
      })).resolves.toBeUndefined();
    });

    it('should update product with nullable fields', async () => {
      const client = createMockClient({
        'products.update': {},
      });

      await expect(updateProduct(client, {
        id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        description: null,
        code: null,
        purchase_price: null,
      })).resolves.toBeUndefined();
    });

    it('should update product selling price', async () => {
      const client = createMockClient({
        'products.update': {},
      });

      await expect(updateProduct(client, {
        id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        selling_price: { amount: 150, currency: 'EUR' },
      })).resolves.toBeUndefined();
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      const client = createMockClient({
        'products.delete': {},
      });

      await expect(deleteProduct(client, 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d')).resolves.toBeUndefined();
    });

    it('should throw error for invalid UUID', async () => {
      const client = createMockClient({});

      await expect(deleteProduct(client, 'invalid')).rejects.toThrow();
    });
  });

  describe('Schema Validation', () => {
    describe('ProductsListFilterSchema', () => {
      it('should accept valid filter with term', () => {
        const result = ProductsListFilterSchema.parse({ term: 'hosting' });
        expect(result.term).toBe('hosting');
      });

      it('should accept valid filter with updated_since', () => {
        const result = ProductsListFilterSchema.parse({ updated_since: '2026-01-01T00:00:00+00:00' });
        expect(result.updated_since).toBe('2026-01-01T00:00:00+00:00');
      });

      it('should accept valid filter with ids', () => {
        const result = ProductsListFilterSchema.parse({
          ids: ['fd48d4a3-b9dc-4eac-8071-5889c9f21e5d'],
        });
        expect(result.ids).toHaveLength(1);
      });

      it('should reject unknown filter fields', () => {
        expect(() => ProductsListFilterSchema.parse({ unknown: 'field' })).toThrow();
      });
    });

    describe('ProductCreateSchema', () => {
      it('should accept minimal product data', () => {
        const result = ProductCreateSchema.parse({ name: 'Test Product' });
        expect(result.name).toBe('Test Product');
      });

      it('should accept full product data', () => {
        const input = {
          name: 'Full Product',
          description: 'Description',
          code: 'TEST-001',
          purchase_price: { amount: 50, currency: 'EUR' },
          selling_price: { amount: 100, currency: 'EUR' },
          department_id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        };
        const result = ProductCreateSchema.parse(input);
        expect(result.name).toBe('Full Product');
        expect(result.purchase_price?.amount).toBe(50);
      });

      it('should reject empty name', () => {
        expect(() => ProductCreateSchema.parse({ name: '' })).toThrow();
      });

      it('should accept stock configuration', () => {
        const result = ProductCreateSchema.parse({
          name: 'Product with Stock',
          stock: { amount: 50 },
          configuration: { stock_management_enabled: true },
        });
        expect(result.stock?.amount).toBe(50);
        expect(result.configuration?.stock_management_enabled).toBe(true);
      });
    });

    describe('ProductUpdateSchema', () => {
      it('should accept update with only ID', () => {
        const result = ProductUpdateSchema.parse({
          id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
        });
        expect(result.id).toBe('fd48d4a3-b9dc-4eac-8071-5889c9f21e5d');
      });

      it('should accept nullable fields', () => {
        const result = ProductUpdateSchema.parse({
          id: 'fd48d4a3-b9dc-4eac-8071-5889c9f21e5d',
          description: null,
          code: null,
          purchase_price: null,
          selling_price: null,
        });
        expect(result.description).toBeNull();
        expect(result.code).toBeNull();
      });

      it('should reject invalid UUID for ID', () => {
        expect(() => ProductUpdateSchema.parse({ id: 'invalid' })).toThrow();
      });
    });
  });
});
