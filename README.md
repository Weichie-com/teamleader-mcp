# Teamleader MCP Server

A Model Context Protocol (MCP) server for [Teamleader Focus](https://www.teamleader.eu/) - the all-in-one CRM, invoicing, and project management platform.

This server enables AI assistants to interact with Teamleader Focus through the MCP protocol, providing tools for managing contacts, companies, deals, invoices, quotations, products, time tracking, and calendar events.

## Features

- 🏢 **Companies** - List, create, update, and manage companies
- 👥 **Contacts** - Manage your CRM contacts
- 💼 **Deals** - Full deal pipeline management (create, move, win, lose)
- 📄 **Invoices** - Draft, send, book, and register payments
- 📝 **Quotations** - Create, send, accept, and manage quotations
- 📦 **Products** - Product catalog management
- ⏱️ **Time Tracking** - Track time and manage timers
- 📅 **Calendar** - Event management
- 📧 **Email Tracking** - Log emails to entities

## Installation

### Prerequisites

- Node.js 18 or higher
- A Teamleader Focus account
- OAuth 2.0 credentials from Teamleader Marketplace

### Install from npm (when published)

```bash
npm install -g teamleader-mcp
```

### Install from source

```bash
git clone <repository>
cd teamleader-mcp
npm install
npm run build
```

## OAuth 2.0 Setup

Before using this MCP server, you need to set up OAuth credentials:

### 1. Register your integration

1. Go to [Teamleader Marketplace](https://marketplace.focus.teamleader.eu/build)
2. Create a new integration
3. Note your `client_id` and `client_secret`
4. Add your redirect URI (e.g., `http://localhost:3000/callback`)
5. Select the required scopes:
   - `contacts` - For contacts management
   - `companies` - For companies management
   - `deals` - For deals and quotations
   - `invoices` - For invoices and credit notes
   - `products` - For products catalog
   - `timetracking` - For time tracking
   - `events` - For calendar events
   - `users` - For user information

### 2. Get an access token

Use the OAuth 2.0 authorization code flow:

1. Redirect user to:
   ```
   https://focus.teamleader.eu/oauth2/authorize?
     client_id=YOUR_CLIENT_ID&
     response_type=code&
     redirect_uri=YOUR_REDIRECT_URI&
     state=RANDOM_STATE
   ```

2. Exchange the authorization code for tokens:
   ```bash
   curl -X POST https://focus.teamleader.eu/oauth2/access_token \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "code=AUTHORIZATION_CODE" \
     -d "grant_type=authorization_code" \
     -d "redirect_uri=YOUR_REDIRECT_URI"
   ```

3. You'll receive an `access_token` and `refresh_token`

### 3. Configure environment

Create a `.env` file (see `.env.example`):

```bash
# Required
TEAMLEADER_ACCESS_TOKEN=your_access_token

# Optional (for automatic token refresh)
TEAMLEADER_CLIENT_ID=your_client_id
TEAMLEADER_CLIENT_SECRET=your_client_secret
TEAMLEADER_REFRESH_TOKEN=your_refresh_token
TEAMLEADER_TOKEN_STORAGE=/path/to/.teamleader-tokens.json  # Optional: custom storage path
```

### Token Refresh

The server supports two modes:

#### Static Token Mode (default)
Set only `TEAMLEADER_ACCESS_TOKEN`. The token will be used until it expires (1 hour). You'll need to manually refresh and update the token.

#### Automatic Refresh Mode (recommended for production)
Set all four environment variables:
- `TEAMLEADER_CLIENT_ID` - Your OAuth client ID
- `TEAMLEADER_CLIENT_SECRET` - Your OAuth client secret  
- `TEAMLEADER_REFRESH_TOKEN` - Your OAuth refresh token
- `TEAMLEADER_ACCESS_TOKEN` - Initial access token

With automatic refresh enabled:
- Tokens are refreshed 5 minutes before expiry
- On 401 errors, refresh is attempted automatically with retry
- New tokens are persisted to `~/.teamleader-tokens.json` (or custom path)
- Graceful fallback: if refresh fails, error is propagated

## Usage

### With mcporter

Add to your `mcporter.json` config file:

```json
{
  "mcpServers": {
    "teamleader": {
      "command": "node",
      "args": ["/path/to/teamleader-mcp/dist/index.js"],
      "env": {
        "TEAMLEADER_ACCESS_TOKEN": "your_access_token"
      }
    }
  }
}
```

> ⚠️ **Important:** The `args` field is required! Without it, mcporter won't know which script to run and the server will hang/timeout.

Then test with:

```bash
mcporter list teamleader              # List available tools
mcporter call teamleader.teamleader_deals_list status=open
```

### With Claude Desktop / Other MCP Clients

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "teamleader": {
      "command": "node",
      "args": ["/path/to/teamleader-mcp/dist/index.js"],
      "env": {
        "TEAMLEADER_ACCESS_TOKEN": "your_access_token"
      }
    }
  }
}
```

Or if installed globally via npm:

```json
{
  "mcpServers": {
    "teamleader": {
      "command": "teamleader-mcp",
      "env": {
        "TEAMLEADER_ACCESS_TOKEN": "your_access_token"
      }
    }
  }
}
```

### Running directly

```bash
TEAMLEADER_ACCESS_TOKEN=your_token npm start
```

## Available Tools

### Companies

| Tool | Description |
|------|-------------|
| `teamleader_companies_list` | List companies with filters (name, VAT, tags, status) |
| `teamleader_company_info` | Get company details by ID |
| `teamleader_company_create` | Create a new company |
| `teamleader_company_update` | Update an existing company |

### Contacts

| Tool | Description |
|------|-------------|
| `teamleader_contacts_list` | List contacts with filters |
| `teamleader_contact_info` | Get contact details by ID |

### Deals

| Tool | Description |
|------|-------------|
| `teamleader_deals_list` | List deals with filters (status, customer, phase) |
| `teamleader_deal_info` | Get deal details by ID |
| `teamleader_deal_create` | Create a new deal |
| `teamleader_deal_update` | Update an existing deal |
| `teamleader_deal_move` | Move deal to a different phase |
| `teamleader_deal_win` | Mark deal as won |
| `teamleader_deal_lose` | Mark deal as lost |

### Invoices

| Tool | Description |
|------|-------------|
| `teamleader_invoices_list` | List invoices with filters |
| `teamleader_invoice_info` | Get invoice details by ID |
| `teamleader_invoice_draft` | Create a draft invoice |
| `teamleader_invoice_send` | Send invoice via email |
| `teamleader_invoice_book` | Book (finalize) a draft invoice |
| `teamleader_invoice_delete` | Delete an invoice |
| `teamleader_invoice_register_payment` | Register a payment |

### Quotations

| Tool | Description |
|------|-------------|
| `teamleader_quotations_list` | List quotations |
| `teamleader_quotation_info` | Get quotation details |
| `teamleader_quotation_create` | Create a new quotation |
| `teamleader_quotation_send` | Send quotation via email |
| `teamleader_quotation_accept` | Mark quotation as accepted |
| `teamleader_quotation_delete` | Delete a quotation |
| `teamleader_quotation_download` | Get PDF download link |

### Products

| Tool | Description |
|------|-------------|
| `teamleader_products_list` | List products with filters |
| `teamleader_product_info` | Get product details |
| `teamleader_product_create` | Create a new product |
| `teamleader_product_update` | Update a product |

### Time Tracking

| Tool | Description |
|------|-------------|
| `teamleader_timetracking_list` | List time entries |
| `teamleader_timetracking_info` | Get time entry details |
| `teamleader_timetracking_add` | Add a time entry |
| `teamleader_timetracking_update` | Update a time entry |
| `teamleader_timetracking_delete` | Delete a time entry |

### Calendar

| Tool | Description |
|------|-------------|
| `teamleader_events_list` | List calendar events |
| `teamleader_event_info` | Get event details |
| `teamleader_event_create` | Create a new event |

### Email Tracking

| Tool | Description |
|------|-------------|
| `teamleader_email_track` | Log an email to an entity |
| `teamleader_emails_list` | List tracked emails |

## Examples

### List all open deals

```json
{
  "name": "teamleader_deals_list",
  "arguments": {
    "status": ["open"]
  }
}
```

### Create a company

```json
{
  "name": "teamleader_company_create",
  "arguments": {
    "name": "Acme Corporation",
    "vat_number": "BE0123456789",
    "emails": [{"type": "primary", "email": "info@acme.com"}],
    "tags": ["partner", "enterprise"]
  }
}
```

### Create and send an invoice

```json
{
  "name": "teamleader_invoice_draft",
  "arguments": {
    "customer_type": "company",
    "customer_id": "uuid-here",
    "department_id": "uuid-here",
    "payment_term_type": "after_invoice_date",
    "payment_term_days": 30,
    "grouped_lines": [{
      "line_items": [{
        "quantity": 10,
        "description": "Consulting hours",
        "unit_price": {"amount": 100, "tax": "excluding"},
        "tax_rate_id": "tax-rate-uuid"
      }]
    }]
  }
}
```

### Track time

```json
{
  "name": "teamleader_timetracking_add",
  "arguments": {
    "started_at": "2026-01-31T09:00:00+01:00",
    "ended_at": "2026-01-31T12:00:00+01:00",
    "description": "Frontend development",
    "invoiceable": true
  }
}
```

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test           # Watch mode
npm run test:run   # Single run
```

