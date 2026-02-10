# 🚀 Teamleader MCP - Quick Start

Connect your Teamleader account to Claude Desktop in 5 minutes!

## Step 1: Clone & Install
```bash
git clone https://yamebe@bitbucket.org/weichieprojects/teamleader-mcp.git
cd teamleader-mcp
npm install
npm run build
```

## Step 2: Get Your Teamleader Credentials
1. Go to https://marketplace.teamleader.eu/
2. Create a new integration
3. Copy your Client ID and Secret

## Step 3: Generate Token
```bash
node scripts/generate-token.js
```
Follow the prompts to get your refresh token.

## Step 4: Add to Claude Desktop

Edit your Claude config file:
- **Mac/Linux**: `~/.config/claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add this (replace paths and credentials):
```json
{
  "mcpServers": {
    "teamleader": {
      "command": "node",
      "args": ["/full/path/to/teamleader-mcp/dist/server.js"],
      "env": {
        "TEAMLEADER_CLIENT_ID": "your-client-id",
        "TEAMLEADER_CLIENT_SECRET": "your-secret",
        "TEAMLEADER_REFRESH_TOKEN": "your-refresh-token"
      }
    }
  }
}
```

## Step 5: Restart Claude & Test

Ask Claude:
- "Show me my Teamleader companies"
- "List outstanding invoices"
- "Create a new contact"

That's it! 🎉

---
**Need help?** See [CLAUDE_DESKTOP_SETUP.md](CLAUDE_DESKTOP_SETUP.md) for detailed instructions.