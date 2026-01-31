/**
 * Products Tools for Teamleader Focus
 * 
 * API Endpoints:
 * - POST products.list - List products
 * - POST products.info - Get product details
 * - POST products.add - Create a new product
 * - POST products.update - Update a product
 * - POST products.delete - Delete a product
 */

import { z } from 'zod';
import type { TeamleaderClient, ApiResponse, CreateResponse } from '../client/teamleader.js';

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const MoneySchema = z.object({
  amount: z.number(),
  currency: z.string().default('EUR'),
});

const CustomFieldValueSchema = z.object({
  id: z.string().uuid(),
  value: z.unknown(),
});

const StockSchema = z.object({
  amount: z.number(),
  unit: z.object({
    type: z.string(),
    id: z.string().uuid(),
  }).optional(),
});

const ConfigurationSchema = z.object({
  stock_management_enabled: z.boolean().optional(),
});

// Filter schema for listing products
export const ProductsListFilterSchema = z.object({
  ids: z.array(z.string().uuid()).optional(),
  term: z.string().optional().describe('Search term for product name or code'),
  updated_since: z.string().optional(),
}).strict();

// Schema for creating a product
export const ProductCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().describe('Uses Markdown formatting'),
  code: z.string().optional(),
  purchase_price: MoneySchema.optional(),
  selling_price: MoneySchema.optional(),
  department_id: z.string().uuid().optional(),
  product_category_id: z.string().uuid().optional(),
  tax_rate_id: z.string().uuid().optional(),
  unit_of_measure_id: z.string().uuid().optional(),
  stock: StockSchema.optional(),
  configuration: ConfigurationSchema.optional(),
  custom_fields: z.array(CustomFieldValueSchema).optional(),
  price_list_prices: z.array(z.object({
    price_list_id: z.string().uuid(),
    price: MoneySchema,
  })).optional(),
}).strict();

// Schema for updating a product
export const ProductUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable().describe('Uses Markdown formatting'),
  code: z.string().optional().nullable(),
  purchase_price: MoneySchema.optional().nullable(),
  selling_price: MoneySchema.optional().nullable(),
  department_id: z.string().uuid().optional().nullable(),
  product_category_id: z.string().uuid().optional().nullable(),
  tax_rate_id: z.string().uuid().optional().nullable(),
  unit_of_measure_id: z.string().uuid().optional().nullable(),
  stock: StockSchema.optional().nullable(),
  configuration: ConfigurationSchema.optional().nullable(),
  custom_fields: z.array(CustomFieldValueSchema).optional(),
}).strict();

export type ProductsListFilter = z.infer<typeof ProductsListFilterSchema>;
export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface Money {
  amount: number;
  currency: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  purchase_price?: Money | null;
  selling_price?: Money | null;
  department?: {
    type: string;
    id: string;
  } | null;
  product_category?: {
    type: string;
    id: string;
  } | null;
  tax?: {
    type: string;
    id: string;
  } | null;
  unit?: {
    type: string;
    id: string;
  } | null;
  stock?: {
    amount: number;
    unit?: {
      type: string;
      id: string;
    };
  } | null;
  configuration?: {
    stock_management_enabled: boolean;
  } | null;
  custom_fields?: Array<{ id: string; value: unknown }>;
  price_list_prices?: Array<{
    price_list_id: string;
    price: Money;
  }>;
  suppliers?: Array<{
    supplier: {
      type: string;
      id: string;
    };
    supplier_product_code: string | null;
  }>;
  added_at: string;
  updated_at: string;
}

// ============================================================================
// TOOL FUNCTIONS
// ============================================================================

/**
 * List products with optional filters
 */
export async function listProducts(
  client: TeamleaderClient,
  filter: ProductsListFilter = {},
  page?: { size?: number; number?: number }
): Promise<ApiResponse<Product[]>> {
  const validatedFilter = ProductsListFilterSchema.parse(filter);
  
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
  
  return client.request<Product[]>('products.list', body);
}

/**
 * Get product details by ID
 */
export async function getProductInfo(
  client: TeamleaderClient,
  id: string,
  includes?: string[]
): Promise<ApiResponse<Product>> {
  z.string().uuid().parse(id);
  
  const body: Record<string, unknown> = { id };
  
  if (includes && includes.length > 0) {
    body.includes = includes.join(',');
  }
  
  return client.request<Product>('products.info', body);
}

/**
 * Create a new product
 */
export async function createProduct(
  client: TeamleaderClient,
  input: ProductCreateInput
): Promise<CreateResponse> {
  const validated = ProductCreateSchema.parse(input);
  
  return client.create('products.add', validated);
}

/**
 * Update an existing product
 */
export async function updateProduct(
  client: TeamleaderClient,
  input: ProductUpdateInput
): Promise<void> {
  const validated = ProductUpdateSchema.parse(input);
  
  await client.request('products.update', validated);
}

/**
 * Delete a product
 */
export async function deleteProduct(
  client: TeamleaderClient,
  id: string
): Promise<void> {
  z.string().uuid().parse(id);
  
  await client.request('products.delete', { id });
}
