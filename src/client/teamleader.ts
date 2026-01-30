/**
 * Teamleader Focus API Client
 * 
 * A typed wrapper around the Teamleader Focus API.
 * Base URL: https://api.focus.teamleader.eu
 * All endpoints use POST with JSON body.
 */

import { z } from 'zod';

// Configuration schema
export const TeamleaderConfigSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  baseUrl: z.string().optional().default('https://api.focus.teamleader.eu'),
  // Allow custom fetch for testing
  fetch: z.function().args(z.any(), z.any()).returns(z.any()).optional(),
});

export type TeamleaderConfig = z.input<typeof TeamleaderConfigSchema>;

// API Response types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: {
      size: number;
      number: number;
    };
    matches: number;
  };
  included?: Record<string, unknown[]>;
}

export interface ApiError {
  errors: Array<{
    title: string;
    detail?: string;
    status?: number;
  }>;
}

export interface CreateResponse {
  type: string;
  id: string;
}

// Rate limit info
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: string;
}

export class TeamleaderApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: ApiError['errors']
  ) {
    super(message);
    this.name = 'TeamleaderApiError';
  }
}

export class TeamleaderClient {
  private config: TeamleaderConfig;
  private lastRateLimit?: RateLimitInfo;

  constructor(config: TeamleaderConfig) {
    this.config = TeamleaderConfigSchema.parse(config);
  }

  /**
   * Get the last rate limit information from API response headers
   */
  getRateLimitInfo(): RateLimitInfo | undefined {
    return this.lastRateLimit;
  }

  /**
   * Make an API request to Teamleader Focus
   */
  async request<T>(endpoint: string, body?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}/${endpoint}`;
    const fetchFn = this.config.fetch || fetch;

    const response = await fetchFn(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // Parse rate limit headers
    this.lastRateLimit = {
      limit: parseInt(response.headers.get('X-RateLimit-Limit') || '200'),
      remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '200'),
      reset: response.headers.get('X-RateLimit-Reset') || '',
    };

    const data = await response.json();

    if (!response.ok) {
      const apiError = data as ApiError;
      const errorMessage = apiError.errors?.[0]?.title || 'Unknown API error';
      throw new TeamleaderApiError(errorMessage, response.status, apiError.errors || []);
    }

    return data as ApiResponse<T>;
  }

  /**
   * Make a create request (returns type + id)
   */
  async create(endpoint: string, body: Record<string, unknown>): Promise<CreateResponse> {
    const url = `${this.config.baseUrl}/${endpoint}`;
    const fetchFn = this.config.fetch || fetch;

    const response = await fetchFn(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Parse rate limit headers
    this.lastRateLimit = {
      limit: parseInt(response.headers.get('X-RateLimit-Limit') || '200'),
      remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '200'),
      reset: response.headers.get('X-RateLimit-Reset') || '',
    };

    const data = await response.json();

    if (!response.ok) {
      const apiError = data as ApiError;
      const errorMessage = apiError.errors?.[0]?.title || 'Unknown API error';
      throw new TeamleaderApiError(errorMessage, response.status, apiError.errors || []);
    }

    return data as CreateResponse;
  }

  /**
   * Update the access token (after refresh)
   */
  setAccessToken(token: string): void {
    this.config.accessToken = token;
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string {
    return this.config.accessToken;
  }
}
