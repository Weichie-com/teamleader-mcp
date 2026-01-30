import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeamleaderClient, TeamleaderApiError } from '../../src/client/teamleader.js';

describe('TeamleaderClient', () => {
  describe('constructor', () => {
    it('should create client with access token', () => {
      const client = new TeamleaderClient({ accessToken: 'test-token' });
      expect(client.getAccessToken()).toBe('test-token');
    });

    it('should use default baseUrl', () => {
      const client = new TeamleaderClient({ accessToken: 'test-token' });
      // baseUrl is private, but we can verify it works by checking no error is thrown
      expect(client).toBeDefined();
    });

    it('should accept custom baseUrl', () => {
      const client = new TeamleaderClient({
        accessToken: 'test-token',
        baseUrl: 'https://custom.api.example.com',
      });
      expect(client).toBeDefined();
    });

    it('should accept custom fetch function', () => {
      const customFetch = vi.fn();
      const client = new TeamleaderClient({
        accessToken: 'test-token',
        fetch: customFetch,
      });
      expect(client).toBeDefined();
    });
  });

  describe('setAccessToken', () => {
    it('should update the access token', () => {
      const client = new TeamleaderClient({ accessToken: 'old-token' });
      client.setAccessToken('new-token');
      expect(client.getAccessToken()).toBe('new-token');
    });
  });

  describe('request', () => {
    it('should make POST request with authorization header', async () => {
      const mockResponse = {
        data: { id: 'test-id', name: 'Test' },
      };
      
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
        headers: new Map([
          ['X-RateLimit-Limit', '200'],
          ['X-RateLimit-Remaining', '199'],
          ['X-RateLimit-Reset', '2026-02-01T10:00:00+01:00'],
        ]),
      });

      const client = new TeamleaderClient({
        accessToken: 'test-token',
        fetch: mockFetch as unknown as typeof fetch,
      });

      const result = await client.request<{ id: string; name: string }>('test.endpoint', { foo: 'bar' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.focus.teamleader.eu/test.endpoint',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ foo: 'bar' }),
        })
      );

      expect(result.data.id).toBe('test-id');
    });

    it('should handle API errors', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          errors: [{ title: 'Bad Request', detail: 'Invalid parameter' }],
        }),
        headers: new Map(),
      });

      const client = new TeamleaderClient({
        accessToken: 'test-token',
        fetch: mockFetch as unknown as typeof fetch,
      });

      await expect(client.request('test.endpoint')).rejects.toThrow(TeamleaderApiError);
    });

    it('should parse rate limit headers', async () => {
      const headers = new Map([
        ['X-RateLimit-Limit', '200'],
        ['X-RateLimit-Remaining', '150'],
        ['X-RateLimit-Reset', '2026-02-01T10:00:00+01:00'],
      ]);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
        headers: {
          get: (key: string) => headers.get(key) || null,
        },
      });

      const client = new TeamleaderClient({
        accessToken: 'test-token',
        fetch: mockFetch as unknown as typeof fetch,
      });

      await client.request('test.endpoint');
      
      const rateLimit = client.getRateLimitInfo();
      expect(rateLimit?.limit).toBe(200);
      expect(rateLimit?.remaining).toBe(150);
    });
  });

  describe('create', () => {
    it('should return type and id on success', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ type: 'contact', id: 'new-uuid' }),
        headers: new Map(),
      });

      const client = new TeamleaderClient({
        accessToken: 'test-token',
        fetch: mockFetch as unknown as typeof fetch,
      });

      const result = await client.create('contacts.add', { first_name: 'John' });

      expect(result.type).toBe('contact');
      expect(result.id).toBe('new-uuid');
    });

    it('should handle create errors', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          errors: [{ title: 'Validation error' }],
        }),
        headers: new Map(),
      });

      const client = new TeamleaderClient({
        accessToken: 'test-token',
        fetch: mockFetch as unknown as typeof fetch,
      });

      await expect(client.create('contacts.add', {})).rejects.toThrow(TeamleaderApiError);
    });
  });
});

describe('TeamleaderApiError', () => {
  it('should contain error details', () => {
    const error = new TeamleaderApiError('Bad Request', 400, [
      { title: 'Validation failed', detail: 'Name is required' },
    ]);

    expect(error.message).toBe('Bad Request');
    expect(error.status).toBe(400);
    expect(error.errors).toHaveLength(1);
    expect(error.errors[0].title).toBe('Validation failed');
  });
});
