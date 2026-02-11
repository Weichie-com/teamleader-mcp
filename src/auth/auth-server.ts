/**
 * Local HTTP server for OAuth callback
 * 
 * Starts a temporary server to receive the OAuth callback,
 * exchanges the code for tokens, and shuts down.
 */

import * as http from 'http';
import { exchangeCodeForTokens, type OAuthConfig } from './oauth.js';

export interface AuthServerResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Start a local server and wait for the OAuth callback
 */
export function startAuthServer(
  config: OAuthConfig,
  port: number = 9876
): Promise<AuthServerResult> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url || '/', `http://localhost:${port}`);
      
      // Only handle the callback path
      if (url.pathname !== '/callback') {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');
      
      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(getErrorPage(error, errorDescription || 'Unknown error'));
        server.close();
        reject(new Error(`OAuth error: ${error} - ${errorDescription}`));
        return;
      }
      
      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(getErrorPage('missing_code', 'No authorization code received'));
        server.close();
        reject(new Error('No authorization code received'));
        return;
      }
      
      try {
        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(config, code);
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(getSuccessPage());
        
        // Close server after sending response
        server.close();
        
        resolve({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresIn: tokens.expires_in,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(getErrorPage('token_exchange_failed', message));
        server.close();
        reject(err);
      }
    });
    
    server.on('error', (err) => {
      reject(new Error(`Failed to start auth server: ${err.message}`));
    });
    
    server.listen(port, 'localhost', () => {
      console.log(`\n🔐 Waiting for authorization callback on http://localhost:${port}/callback\n`);
    });
    
    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('Authorization timed out (5 minutes)'));
    }, 5 * 60 * 1000);
  });
}

function getSuccessPage(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Authorization Successful - Teamleader MCP</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f7fa;
    }
    .container {
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      max-width: 480px;
      width: 90%;
    }
    .success-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #00c853 0%, #00a846 100%);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto 1.5rem;
    }
    .success-icon svg {
      width: 40px;
      height: 40px;
      fill: white;
    }
    h1 {
      color: #1a1a2e;
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }
    p {
      color: #666;
      margin-bottom: 1rem;
      line-height: 1.6;
    }
    .note {
      font-size: 0.875rem;
      color: #999;
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1.5rem;
    }
    .powered-by {
      margin-top: 2rem;
      font-size: 0.75rem;
      color: #aaa;
    }
    .powered-by a {
      color: #0066ff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-icon">
      <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
    </div>
    
    <h1>Authorization Successful!</h1>
    <p>Your Teamleader Focus account is now connected to the MCP integration.</p>
    
    <div class="note">
      ✓ You can close this window and return to the terminal.<br>
      ✓ Your tokens have been securely stored.
    </div>
    
    <div class="powered-by">
      Teamleader MCP by <a href="https://weichie.com" target="_blank">Weichie.com</a>
    </div>
  </div>
</body>
</html>`;
}

function getErrorPage(error: string, description: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Authorization Failed - Teamleader MCP</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f7fa;
    }
    .container {
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      max-width: 480px;
      width: 90%;
    }
    .error-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #ff5252 0%, #d32f2f 100%);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto 1.5rem;
    }
    .error-icon svg {
      width: 40px;
      height: 40px;
      fill: white;
    }
    h1 {
      color: #1a1a2e;
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }
    .error-code {
      display: inline-block;
      background: #ffebee;
      color: #c62828;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    p {
      color: #666;
      margin-bottom: 1rem;
      line-height: 1.6;
    }
    .note {
      font-size: 0.875rem;
      color: #999;
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1.5rem;
    }
    .powered-by {
      margin-top: 2rem;
      font-size: 0.75rem;
      color: #aaa;
    }
    .powered-by a {
      color: #0066ff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="error-icon">
      <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
    </div>
    
    <h1>Authorization Failed</h1>
    <span class="error-code">${error}</span>
    <p>${description}</p>
    
    <div class="note">
      Please check the terminal for more details and try again.
    </div>
    
    <div class="powered-by">
      Teamleader MCP by <a href="https://weichie.com" target="_blank">Weichie.com</a>
    </div>
  </div>
</body>
</html>`;
}
