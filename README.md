# Teamleader Focus MCP Server

A Model Context Protocol (MCP) server for the [Teamleader Focus](https://www.teamleader.eu) API. Provides tools to interact with calendar events, contacts, and email tracking.

## Features

- 📅 **Calendar/Events** - List, view, and create calendar events
- 👥 **Contacts** - Search and view contact details
- 📧 **Email Tracking** - Log externally sent emails in Teamleader

## Installation

```bash
npm install
npm run build
```

## Configuration

### 1. Register Your Integration

1. Go to [Teamleader Marketplace](https://marketplace.focus.teamleader.eu/build)
2. Create a new integration
3. Note your `client_id` and `client_secret`
4. Configure redirect URI (e.g., `http://localhost:3000/callback`)
5. Select required scopes for your use case

### 2. OAuth 2.0 Setup

Teamleader uses OAuth 2.0 for authentication. You need to:

1. **Redirect user to authorization URL:**
   ```
   https://focus.teamleader.eu/oauth2/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_REDIRECT_URI
   ```

2. **Exchange the authorization code for tokens:**
   ```bash
   curl -X POST https://focus.teamleader.eu/oauth2/access_token \
     -H "Content-Type: application/json" \
     -d '{
       "client_id": "YOUR_CLIENT_ID",
       "client_secret": "YOUR_CLIENT_SECRET",
       "code": "AUTHORIZATION_CODE",
       "grant_type": "authorization_code",
       "redirect_uri": "YOUR_REDIRECT_URI"
     }'
   ```

3. **Set the access token:**
   ```bash
   export TEAMLEADER_ACCESS_TOKEN=your_access_token
   ```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `TEAMLEADER_ACCESS_TOKEN` | **Required.** OAuth 2.0 access token |
| `TEAMLEADER_REFRESH_TOKEN` | Optional. For automatic token refresh |
| `TEAMLEADER_CLIENT_ID` | Optional. For token refresh |
| `TEAMLEADER_CLIENT_SECRET` | Optional. For token refresh |

## Usage

### Running the Server

```bash
# With access token in environment
export TEAMLEADER_ACCESS_TOKEN=your_token
npm start

# Or directly
TEAMLEADER_ACCESS_TOKEN=your_token node dist/index.js
```

### MCP Client Configuration

Add to your MCP client configuration (e.g., Claude Desktop):

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

## Available Tools

### Calendar/Events

#### `teamleader_events_list`

List calendar events with optional filters.

```json
{
  "from": "2026-02-01",
  "to": "2026-02-28",
  "contact_id": "uuid",
  "company_id": "uuid",
  "deal_id": "uuid"
}
```

#### `teamleader_event_info`

Get details of a specific event.

```json
{
  "id": "event-uuid"
}
```

#### `teamleader_event_create`

Create a new calendar event.

```json
{
  "title": "Team Meeting",
  "starts_at": "2026-02-15T10:00:00+01:00",
  "ends_at": "2026-02-15T11:00:00+01:00",
  "description": "Weekly sync",
  "location": "Office",
  "contact_ids": ["contact-uuid-1"],
  "attendee_ids": ["user-uuid-1"]
}
```

### Contacts

#### `teamleader_contacts_list`

List contacts with optional filters.

```json
{
  "name": "John",
  "email": "john@example.com",
  "company_id": "uuid",
  "tags": ["vip"]
}
```

#### `teamleader_contact_info`

Get details of a specific contact.

```json
{
  "id": "contact-uuid"
}
```

### Email Tracking

> **Note:** Teamleader Focus does not have a direct email sending API. Use email tracking to log emails sent through external services (SendGrid, Mailgun, etc.).

#### `teamleader_email_track`

Track an externally sent email in Teamleader.

```json
{
  "subject": "Project Update",
  "body": "<p>Here is the latest update...</p>",
  "from": "sales@company.com",
  "to": ["client@example.com"],
  "subject_type": "contact",
  "subject_id": "contact-uuid"
}
```

#### `teamleader_emails_list`

List tracked emails.

```json
{
  "subject_type": "contact",
  "subject_id": "contact-uuid"
}
```

## Development

### Running Tests

```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
```

### Building

```bash
npm run build    # Build once
npm run dev      # Watch mode
```

### Project Structure

```
teamleader-mcp/
├── src/
│   ├── index.ts           # Entry point
│   ├── server.ts          # MCP server setup
│   ├── auth/
│   │   └── oauth.ts       # OAuth 2.0 helpers
│   ├── client/
│   │   └── teamleader.ts  # API client
│   └── tools/
│       ├── calendar.ts    # Events tools
│       ├── contacts.ts    # Contacts tools
│       └── email.ts       # Email tracking tools
├── tests/
│   ├── tools/
│   │   ├── calendar.test.ts
│   │   ├── contacts.test.ts
│   │   └── email.test.ts
│   └── mocks/
│       └── teamleader.ts  # API mocks
└── ...
```

## API Reference

This server wraps the [Teamleader Focus API](https://developer.focus.teamleader.eu/). Relevant endpoints:

- `events.list` / `events.info` / `events.create` / `events.update` / `events.delete`
- `contacts.list` / `contacts.info` / `contacts.add` / `contacts.update`
- `emailTracking.list` / `emailTracking.create`
- `invoices.send` / `quotations.send` (document-specific email sending)

## Token Refresh

Access tokens expire after ~1 hour. To automatically refresh:

1. Store the refresh token
2. Use the `OAuthManager` class from `src/auth/oauth.ts`
3. Or implement token refresh in your MCP client wrapper

```typescript
import { refreshAccessToken } from './src/auth/oauth.js';

const newTokens = await refreshAccessToken({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  redirectUri: 'your_redirect_uri',
}, refreshToken);
```

## Rate Limits

Teamleader API has rate limits (200 requests/minute per integration per account). The client exposes rate limit info:

```typescript
const client = new TeamleaderClient({ accessToken });
// After any request:
const rateLimit = client.getRateLimitInfo();
// { limit: 200, remaining: 195, reset: "2026-02-01T10:00:00+01:00" }
```

## License

MIT
