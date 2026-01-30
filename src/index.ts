#!/usr/bin/env node
/**
 * Teamleader Focus MCP Server
 * 
 * Entry point for the MCP server. Reads configuration from
 * environment variables and starts the server.
 */

import { startServer } from './server.js';

// Read configuration from environment
const accessToken = process.env.TEAMLEADER_ACCESS_TOKEN;

if (!accessToken) {
  console.error('Error: TEAMLEADER_ACCESS_TOKEN environment variable is required');
  console.error('');
  console.error('To obtain an access token:');
  console.error('1. Register your integration at https://marketplace.focus.teamleader.eu/build');
  console.error('2. Complete the OAuth 2.0 authorization flow');
  console.error('3. Set the access token in your environment');
  console.error('');
  console.error('See README.md for detailed setup instructions.');
  process.exit(1);
}

// Start the server
startServer(accessToken).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