### Lint

```bash
npm run lint
```

## API Reference

This server is built on top of the [Teamleader Focus API](https://developer.teamleader.eu/). Refer to their documentation for detailed information about data structures and limitations.

## Rate Limiting

The Teamleader API has rate limiting (200 requests per minute per integration per account). The server respects rate limit headers and will return errors if limits are exceeded.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Troubleshooting

### Server hangs or times out

**Symptom:** `mcporter call teamleader.*` hangs indefinitely or gets killed with SIGKILL.

**Cause:** Missing `args` in your config. The config specifies `"command": "node"` but doesn't tell it *which file* to run.

**Fix:** Make sure your config includes the `args` array:

```json
{
  "teamleader": {
    "command": "node",
    "args": ["/full/path/to/teamleader-mcp/dist/index.js"],  // ← Required!
    "env": {
      "TEAMLEADER_ACCESS_TOKEN": "..."
    }
  }
}
```

### "Unknown tool" error

**Symptom:** `MCP error -32601: Unknown tool: get-deal`

**Cause:** Tool names in this server are prefixed with `teamleader_` (e.g., `teamleader_deal_info`, not `get-deal`).

**Fix:** Use the correct tool names. Run `mcporter list teamleader` to see all available tools.

### Token expired

**Symptom:** 401 Unauthorized errors.

**Cause:** Teamleader access tokens expire after 1 hour.

**Fix:** Set up automatic token refresh by configuring all OAuth environment variables:

```bash
TEAMLEADER_ACCESS_TOKEN=your_access_token
TEAMLEADER_CLIENT_ID=your_client_id
TEAMLEADER_CLIENT_SECRET=your_client_secret
TEAMLEADER_REFRESH_TOKEN=your_refresh_token
```

With these configured, the server will:
1. Automatically refresh tokens 5 minutes before expiry
2. Retry failed requests after refreshing on 401 errors
3. Persist new tokens to `~/.teamleader-tokens.json`

If you only have an access token, you'll need to manually refresh it using the OAuth refresh flow.

## Related

- [Teamleader Focus API Documentation](https://developer.teamleader.eu/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Teamleader Marketplace](https://marketplace.focus.teamleader.eu/)
