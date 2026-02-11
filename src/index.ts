#!/usr/bin/env node
/**
 * Teamleader Focus MCP Server
 *
 * Entry point for the MCP server. Reads configuration from
 * environment variables or stored CLI credentials.
 *
 * Priority:
 * 1. Environment variables (TEAMLEADER_ACCESS_TOKEN, etc.)
 * 2. Stored credentials from `npx teamleader-mcp auth` (~/.teamleader-mcp/)
 */

import { startServer } from './server.js';
import { createTokenManagerFromEnv, createTokenManagerFromStoredCredentials } from './auth/token-manager.js';

async function main() {
  // Try environment variables first
  let tokenManager = createTokenManagerFromEnv();

  // Fall back to stored CLI credentials
  if (!tokenManager) {
    tokenManager = await createTokenManagerFromStoredCredentials();
  }

  if (!tokenManager) {
    console.error('Error: No Teamleader credentials found.');
    console.error('');
    console.error('Run this first to authenticate:');
    console.error('  npx teamleader-mcp auth');
    console.error('');
    console.error('Or set environment variables:');
    console.error('  TEAMLEADER_ACCESS_TOKEN, TEAMLEADER_CLIENT_ID,');
    console.error('  TEAMLEADER_CLIENT_SECRET, TEAMLEADER_REFRESH_TOKEN');
    console.error('');
    process.exit(1);
  }

  await startServer(tokenManager);
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
