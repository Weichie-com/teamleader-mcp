/**
 * OAuth 2.0 Authentication for Teamleader Focus
 * 
 * Authorization flow:
 * 1. Redirect user to authorization URL
 * 2. User grants access, redirected back with authorization code
 * 3. Exchange code for access token + refresh token
 * 4. Use access token for API calls
 * 5. Refresh access token when expired
 */

import { z } from 'zod';

// Configuration schema
export const OAuthConfigSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string().url(),
  scopes: z.array(z.string()).optional(),
});

export type OAuthConfig = z.infer<typeof OAuthConfigSchema>;

// Token response
export interface TokenResponse {
  token_type: 'Bearer';
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

const AUTHORIZE_URL = 'https://focus.teamleader.eu/oauth2/authorize';
const TOKEN_URL = 'https://focus.teamleader.eu/oauth2/access_token';

/**
 * Generate the authorization URL for the OAuth flow
 */
export function getAuthorizationUrl(config: OAuthConfig, state?: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
  });
  
  if (state) {
    params.set('state', state);
  }
  
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  config: OAuthConfig,
  code: string
): Promise<TokenResponse> {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }
  
  return response.json() as Promise<TokenResponse>;
}

/**
 * Refresh the access token using refresh token
 */
export async function refreshAccessToken(
  config: OAuthConfig,
  refreshToken: string
): Promise<TokenResponse> {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }
  
  return response.json() as Promise<TokenResponse>;
}

/**
 * Token storage interface
 * Implement this to persist tokens (file, database, etc.)
 */
export interface TokenStorage {
  getTokens(): Promise<{ accessToken: string; refreshToken: string } | null>;
  saveTokens(accessToken: string, refreshToken: string): Promise<void>;
  clearTokens(): Promise<void>;
}

/**
 * Simple file-based token storage
 */
export class FileTokenStorage implements TokenStorage {
  constructor(private filePath: string) {}
  
  async getTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const fs = await import('fs/promises');
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    const fs = await import('fs/promises');
    await fs.writeFile(this.filePath, JSON.stringify({ accessToken, refreshToken }));
  }
  
  async clearTokens(): Promise<void> {
    const fs = await import('fs/promises');
    try {
      await fs.unlink(this.filePath);
    } catch {
      // Ignore if file doesn't exist
    }
  }
}

/**
 * OAuth manager that handles token refresh automatically
 */
export class OAuthManager {
  private config: OAuthConfig;
  private storage: TokenStorage;
  private accessToken?: string;
  private refreshToken?: string;
  private expiresAt?: number;
  
  constructor(config: OAuthConfig, storage: TokenStorage) {
    this.config = OAuthConfigSchema.parse(config);
    this.storage = storage;
  }
  
  /**
   * Initialize from stored tokens
   */
  async initialize(): Promise<boolean> {
    const tokens = await this.storage.getTokens();
    if (tokens) {
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
      return true;
    }
    return false;
  }
  
  /**
   * Get the authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    return getAuthorizationUrl(this.config, state);
  }
  
  /**
   * Handle the OAuth callback
   */
  async handleCallback(code: string): Promise<void> {
    const tokens = await exchangeCodeForTokens(this.config, code);
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.expiresAt = Date.now() + tokens.expires_in * 1000;
    await this.storage.saveTokens(this.accessToken, this.refreshToken);
  }
  
  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    if (!this.accessToken || !this.refreshToken) {
      throw new Error('Not authenticated. Please complete the OAuth flow first.');
    }
    
    // Refresh if expired or about to expire (within 5 minutes)
    if (this.expiresAt && Date.now() > this.expiresAt - 300000) {
      await this.refresh();
    }
    
    return this.accessToken;
  }
  
  /**
   * Refresh the access token
   */
  async refresh(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const tokens = await refreshAccessToken(this.config, this.refreshToken);
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.expiresAt = Date.now() + tokens.expires_in * 1000;
    await this.storage.saveTokens(this.accessToken, this.refreshToken);
  }
  
  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.refreshToken;
  }
  
  /**
   * Clear authentication
   */
  async logout(): Promise<void> {
    this.accessToken = undefined;
    this.refreshToken = undefined;
    this.expiresAt = undefined;
    await this.storage.clearTokens();
  }
}
