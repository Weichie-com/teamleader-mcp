/**
 * Token Manager for Teamleader Focus
 * 
 * Handles two modes:
 * 1. Static token - Simple ACCESS_TOKEN only (current behavior)
 * 2. OAuth refresh - Full OAuth flow with automatic token refresh
 * 
 * The manager ensures tokens are refreshed before expiry and persists
 * new tokens to storage for future use.
 */

import { refreshAccessToken, type OAuthConfig, type TokenResponse } from './oauth.js';
import * as fs from 'fs/promises';
import * as path from 'path';

// Refresh token 5 minutes before expiry
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

// Retry settings
const MAX_REFRESH_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export interface TokenManagerConfig {
  // Required: at minimum an access token
  accessToken: string;
  
  // Optional: for OAuth refresh flow
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  
  // Optional: custom token storage path (defaults to ~/.teamleader-tokens.json)
  tokenStoragePath?: string;
}

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

/**
 * Manages access tokens with optional automatic refresh
 */
export class TokenManager {
  private accessToken: string;
  private refreshToken?: string;
  private expiresAt?: number;
  private oauthConfig?: OAuthConfig;
  private tokenStoragePath?: string;
  private refreshPromise?: Promise<void>;
  
  constructor(config: TokenManagerConfig) {
    this.accessToken = config.accessToken;
    this.refreshToken = config.refreshToken;
    this.tokenStoragePath = config.tokenStoragePath;
    
    // Only enable OAuth refresh if all required fields are present
    if (config.clientId && config.clientSecret && config.refreshToken) {
      this.oauthConfig = {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        // redirectUri not needed for refresh flow, but required by schema
        redirectUri: 'http://localhost:3000/callback',
      };
      console.error('[TokenManager] OAuth refresh enabled');
    } else {
      console.error('[TokenManager] Static token mode (no refresh)');
    }
  }
  
  /**
   * Check if OAuth refresh is available
   */
  canRefresh(): boolean {
    return !!this.oauthConfig && !!this.refreshToken;
  }
  
