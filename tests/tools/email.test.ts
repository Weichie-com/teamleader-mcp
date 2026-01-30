import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockFetch } from '../mocks/teamleader.js';
import { trackEmail, listTrackedEmails, sendInvoice } from '../../src/tools/email.js';
import { TeamleaderClient } from '../../src/client/teamleader.js';

/**
 * Note: Teamleader Focus API does NOT have a direct emails.send endpoint.
 * 
 * Available email-related functionality:
 * - invoices.send - Send invoice to customer
 * - quotations.send - Send quotation to customer
 * - emailTracking.create - Track an email sent externally
 * - emailTracking.list - List tracked emails
 */

// Mock responses
const mockEmailTracking = {
  create: {
    type: 'emailTracking',
    id: 'email-tracking-uuid-1',
  },
  
  list: {
    data: [
      {
        id: 'email-tracking-uuid-1',
        subject: 'Project Update',
        body: 'Here is the latest update on your project...',
        from: 'sales@company.com',
        to: ['john.doe@example.com'],
        cc: [],
        bcc: [],
        sent_at: '2026-01-30T10:00:00+01:00',
        subject_type: 'contact',
        subject_id: 'contact-uuid-1',
        attachments: [],
      },
    ],
    meta: {
      page: { size: 20, number: 1 },
      matches: 1,
    },
  },
};

describe('Email Tools', () => {
  let client: TeamleaderClient;

  beforeEach(() => {
    vi.resetAllMocks();
    const mockFetch = createMockFetch({
      'emailTracking.create': mockEmailTracking.create,
      'emailTracking.list': mockEmailTracking.list,
      'invoices.send': {}, // 204 response
    });
    client = new TeamleaderClient({
      accessToken: 'test-token',
      fetch: mockFetch as unknown as typeof fetch,
    });
  });

  describe('Teamleader Email Capabilities', () => {
    it('should document that direct email sending is not available', () => {
      // Teamleader Focus API does NOT have an emails.send endpoint
      // for sending arbitrary emails.
      //
      // Available alternatives:
      // 1. invoices.send - Send invoices via email
      // 2. quotations.send - Send quotations via email  
      // 3. emailTracking.create - Log emails sent externally
      //
      // For arbitrary email sending, integrate with:
      // - SendGrid, Mailgun, or other email APIs
      // - SMTP server directly
      
      expect(true).toBe(true);
    });
  });

  describe('teamleader_email_track (emailTracking.create)', () => {
    it('should track an externally sent email', async () => {
      const result = await trackEmail(client, {
        subject: 'Project Update',
        body: 'Here is the latest update...',
        from: 'sales@company.com',
        to: ['john.doe@example.com'],
        subject_type: 'contact',
        subject_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
      });
      
      expect(result.type).toBe('emailTracking');
      expect(result.id).toBeDefined();
    });

    it('should support linking to contact', async () => {
      const result = await trackEmail(client, {
        subject: 'Follow-up',
        body: 'Thanks for our meeting...',
        from: 'sales@company.com',
        to: ['client@example.com'],
        subject_type: 'contact',
        subject_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
      });

      expect(result.id).toBeDefined();
    });

    it('should support linking to company', async () => {
      const result = await trackEmail(client, {
        subject: 'Proposal',
        body: 'Please find attached...',
        from: 'sales@company.com',
        to: ['info@client.com'],
        subject_type: 'company',
        subject_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
      });

      expect(result.id).toBeDefined();
    });

    it('should support linking to deal', async () => {
      const result = await trackEmail(client, {
        subject: 'Deal Discussion',
        body: 'Regarding our proposal...',
        from: 'sales@company.com',
        to: ['buyer@client.com'],
        subject_type: 'deal',
        subject_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
      });

      expect(result.id).toBeDefined();
    });

    it('should support CC and BCC recipients', async () => {
      const result = await trackEmail(client, {
        subject: 'Team Update',
        body: 'Update for the team...',
        from: 'manager@company.com',
        to: ['team@company.com'],
        cc: ['boss@company.com'],
        bcc: ['archive@company.com'],
        subject_type: 'contact',
        subject_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
      });

      expect(result.id).toBeDefined();
    });

    it('should validate email addresses', async () => {
      await expect(
        trackEmail(client, {
          subject: 'Test',
          body: 'Test body',
          from: 'invalid-email',
          to: ['valid@example.com'],
          subject_type: 'contact',
          subject_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
        })
      ).rejects.toThrow();
    });

    it('should validate subject_id is UUID', async () => {
      await expect(
        trackEmail(client, {
          subject: 'Test',
          body: 'Test body',
          from: 'valid@example.com',
          to: ['recipient@example.com'],
          subject_type: 'contact',
          subject_id: 'not-a-uuid',
        })
      ).rejects.toThrow();
    });
  });

  describe('teamleader_emails_list (emailTracking.list)', () => {
    it('should list tracked emails', async () => {
      const result = await listTrackedEmails(client, {});
      
      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].subject).toBe('Project Update');
    });

    it('should filter by subject (contact/company/deal)', async () => {
      const result = await listTrackedEmails(client, {
        subject_type: 'contact',
        subject_id: 'contact-uuid-1',
      });

      expect(result.data).toBeDefined();
    });

    it('should include pagination metadata', async () => {
      const result = await listTrackedEmails(client, {});
      
      expect(result.meta?.matches).toBe(1);
      expect(result.meta?.page.number).toBe(1);
    });
  });

  describe('Invoice Sending (invoices.send)', () => {
    it('should send invoice to recipients', async () => {
      // invoices.send returns 204 (no content)
      await expect(
        sendInvoice(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a', {
          to: [{ email: 'client@example.com', name: 'John Doe' }],
        })
      ).resolves.not.toThrow();
    });

    it('should support CC and BCC for invoices', async () => {
      await expect(
        sendInvoice(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a', {
          to: [{ email: 'client@example.com' }],
          cc: [{ email: 'accounts@client.com' }],
          bcc: [{ email: 'archive@company.com' }],
        })
      ).resolves.not.toThrow();
    });

    it('should validate invoice_id is UUID', async () => {
      await expect(
        sendInvoice(client, 'not-a-uuid', {
          to: [{ email: 'client@example.com' }],
        })
      ).rejects.toThrow();
    });
  });
});
