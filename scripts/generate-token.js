#!/usr/bin/env node
/**
 * Generate Teamleader OAuth refresh token
 * Run this to get your initial refresh token for Claude Desktop
 */

const readline = require('readline');
const https = require('https');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Teamleader OAuth Token Generator\n');

const prompt = (question) => new Promise(resolve => rl.question(question, resolve));

async function main() {
  try {
    // Get client credentials
    const clientId = await prompt('Enter your Teamleader Client ID: ');
    const clientSecret = await prompt('Enter your Teamleader Client Secret: ');
    const redirectUri = 'http://localhost:8080/callback';
    
    // Generate authorization URL
    const authUrl = `https://app.teamleader.eu/oauth2/authorize?` +
      `client_id=${clientId}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    console.log('\n📋 Steps to get your refresh token:\n');
    console.log('1. Open this URL in your browser:');
    console.log(`   ${authUrl}\n`);
    console.log('2. Log in and authorize the application');
    console.log('3. You\'ll be redirected to localhost:8080');
    console.log('4. Copy the "code" parameter from the URL\n');
    
    const code = await prompt('Paste the authorization code here: ');
    
    console.log('\n🔄 Exchanging code for tokens...');
    
    // Exchange code for tokens
    const tokenData = await exchangeCodeForTokens(clientId, clientSecret, code, redirectUri);
    
    console.log('\n✅ Success! Here are your credentials:\n');
    console.log('Add these to your Claude Desktop config:\n');
    console.log('```json');
    console.log(JSON.stringify({
      "TEAMLEADER_CLIENT_ID": clientId,
      "TEAMLEADER_CLIENT_SECRET": clientSecret,
      "TEAMLEADER_REFRESH_TOKEN": tokenData.refresh_token
    }, null, 2));
    console.log('```\n');
    
    // Save to .env file option
    const save = await prompt('Save to .env file? (y/n): ');
    if (save.toLowerCase() === 'y') {
      const fs = require('fs');
      const envContent = `# Teamleader MCP Credentials
TEAMLEADER_CLIENT_ID=${clientId}
TEAMLEADER_CLIENT_SECRET=${clientSecret}
TEAMLEADER_REFRESH_TOKEN=${tokenData.refresh_token}
`;
      fs.writeFileSync('.env', envContent);
      console.log('\n✅ Saved to .env file!');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

async function exchangeCodeForTokens(clientId, clientSecret, code, redirectUri) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
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
          reject(new Error(`Failed: ${res.statusCode} - ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Run if called directly
if (require.main === module) {
  main();
}