  /**
   * Check if token needs refresh
   */
  private needsRefresh(): boolean {
    if (!this.canRefresh()) return false;
    if (!this.expiresAt) return false;
    return Date.now() > this.expiresAt - REFRESH_BUFFER_MS;
  }
  
  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    // If we need to refresh and can refresh, do it
    if (this.needsRefresh()) {
      await this.refresh();
    }
    return this.accessToken;
  }
  
  /**
   * Force a token refresh (with retry logic)
   */
  async refresh(): Promise<void> {
    // Prevent concurrent refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }
    
    if (!this.canRefresh()) {
      throw new Error('Token refresh not available. Set CLIENT_ID, CLIENT_SECRET, and REFRESH_TOKEN.');
    }
    
    this.refreshPromise = this.doRefresh();
    
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = undefined;
    }
  }
  
  private async doRefresh(): Promise<void> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= MAX_REFRESH_RETRIES; attempt++) {
      try {
        console.error(`[TokenManager] Refreshing token (attempt ${attempt}/${MAX_REFRESH_RETRIES})...`);
        
        const tokens = await refreshAccessToken(this.oauthConfig!, this.refreshToken!);
        
        this.accessToken = tokens.access_token;
        this.refreshToken = tokens.refresh_token;
        this.expiresAt = Date.now() + tokens.expires_in * 1000;
        
        console.error(`[TokenManager] Token refreshed successfully. Expires in ${tokens.expires_in}s`);
        
        // Persist tokens
        await this.saveTokens();
        
        return;
      } catch (error) {
        lastError = error as Error;
        console.error(`[TokenManager] Refresh attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < MAX_REFRESH_RETRIES) {
          await this.sleep(RETRY_DELAY_MS * attempt);
        }
      }
    }
    
    throw new Error(`Token refresh failed after ${MAX_REFRESH_RETRIES} attempts: ${lastError?.message}`);
  }
  
  /**
   * Save tokens to storage file
   */
  private async saveTokens(): Promise<void> {
    if (!this.tokenStoragePath) {
      // Default to home directory
      const home = process.env.HOME || process.env.USERPROFILE || '/tmp';
      this.tokenStoragePath = path.join(home, '.teamleader-tokens.json');
    }
    
    const stored: StoredTokens = {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken!,
      expiresAt: this.expiresAt,
    };
    
    try {
      await fs.writeFile(this.tokenStoragePath, JSON.stringify(stored, null, 2), 'utf-8');
      console.error(`[TokenManager] Tokens saved to ${this.tokenStoragePath}`);
    } catch (error) {
      console.error('[TokenManager] Failed to save tokens:', (error as Error).message);
    }
  }
  
  /**
   * Load tokens from storage file (call at startup)
   */
  async loadStoredTokens(): Promise<boolean> {
    if (!this.tokenStoragePath) {
      const home = process.env.HOME || process.env.USERPROFILE || '/tmp';
      this.tokenStoragePath = path.join(home, '.teamleader-tokens.json');
    }
    
    try {
      const data = await fs.readFile(this.tokenStoragePath, 'utf-8');
      const stored: StoredTokens = JSON.parse(data);
      
      // Only use stored tokens if they're newer
      if (stored.accessToken && stored.refreshToken) {
        this.accessToken = stored.accessToken;
        this.refreshToken = stored.refreshToken;
        this.expiresAt = stored.expiresAt;
        console.error('[TokenManager] Loaded tokens from storage');
        return true;
      }
    } catch {
      // File doesn't exist or is invalid - that's fine
    }
    
    return false;
  }
  
  /**
   * Initialize the token manager
   * - Loads stored tokens if available
   * - Sets expiry to trigger refresh on first use if unknown
   */
  async initialize(): Promise<void> {
    // Try to load stored tokens
    await this.loadStoredTokens();
    
    // If we can refresh but don't know expiry, assume it will expire soon
    // This ensures a fresh token on first API call
    if (this.canRefresh() && !this.expiresAt) {
      // Set expiry to 1 hour from now (Teamleader tokens last 1 hour)
      // This avoids immediate refresh but will refresh if needed
      this.expiresAt = Date.now() + 60 * 60 * 1000;
      console.error('[TokenManager] Set initial expiry to 1 hour from now');
    }
  }
  
  /**
   * Set token expiry manually (useful when receiving 401 errors)
   */
  setExpired(): void {
    this.expiresAt = 0;
  }

  /**
   * Set the expiry timestamp directly
   */
  setExpiresAt(timestamp: number): void {
    this.expiresAt = timestamp;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create a TokenManager from environment variables
 */
export function createTokenManagerFromEnv(): TokenManager | null {
  const accessToken = process.env.TEAMLEADER_ACCESS_TOKEN;

  if (!accessToken) {
    return null;
  }

  return new TokenManager({
    accessToken,
    clientId: process.env.TEAMLEADER_CLIENT_ID,
    clientSecret: process.env.TEAMLEADER_CLIENT_SECRET,
    refreshToken: process.env.TEAMLEADER_REFRESH_TOKEN,
    tokenStoragePath: process.env.TEAMLEADER_TOKEN_STORAGE,
  });
}

/**
 * Create a TokenManager from stored CLI credentials (~/.teamleader-mcp/)
 */
export async function createTokenManagerFromStoredCredentials(): Promise<TokenManager | null> {
  const home = process.env.HOME || process.env.USERPROFILE || '/tmp';
  const configDir = path.join(home, '.teamleader-mcp');
  const credentialsFile = path.join(configDir, 'credentials.json');
  const configFile = path.join(configDir, 'config.json');

  let credentials: { accessToken: string; refreshToken: string; expiresAt?: number } | null = null;
  try {
    const data = await fs.readFile(credentialsFile, 'utf-8');
    credentials = JSON.parse(data);
  } catch {
    return null;
  }

  if (!credentials?.accessToken) {
    return null;
  }

  let clientId: string | undefined;
  let clientSecret: string | undefined;
  try {
    const data = await fs.readFile(configFile, 'utf-8');
    const config = JSON.parse(data);
    clientId = config.clientId;
    clientSecret = config.clientSecret;
  } catch {
    // No config file - refresh won't be available
  }

  const manager = new TokenManager({
    accessToken: credentials.accessToken,
    refreshToken: credentials.refreshToken,
    clientId,
    clientSecret,
    tokenStoragePath: credentialsFile,
  });

  if (credentials.expiresAt) {
    manager.setExpiresAt(credentials.expiresAt);
  }

  console.error('[TokenManager] Loaded credentials from ~/.teamleader-mcp/');
  return manager;
}
