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
    .logos {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .logo-teamleader {
      height: 40px;
    }
    .logo-connector {
      color: #ccc;
      font-size: 1.5rem;
    }
    .logo-weichie {
      height: 32px;
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
    <div class="logos">
      <!-- Teamleader Logo -->
      <svg class="logo-teamleader" viewBox="0 0 150 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.5 6.5H0V9.5H5.5V25.5H9V9.5H14.5V6.5Z" fill="#0f2744"/>
        <path d="M23.5 12C20 12 17.5 14.5 17.5 18.5C17.5 22.5 20 25.5 23.5 25.5C25.5 25.5 27 24.5 28 23V25.5H31V12.5H28V14.5C27 13 25.5 12 23.5 12ZM24 22.5C22 22.5 20.5 21 20.5 18.5C20.5 16 22 14.5 24 14.5C26 14.5 27.5 16 27.5 18.5C27.5 21 26 22.5 24 22.5Z" fill="#0f2744"/>
        <path d="M42 12C38.5 12 36 14.5 36 18.5C36 22.5 38.5 25.5 42 25.5C45.5 25.5 48 23 48 19.5H45C45 21.5 44 22.5 42 22.5C40 22.5 39 21 39 18.5C39 16 40 14.5 42 14.5C44 14.5 45 15.5 45 17.5H48C48 14 45.5 12 42 12Z" fill="#0f2744"/>
        <text x="52" y="22" font-family="Arial" font-size="14" font-weight="bold" fill="#0f2744">mleader</text>
      </svg>
      <span class="logo-connector">×</span>
      <!-- Weichie Logo -->
      <svg class="logo-weichie" viewBox="0 0 200 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M66.0247 25.7968H83.2025C83.1022 23.505 82.1696 21.374 80.4047 19.4038C78.6398 17.4337 76.1429 16.4486 72.9139 16.4486C69.4844 16.4486 66.6264 17.7403 64.3401 20.3236C62.0537 22.9069 60.9105 26.1486 60.9105 30.0487C60.9105 32.8029 61.5022 35.145 62.6855 37.075C63.8687 39.0049 65.388 40.4976 67.2431 41.553C69.0983 42.6085 71.0688 43.1362 73.1546 43.1362C75.4008 43.1362 77.4766 42.5582 79.3819 41.4023C81.2872 40.2463 82.5607 38.643 83.2025 36.5925H81.7585C80.2343 39.8694 77.6471 41.5078 73.9969 41.5078C71.3094 41.5078 69.2888 40.4172 67.9351 38.2359C66.5813 36.0547 65.9044 32.7929 65.9044 28.4505C65.9044 27.8675 65.9445 26.9829 66.0247 25.7968ZM78.0281 23.3542C78.0281 23.7161 77.998 24.1282 77.9379 24.5906H66.1451C66.847 20.0471 69.0231 17.7754 72.6732 17.7754C74.1774 17.7754 75.4459 18.2629 76.4788 19.238C77.5117 20.213 78.0281 21.5851 78.0281 23.3542Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M90.3941 1.68438C89.7861 2.3073 89.4821 3.05079 89.4821 3.91484C89.4821 4.79898 89.7861 5.55251 90.3941 6.17543C91.0021 6.79835 91.7347 7.10981 92.5919 7.10981C93.4491 7.10981 94.1767 6.79835 94.7747 6.17543C95.3728 5.55251 95.6718 4.79898 95.6718 3.91484C95.6718 3.05079 95.3728 2.3073 94.7747 1.68438C94.1767 1.06146 93.4491 0.75 92.5919 0.75C91.7347 0.75 91.0021 1.06146 90.3941 1.68438ZM95.2531 33.7246V16.5139H94.5953C92.6417 17.2172 89.8907 17.7497 86.3423 18.1114V19.4979H87.1496C88.266 19.4979 89.0484 19.5783 89.497 19.739C89.9455 19.8998 90.3043 20.3017 90.5734 20.9447C90.8425 21.5877 90.9771 23.356 90.9771 26.2495V33.7246C90.9771 36.4775 90.9422 38.1403 90.8724 38.713C90.8027 39.2856 90.5535 39.778 90.1249 40.1899C89.6963 40.6018 88.7743 40.8078 87.359 40.8078H86.3423V42.1943H99.5291V40.8078H98.9012C97.6253 40.8078 96.7382 40.6269 96.2399 40.2652C95.7415 39.9035 95.4524 39.3811 95.3727 38.6979C95.293 38.0147 95.2531 36.3569 95.2531 33.7246Z" fill="currentColor"/>
        <path d="M124.269 36.11H125.589C124.229 40.7941 120.832 43.1362 115.395 43.1362C111.897 43.1362 108.954 41.94 106.565 39.5477C104.177 37.1554 102.983 33.989 102.983 30.0487C102.983 26.0079 104.272 22.731 106.85 20.218C109.429 17.7051 112.477 16.4486 115.995 16.4486C118.113 16.4486 120.062 16.916 121.841 17.8508C123.62 18.7857 124.509 19.9265 124.509 21.2735C124.509 21.7761 124.344 22.2485 124.015 22.6908C123.685 23.1331 123.21 23.3542 122.59 23.3542C121.271 23.3542 120.462 22.5802 120.162 21.0322C119.922 19.8662 119.552 19.052 119.053 18.5896C118.533 18.1273 117.524 17.8961 116.025 17.8961C113.346 17.8961 111.332 18.8309 109.983 20.7005C108.634 22.5702 107.96 25.3847 107.96 29.1441C107.96 33.0241 108.684 36.0597 110.133 38.251C111.582 40.4423 113.776 41.538 116.714 41.538C120.672 41.538 123.19 39.7286 124.269 36.11Z" fill="currentColor"/>
        <path d="M137.293 21.5776C138.491 19.8897 139.834 18.6238 141.321 17.7798C142.809 16.9359 144.441 16.5139 146.218 16.5139C148.234 16.5139 149.906 16.9359 151.234 17.7798C152.561 18.6238 153.425 19.6637 153.824 20.8995C154.223 22.1352 154.423 24.1396 154.423 26.9126V33.7246C154.423 36.6181 154.478 38.3764 154.588 38.9993C154.698 39.6222 155.022 40.0794 155.561 40.3707C156.1 40.6621 157.098 40.8078 158.556 40.8078V42.1943H145.888V40.8078H146.457C147.915 40.8078 148.858 40.5968 149.287 40.1748C149.716 39.7528 149.966 39.2555 150.036 38.6828C150.106 38.1101 150.141 36.4574 150.141 33.7246V26.3098C150.141 24.2602 150.021 22.7431 149.781 21.7585C149.542 20.7739 148.978 19.96 148.089 19.317C147.201 18.674 146.088 18.3525 144.75 18.3525C143.193 18.3525 141.795 18.8097 140.558 19.7239C139.32 20.6382 138.232 22.0097 137.293 23.8382V33.7246C137.293 36.4976 137.338 38.2056 137.428 38.8486C137.518 39.4916 137.822 39.9789 138.342 40.3104C138.861 40.642 139.809 40.8078 141.187 40.8078V42.1943H128.729V40.8078H129.357C130.795 40.8078 131.728 40.6018 132.157 40.1899C132.587 39.7779 132.836 39.2856 132.906 38.713C132.976 38.1403 133.011 36.4775 133.011 33.7246V9.12928C133.011 6.6376 132.776 5.0602 132.307 4.3971C131.838 3.73399 130.715 3.40243 128.938 3.40243V2.01593C132.033 2.01593 134.608 1.59396 136.664 0.75H137.293V21.5776Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M165.119 1.68438C164.511 2.3073 164.207 3.05079 164.207 3.91484C164.207 4.79898 164.511 5.55251 165.119 6.17543C165.727 6.79835 166.46 7.10981 167.317 7.10981C168.174 7.10981 168.902 6.79835 169.5 6.17543C170.098 5.55251 170.397 4.79898 170.397 3.91484C170.397 3.05079 170.098 2.3073 169.5 1.68438C168.902 1.06146 168.174 0.75 167.317 0.75C166.46 0.75 165.727 1.06146 165.119 1.68438ZM169.978 33.7246V16.5139H169.32C167.367 17.2172 164.616 17.7497 161.068 18.1114V19.4979H161.875C162.991 19.4979 163.774 19.5783 164.222 19.739C164.671 19.8998 165.03 20.3017 165.299 20.9447C165.568 21.5877 165.702 23.356 165.702 26.2495V33.7246C165.702 36.4775 165.667 38.1403 165.598 38.713C165.528 39.2856 165.279 39.778 164.85 40.1899C164.422 40.6018 163.5 40.8078 162.084 40.8078H161.068V42.1943H174.254V40.8078H173.626C172.351 40.8078 171.463 40.6269 170.965 40.2652C170.467 39.9035 170.178 39.3811 170.098 38.6979C170.018 38.0147 169.978 36.3569 169.978 33.7246Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M182.822 25.7968H200C199.9 23.505 198.967 21.374 197.202 19.4038C195.437 17.4337 192.94 16.4486 189.711 16.4486C186.282 16.4486 183.424 17.7403 181.138 20.3236C178.851 22.9069 177.708 26.1486 177.708 30.0487C177.708 32.8029 178.3 35.145 179.483 37.075C180.666 39.0049 182.185 40.4976 184.041 41.553C185.896 42.6085 187.866 43.1362 189.952 43.1362C192.198 43.1362 194.274 42.5582 196.179 41.4023C198.085 40.2463 199.358 38.643 200 36.5925H198.556C197.032 39.8694 194.445 41.5078 190.794 41.5078C188.107 41.5078 186.086 40.4172 184.733 38.2359C183.379 36.0547 182.702 32.7929 182.702 28.4505C182.702 27.8675 182.742 26.9829 182.822 25.7968ZM194.826 23.3542C194.826 23.7161 194.796 24.1282 194.735 24.5906H182.943C183.645 20.0471 185.821 17.7754 189.471 17.7754C190.975 17.7754 192.243 18.2629 193.276 19.238C194.309 20.213 194.826 21.5851 194.826 23.3542Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M50.3621 12.4413C50.3621 12.4413 53.698 2.76087 58.0848 2.76087L58.1041 1.44571H46.9302V2.83773C46.9302 2.83773 50.5721 2.99349 50.9979 5.44977C51.4237 7.90605 50.3621 12.4413 50.3621 12.4413Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M28.2452 7.71296L30.1074 1.44571L31.8218 1.44571L44.3659 35.5838L42.4373 43.1362H41.0858L28.2452 7.71296Z" fill="currentColor"/>
      </svg>
    </div>
    
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
    .logos {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .logo-teamleader {
      height: 40px;
    }
    .logo-connector {
      color: #ccc;
      font-size: 1.5rem;
    }
    .logo-weichie {
      height: 32px;
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
    <div class="logos">
      <!-- Teamleader Logo -->
      <svg class="logo-teamleader" viewBox="0 0 150 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.5 6.5H0V9.5H5.5V25.5H9V9.5H14.5V6.5Z" fill="#0f2744"/>
        <path d="M23.5 12C20 12 17.5 14.5 17.5 18.5C17.5 22.5 20 25.5 23.5 25.5C25.5 25.5 27 24.5 28 23V25.5H31V12.5H28V14.5C27 13 25.5 12 23.5 12ZM24 22.5C22 22.5 20.5 21 20.5 18.5C20.5 16 22 14.5 24 14.5C26 14.5 27.5 16 27.5 18.5C27.5 21 26 22.5 24 22.5Z" fill="#0f2744"/>
        <path d="M42 12C38.5 12 36 14.5 36 18.5C36 22.5 38.5 25.5 42 25.5C45.5 25.5 48 23 48 19.5H45C45 21.5 44 22.5 42 22.5C40 22.5 39 21 39 18.5C39 16 40 14.5 42 14.5C44 14.5 45 15.5 45 17.5H48C48 14 45.5 12 42 12Z" fill="#0f2744"/>
        <text x="52" y="22" font-family="Arial" font-size="14" font-weight="bold" fill="#0f2744">mleader</text>
      </svg>
      <span class="logo-connector">×</span>
      <!-- Weichie Logo -->
      <svg class="logo-weichie" viewBox="0 0 200 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M66.0247 25.7968H83.2025C83.1022 23.505 82.1696 21.374 80.4047 19.4038C78.6398 17.4337 76.1429 16.4486 72.9139 16.4486C69.4844 16.4486 66.6264 17.7403 64.3401 20.3236C62.0537 22.9069 60.9105 26.1486 60.9105 30.0487C60.9105 32.8029 61.5022 35.145 62.6855 37.075C63.8687 39.0049 65.388 40.4976 67.2431 41.553C69.0983 42.6085 71.0688 43.1362 73.1546 43.1362C75.4008 43.1362 77.4766 42.5582 79.3819 41.4023C81.2872 40.2463 82.5607 38.643 83.2025 36.5925H81.7585C80.2343 39.8694 77.6471 41.5078 73.9969 41.5078C71.3094 41.5078 69.2888 40.4172 67.9351 38.2359C66.5813 36.0547 65.9044 32.7929 65.9044 28.4505C65.9044 27.8675 65.9445 26.9829 66.0247 25.7968ZM78.0281 23.3542C78.0281 23.7161 77.998 24.1282 77.9379 24.5906H66.1451C66.847 20.0471 69.0231 17.7754 72.6732 17.7754C74.1774 17.7754 75.4459 18.2629 76.4788 19.238C77.5117 20.213 78.0281 21.5851 78.0281 23.3542Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M90.3941 1.68438C89.7861 2.3073 89.4821 3.05079 89.4821 3.91484C89.4821 4.79898 89.7861 5.55251 90.3941 6.17543C91.0021 6.79835 91.7347 7.10981 92.5919 7.10981C93.4491 7.10981 94.1767 6.79835 94.7747 6.17543C95.3728 5.55251 95.6718 4.79898 95.6718 3.91484C95.6718 3.05079 95.3728 2.3073 94.7747 1.68438C94.1767 1.06146 93.4491 0.75 92.5919 0.75C91.7347 0.75 91.0021 1.06146 90.3941 1.68438ZM95.2531 33.7246V16.5139H94.5953C92.6417 17.2172 89.8907 17.7497 86.3423 18.1114V19.4979H87.1496C88.266 19.4979 89.0484 19.5783 89.497 19.739C89.9455 19.8998 90.3043 20.3017 90.5734 20.9447C90.8425 21.5877 90.9771 23.356 90.9771 26.2495V33.7246C90.9771 36.4775 90.9422 38.1403 90.8724 38.713C90.8027 39.2856 90.5535 39.778 90.1249 40.1899C89.6963 40.6018 88.7743 40.8078 87.359 40.8078H86.3423V42.1943H99.5291V40.8078H98.9012C97.6253 40.8078 96.7382 40.6269 96.2399 40.2652C95.7415 39.9035 95.4524 39.3811 95.3727 38.6979C95.293 38.0147 95.2531 36.3569 95.2531 33.7246Z" fill="currentColor"/>
        <path d="M124.269 36.11H125.589C124.229 40.7941 120.832 43.1362 115.395 43.1362C111.897 43.1362 108.954 41.94 106.565 39.5477C104.177 37.1554 102.983 33.989 102.983 30.0487C102.983 26.0079 104.272 22.731 106.85 20.218C109.429 17.7051 112.477 16.4486 115.995 16.4486C118.113 16.4486 120.062 16.916 121.841 17.8508C123.62 18.7857 124.509 19.9265 124.509 21.2735C124.509 21.7761 124.344 22.2485 124.015 22.6908C123.685 23.1331 123.21 23.3542 122.59 23.3542C121.271 23.3542 120.462 22.5802 120.162 21.0322C119.922 19.8662 119.552 19.052 119.053 18.5896C118.533 18.1273 117.524 17.8961 116.025 17.8961C113.346 17.8961 111.332 18.8309 109.983 20.7005C108.634 22.5702 107.96 25.3847 107.96 29.1441C107.96 33.0241 108.684 36.0597 110.133 38.251C111.582 40.4423 113.776 41.538 116.714 41.538C120.672 41.538 123.19 39.7286 124.269 36.11Z" fill="currentColor"/>
        <path d="M137.293 21.5776C138.491 19.8897 139.834 18.6238 141.321 17.7798C142.809 16.9359 144.441 16.5139 146.218 16.5139C148.234 16.5139 149.906 16.9359 151.234 17.7798C152.561 18.6238 153.425 19.6637 153.824 20.8995C154.223 22.1352 154.423 24.1396 154.423 26.9126V33.7246C154.423 36.6181 154.478 38.3764 154.588 38.9993C154.698 39.6222 155.022 40.0794 155.561 40.3707C156.1 40.6621 157.098 40.8078 158.556 40.8078V42.1943H145.888V40.8078H146.457C147.915 40.8078 148.858 40.5968 149.287 40.1748C149.716 39.7528 149.966 39.2555 150.036 38.6828C150.106 38.1101 150.141 36.4574 150.141 33.7246V26.3098C150.141 24.2602 150.021 22.7431 149.781 21.7585C149.542 20.7739 148.978 19.96 148.089 19.317C147.201 18.674 146.088 18.3525 144.75 18.3525C143.193 18.3525 141.795 18.8097 140.558 19.7239C139.32 20.6382 138.232 22.0097 137.293 23.8382V33.7246C137.293 36.4976 137.338 38.2056 137.428 38.8486C137.518 39.4916 137.822 39.9789 138.342 40.3104C138.861 40.642 139.809 40.8078 141.187 40.8078V42.1943H128.729V40.8078H129.357C130.795 40.8078 131.728 40.6018 132.157 40.1899C132.587 39.7779 132.836 39.2856 132.906 38.713C132.976 38.1403 133.011 36.4775 133.011 33.7246V9.12928C133.011 6.6376 132.776 5.0602 132.307 4.3971C131.838 3.73399 130.715 3.40243 128.938 3.40243V2.01593C132.033 2.01593 134.608 1.59396 136.664 0.75H137.293V21.5776Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M165.119 1.68438C164.511 2.3073 164.207 3.05079 164.207 3.91484C164.207 4.79898 164.511 5.55251 165.119 6.17543C165.727 6.79835 166.46 7.10981 167.317 7.10981C168.174 7.10981 168.902 6.79835 169.5 6.17543C170.098 5.55251 170.397 4.79898 170.397 3.91484C170.397 3.05079 170.098 2.3073 169.5 1.68438C168.902 1.06146 168.174 0.75 167.317 0.75C166.46 0.75 165.727 1.06146 165.119 1.68438ZM169.978 33.7246V16.5139H169.32C167.367 17.2172 164.616 17.7497 161.068 18.1114V19.4979H161.875C162.991 19.4979 163.774 19.5783 164.222 19.739C164.671 19.8998 165.03 20.3017 165.299 20.9447C165.568 21.5877 165.702 23.356 165.702 26.2495V33.7246C165.702 36.4775 165.667 38.1403 165.598 38.713C165.528 39.2856 165.279 39.778 164.85 40.1899C164.422 40.6018 163.5 40.8078 162.084 40.8078H161.068V42.1943H174.254V40.8078H173.626C172.351 40.8078 171.463 40.6269 170.965 40.2652C170.467 39.9035 170.178 39.3811 170.098 38.6979C170.018 38.0147 169.978 36.3569 169.978 33.7246Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M182.822 25.7968H200C199.9 23.505 198.967 21.374 197.202 19.4038C195.437 17.4337 192.94 16.4486 189.711 16.4486C186.282 16.4486 183.424 17.7403 181.138 20.3236C178.851 22.9069 177.708 26.1486 177.708 30.0487C177.708 32.8029 178.3 35.145 179.483 37.075C180.666 39.0049 182.185 40.4976 184.041 41.553C185.896 42.6085 187.866 43.1362 189.952 43.1362C192.198 43.1362 194.274 42.5582 196.179 41.4023C198.085 40.2463 199.358 38.643 200 36.5925H198.556C197.032 39.8694 194.445 41.5078 190.794 41.5078C188.107 41.5078 186.086 40.4172 184.733 38.2359C183.379 36.0547 182.702 32.7929 182.702 28.4505C182.702 27.8675 182.742 26.9829 182.822 25.7968ZM194.826 23.3542C194.826 23.7161 194.796 24.1282 194.735 24.5906H182.943C183.645 20.0471 185.821 17.7754 189.471 17.7754C190.975 17.7754 192.243 18.2629 193.276 19.238C194.309 20.213 194.826 21.5851 194.826 23.3542Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M50.3621 12.4413C50.3621 12.4413 53.698 2.76087 58.0848 2.76087L58.1041 1.44571H46.9302V2.83773C46.9302 2.83773 50.5721 2.99349 50.9979 5.44977C51.4237 7.90605 50.3621 12.4413 50.3621 12.4413Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M28.2452 7.71296L30.1074 1.44571L31.8218 1.44571L44.3659 35.5838L42.4373 43.1362H41.0858L28.2452 7.71296Z" fill="currentColor"/>
      </svg>
    </div>
    
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
