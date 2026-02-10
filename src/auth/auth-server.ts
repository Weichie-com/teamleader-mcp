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
  <title>Authorization Successful</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      max-width: 400px;
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    h1 {
      color: #333;
      margin-bottom: 0.5rem;
    }
    p {
      color: #666;
      margin-bottom: 1.5rem;
    }
    .note {
      font-size: 0.9rem;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✅</div>
    <h1>Authorization Successful!</h1>
    <p>You have successfully connected to Teamleader Focus.</p>
    <p class="note">You can close this window and return to the terminal.</p>
  </div>
</body>
</html>`;
}

function getErrorPage(error: string, description: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Authorization Failed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #ff6b6b 0%, #c0392b 100%);
    }
    .container {
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      max-width: 400px;
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    h1 {
      color: #333;
      margin-bottom: 0.5rem;
    }
    .error {
      color: #e74c3c;
      font-weight: bold;
    }
    p {
      color: #666;
      margin-bottom: 1rem;
    }
    .note {
      font-size: 0.9rem;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">❌</div>
    <h1>Authorization Failed</h1>
    <p class="error">${error}</p>
    <p>${description}</p>
    <p class="note">Please check the terminal for more details.</p>
  </div>
</body>
</html>`;
}
