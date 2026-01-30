/**
 * Teamleader Focus MCP Server
 * 
 * Model Context Protocol server providing tools to interact with
 * Teamleader Focus API for calendar events, contacts, and more.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { TeamleaderClient } from './client/teamleader.js';
import * as calendar from './tools/calendar.js';
import * as contacts from './tools/contacts.js';
import * as email from './tools/email.js';

// Tool definitions
const TOOLS = [
  // Calendar tools
  {
    name: 'teamleader_events_list',
    description: 'List calendar events from Teamleader Focus. Can filter by date range, contact, company, or deal.',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'Start date (ISO 8601, e.g., 2026-02-01)' },
        to: { type: 'string', description: 'End date (ISO 8601, e.g., 2026-02-28)' },
        contact_id: { type: 'string', description: 'Filter by linked contact UUID' },
        company_id: { type: 'string', description: 'Filter by linked company UUID' },
        deal_id: { type: 'string', description: 'Filter by linked deal UUID' },
        user_id: { type: 'string', description: 'Filter by attendee user UUID' },
      },
    },
  },
  {
    name: 'teamleader_event_info',
    description: 'Get details of a specific calendar event by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Event UUID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'teamleader_event_create',
    description: 'Create a new calendar event in Teamleader Focus.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Event title' },
        starts_at: { type: 'string', description: 'Start datetime (ISO 8601, e.g., 2026-02-01T10:00:00+01:00)' },
        ends_at: { type: 'string', description: 'End datetime (ISO 8601)' },
        description: { type: 'string', description: 'Event description' },
        location: { type: 'string', description: 'Event location' },
        contact_ids: { type: 'array', items: { type: 'string' }, description: 'Contact UUIDs to link' },
        company_ids: { type: 'array', items: { type: 'string' }, description: 'Company UUIDs to link' },
        deal_ids: { type: 'array', items: { type: 'string' }, description: 'Deal UUIDs to link' },
        attendee_ids: { type: 'array', items: { type: 'string' }, description: 'User UUIDs of attendees' },
      },
      required: ['title', 'starts_at', 'ends_at'],
    },
  },
  
  // Contacts tools
  {
    name: 'teamleader_contacts_list',
    description: 'List contacts from Teamleader Focus. Can filter by name, email, company, or tags.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Search by name' },
        email: { type: 'string', description: 'Search by email address' },
        term: { type: 'string', description: 'General search term' },
        company_id: { type: 'string', description: 'Filter by linked company UUID' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags' },
        status: { type: 'string', enum: ['active', 'deactivated'], description: 'Filter by status' },
      },
    },
  },
  {
    name: 'teamleader_contact_info',
    description: 'Get details of a specific contact by ID, including linked companies.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Contact UUID' },
      },
      required: ['id'],
    },
  },
  
  // Email tracking tools
  {
    name: 'teamleader_email_track',
    description: 'Track/log an externally sent email in Teamleader Focus. Links the email to a contact, company, or deal for activity tracking.',
    inputSchema: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'Email subject' },
        body: { type: 'string', description: 'Email body (HTML supported)' },
        from: { type: 'string', description: 'Sender email address' },
        to: { type: 'array', items: { type: 'string' }, description: 'Recipient email addresses' },
        cc: { type: 'array', items: { type: 'string' }, description: 'CC recipients' },
        bcc: { type: 'array', items: { type: 'string' }, description: 'BCC recipients' },
        subject_type: { type: 'string', enum: ['contact', 'company', 'deal', 'nextgenProject'], description: 'Type of entity to link to' },
        subject_id: { type: 'string', description: 'UUID of entity to link to' },
      },
      required: ['subject', 'body', 'from', 'to', 'subject_type', 'subject_id'],
    },
  },
  {
    name: 'teamleader_emails_list',
    description: 'List tracked emails from Teamleader Focus. Can filter by linked entity.',
    inputSchema: {
      type: 'object',
      properties: {
        subject_type: { type: 'string', enum: ['contact', 'company', 'deal', 'nextgenProject'], description: 'Filter by entity type' },
        subject_id: { type: 'string', description: 'Filter by entity UUID' },
      },
    },
  },
];

export function createServer(client: TeamleaderClient): Server {
  const server = new Server(
    {
      name: 'teamleader-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        // Calendar tools
        case 'teamleader_events_list': {
          const filter = args as calendar.EventsListFilter;
          const result = await calendar.listEvents(client, filter);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }
        
        case 'teamleader_event_info': {
          const { id } = args as { id: string };
          const result = await calendar.getEventInfo(client, id);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }
        
        case 'teamleader_event_create': {
          const input = args as calendar.EventCreateInput;
          const result = await calendar.createEvent(client, input);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }
        
        // Contacts tools
        case 'teamleader_contacts_list': {
          const filter = args as contacts.ContactsListFilter;
          const result = await contacts.listContacts(client, filter);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }
        
        case 'teamleader_contact_info': {
          const { id } = args as { id: string };
          const result = await contacts.getContactInfo(client, id);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }
        
        // Email tracking tools
        case 'teamleader_email_track': {
          const input = args as email.EmailTrackingCreateInput;
          const result = await email.trackEmail(client, input);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }
        
        case 'teamleader_emails_list': {
          const filter = args as email.EmailTrackingFilter;
          const result = await email.listTrackedEmails(client, filter);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }
        
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  });

  return server;
}

export async function startServer(accessToken: string): Promise<void> {
  const client = new TeamleaderClient({ accessToken });
  const server = createServer(client);
  const transport = new StdioServerTransport();
  
  await server.connect(transport);
  console.error('Teamleader MCP server started');
}
