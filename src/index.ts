#!/usr/bin/env node
/**
 * Teamleader Focus MCP Server
 * 
 * Entry point for the MCP server. Reads configuration from
 * environment variables and starts the server.
 * 
 * Supports two modes:
 * 1. Static token - Set TEAMLEADER_ACCESS_TOKEN only (no refresh)
 * 2. OAuth refresh - Set CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN for auto-refresh
 */

import { startServer } from './server.js';
import { createTokenManagerFromEnv } from './auth/token-manager.js';

// Read configuration from environment
const tokenManager = createTokenManagerFromEnv();

if (!tokenManager) {
  console.error('Error: TEAMLEADER_ACCESS_TOKEN environment variable is required');
  console.error('');
  console.error('Required:');
  console.error('  TEAMLEADER_ACCESS_TOKEN - Your Teamleader access token');
  console.error('');
  console.error('Optional (for automatic token refresh):');
  console.error('  TEAMLEADER_CLIENT_ID     - OAuth client ID');
  console.error('  TEAMLEADER_CLIENT_SECRET - OAuth client secret');
  console.error('  TEAMLEADER_REFRESH_TOKEN - OAuth refresh token');
  console.error('  TEAMLEADER_TOKEN_STORAGE - Path to token storage file');
  console.error('');
  console.error('To obtain credentials:');
  console.error('1. Register your integration at https://marketplace.focus.teamleader.eu/build');
  console.error('2. Complete the OAuth 2.0 authorization flow');
  console.error('3. Set the environment variables');
  console.error('');
  console.error('See README.md for detailed setup instructions.');
  process.exit(1);
}

// Start the server with token manager
startServer(tokenManager).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
