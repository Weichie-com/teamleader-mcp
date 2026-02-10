#!/usr/bin/env node
/**
 * Easy OAuth setup for Teamleader MCP
 * Runs local server to catch redirect automatically
 */

const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (question) => new Promise(resolve => rl.question(question, resolve));

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

async function main() {
  console.log(`${colors.blue}${colors.bright}🔐 Teamleader OAuth Setup for Claude Desktop${colors.reset}\n`);

  try {
    // Step 1: Get credentials
    console.log(`${colors.yellow}Step 1: Enter your Teamleader App credentials${colors.reset}`);
    console.log('(Get these from https://marketplace.teamleader.eu/)\n');
    
    const clientId = await prompt('Client ID: ');
    const clientSecret = await prompt('Client Secret: ');
    
    if (!clientId || !clientSecret) {
      throw new Error('Client ID and Secret are required');
    }

    // Step 2: Start local server
    console.log(`\n${colors.yellow}Step 2: Starting local server...${colors.reset}`);
    
    const { authCode, server } = await startLocalServer();
    
    // Step 3: Open browser
    const authUrl = `https://app.teamleader.eu/oauth2/authorize?` +
      `client_id=${clientId}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent('http://localhost:8080/callback')}`;
    
    console.log(`\n${colors.yellow}Step 3: Opening browser for authentication...${colors.reset}`);
    console.log(`If browser doesn't open, visit:\n${colors.blue}${authUrl}${colors.reset}\n`);
    
    // Try to open browser
    const platform = process.platform;
    const openCommand = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${openCommand} "${authUrl}"`);
    
    // Wait for auth code
    console.log('Waiting for authorization...');
    const code = await authCode;
    
    // Close server
    server.close();
    
    // Step 4: Exchange code for tokens
    console.log(`\n${colors.yellow}Step 4: Getting refresh token...${colors.reset}`);
    const tokens = await exchangeCodeForTokens(clientId, clientSecret, code);
    
    // Step 5: Save configuration
    console.log(`\n${colors.green}${colors.bright}✅ Success! Here's your configuration:${colors.reset}\n`);
    
    const config = {
      "mcpServers": {
        "teamleader": {
          "command": "node",
          "args": [`${process.cwd()}/dist/server.js`],
          "env": {
            "TEAMLEADER_CLIENT_ID": clientId,
            "TEAMLEADER_CLIENT_SECRET": clientSecret,
            "TEAMLEADER_REFRESH_TOKEN": tokens.refresh_token
          }
        }
      }
    };
    
    console.log('Add this to your Claude Desktop config:\n');
    console.log(JSON.stringify(config, null, 2));
    
    // Offer to save
    console.log(`\n${colors.yellow}Config file location:${colors.reset}`);
    console.log('- Mac/Linux: ~/.config/claude/claude_desktop_config.json');
    console.log('- Windows: %APPDATA%\\Claude\\claude_desktop_config.json\n');
    
    const saveEnv = await prompt('Save credentials to .env file? (y/n): ');
    if (saveEnv.toLowerCase() === 'y') {
      const envContent = `# Teamleader MCP Credentials
TEAMLEADER_CLIENT_ID=${clientId}
TEAMLEADER_CLIENT_SECRET=${clientSecret}
TEAMLEADER_REFRESH_TOKEN=${tokens.refresh_token}

# Token info (for reference)
# Access token expires in: ${tokens.expires_in} seconds
# Token type: ${tokens.token_type}
# Generated at: ${new Date().toISOString()}
`;
      fs.writeFileSync('.env', envContent);
      console.log(`${colors.green}✅ Saved to .env file!${colors.reset}`);
    }
    
    console.log(`\n${colors.green}${colors.bright}🎉 Setup complete! Restart Claude Desktop to use Teamleader MCP.${colors.reset}`);
    
  } catch (error) {
    console.error(`\n${colors.red}❌ Error: ${error.message}${colors.reset}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

function startLocalServer() {
  return new Promise((resolve) => {
    let authCodeResolve;
    const authCodePromise = new Promise(r => authCodeResolve = r);
    
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost:8080');
      
      if (url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');
        
        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: red;">❌ Authorization Failed</h1>
                <p>Error: ${error}</p>
                <p>${url.searchParams.get('error_description') || ''}</p>
              </body>
            </html>
          `);
          authCodeResolve(null);
        } else if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: green;">✅ Authorization Successful!</h1>
                <p>You can close this window and return to the terminal.</p>
                <script>window.close();</script>
              </body>
            </html>
          `);
          authCodeResolve(code);
        }
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    
    server.listen(8080, () => {
      resolve({ authCode: authCodePromise, server });
    });
  });
}

async function exchangeCodeForTokens(clientId, clientSecret, code) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:8080/callback'
    }).toString();
    
    const options = {
      hostname: 'app.teamleader.eu',
      path: '/oauth2/access_token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Token exchange failed: ${res.statusCode} - ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Run
if (require.main === module) {
  main();
}