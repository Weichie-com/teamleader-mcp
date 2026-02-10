# Claude Desktop + Teamleader MCP Setup Guide

## 🚀 Quick Start (for users)

### 1. Install Claude Desktop
Download from: https://claude.ai/download

### 2. Clone this repository
```bash
git clone https://yamebe@bitbucket.org/weichieprojects/teamleader-mcp.git
cd teamleader-mcp
npm install
npm run build
```

### 3. Configure Claude Desktop

Add to your Claude Desktop config file:

**Mac/Linux:** `~/.config/claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "teamleader": {
      "command": "node",
      "args": ["/full/path/to/teamleader-mcp/dist/server.js"],
      "env": {
        "TEAMLEADER_CLIENT_ID": "your-client-id",
        "TEAMLEADER_CLIENT_SECRET": "your-client-secret",
        "TEAMLEADER_REFRESH_TOKEN": "your-refresh-token"
      }
    }
  }
}
```

### 4. Get your Teamleader credentials

1. Create an integration at: https://marketplace.teamleader.eu/
2. Get your Client ID and Secret
3. Generate a refresh token:

```bash
# Use the OAuth flow script
node scripts/generate-token.js
```

### 5. Restart Claude Desktop

After adding the config, restart Claude Desktop. You should see "teamleader" in the MCP connections.

## 🎯 Available Commands

Once connected, you can ask Claude to:

- "List all my Teamleader companies"
- "Show me outstanding invoices"
- "Create a new contact"
- "Get deals in progress"
- "Send a quotation"
- And much more!

## 🔧 Troubleshooting

### Check if MCP is connected:
In Claude Desktop, look for the MCP icon (puzzle piece) in the bottom toolbar.

### Debug mode:
```json
{
  "mcpServers": {
    "teamleader": {
      "command": "node",
      "args": ["/path/to/teamleader-mcp/dist/server.js"],
      "env": {
        "DEBUG": "teamleader:*",
        "TEAMLEADER_CLIENT_ID": "...",
        "TEAMLEADER_CLIENT_SECRET": "...",
        "TEAMLEADER_REFRESH_TOKEN": "..."
      }
    }
  }
}
```

### Common issues:

1. **"command not found"**: Use full path to node and script
2. **"No tools available"**: Check credentials are set
3. **"Connection failed"**: Restart Claude Desktop

## 📊 Example Usage

```
You: "Show me all outstanding invoices"
Claude: I'll get your outstanding invoices from Teamleader...
[Shows list of invoices with amounts and due dates]

You: "Create a draft invoice for company X"
Claude: I'll create a draft invoice for that company...
[Creates invoice and shows details]
```

## 🔐 Security Notes

- Never commit your credentials
- Use environment variables or a `.env` file
- Refresh tokens expire after 2 weeks of inactivity
- Store credentials securely in your Claude config

## 📚 Full Documentation

See the complete API documentation in `docs/` folder.

---

**Need help?** Contact support or check the [Teamleader API docs](https://developer.teamleader.eu/)