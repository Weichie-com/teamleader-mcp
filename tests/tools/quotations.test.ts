import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockQuotations, createMockFetch } from '../mocks/teamleader.js';
import { 
  listQuotations, 
  getQuotationInfo, 
  createQuotation,
  sendQuotation,
  acceptQuotation,
  deleteQuotation,
  downloadQuotation,
} from '../../src/tools/quotations.js';
import { TeamleaderClient } from '../../src/client/teamleader.js';

describe('Quotations Tools', () => {
  let mockFetch: ReturnType<typeof createMockFetch>;
  let client: TeamleaderClient;

  beforeEach(() => {
    vi.resetAllMocks();
    mockFetch = createMockFetch({
      'quotations.list': mockQuotations.list,
      'quotations.info': mockQuotations.info,
      'quotations.create': mockQuotations.create,
      'quotations.send': {},
      'quotations.accept': {},
      'quotations.delete': {},
      'quotations.download': { 
        data: { 
          location: 'https://cdn.teamleader.eu/file', 
          expires: '2026-02-05T16:44:33+00:00' 
        } 
      },
    });
    client = new TeamleaderClient({
      accessToken: 'test-token',
      fetch: mockFetch as unknown as typeof fetch,
    });
  });

  describe('teamleader_quotations_list', () => {
    it('should list all quotations without filters', async () => {
      const result = await listQuotations(client, {});
      
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Website Development Proposal');
      expect(result.data[1].name).toBe('Maintenance Contract');
    });

    it('should handle pagination metadata', async () => {
      const result = await listQuotations(client, {});
      
      expect(result.meta?.matches).toBe(2);
      expect(result.meta?.page.number).toBe(1);
    });

    it('should return quotation status', async () => {
      const result = await listQuotations(client, {});
      
      expect(result.data[0].status).toBe('open');
      expect(result.data[1].status).toBe('accepted');
    });

    it('should filter by status', async () => {
      const filteredMockFetch = createMockFetch({
        'quotations.list': {
          data: mockQuotations.list.data.filter(q => q.status === 'accepted'),
          meta: { page: { size: 20, number: 1 }, matches: 1 },
        },
      });
      const filteredClient = new TeamleaderClient({
        accessToken: 'test-token',
        fetch: filteredMockFetch as unknown as typeof fetch,
      });

      const result = await listQuotations(filteredClient, { status: 'accepted' });
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('accepted');
    });

    it('should return total amounts', async () => {
      const result = await listQuotations(client, {});
      const quotation = result.data[0];
      
      expect(quotation.total.tax_exclusive.amount).toBe(5000.00);
      expect(quotation.total.tax_inclusive.amount).toBe(6050.00);
    });

    it('should return tax information', async () => {
      const result = await listQuotations(client, {});
      const taxes = result.data[0].total.taxes;
      
      expect(taxes).toHaveLength(1);
      expect(taxes[0].rate).toBe(0.21);
      expect(taxes[0].tax.amount).toBe(1050.00);
    });

    it('should return deal reference', async () => {
      const result = await listQuotations(client, {});
      
      expect(result.data[0].deal.type).toBe('deal');
      expect(result.data[0].deal.id).toBe('deal-uuid-1');
    });

    it('should return currency exchange rate', async () => {
      const result = await listQuotations(client, {});
      
      expect(result.data[0].currency_exchange_rate.from).toBe('EUR');
      expect(result.data[0].currency_exchange_rate.to).toBe('EUR');
      expect(result.data[0].currency_exchange_rate.rate).toBe(1);
    });

    it('should filter by specific IDs', async () => {
      const result = await listQuotations(client, { 
        ids: ['f1dfb84c-3c29-4548-9b9b-9090a080742a'] 
      });
      
      expect(result.data).toBeDefined();
    });
  });

  describe('teamleader_quotation_info', () => {
    it('should get quotation details by id', async () => {
      const result = await getQuotationInfo(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a');
      
      expect(result.data.id).toBe('quotation-uuid-1');
      expect(result.data.name).toBe('Website Development Proposal');
      expect(result.data.status).toBe('open');
    });

    it('should include all quotation fields', async () => {
      const result = await getQuotationInfo(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a');
      const quotation = result.data;
      
      expect(quotation).toHaveProperty('id');
      expect(quotation).toHaveProperty('deal');
      expect(quotation).toHaveProperty('grouped_lines');
      expect(quotation).toHaveProperty('currency');
      expect(quotation).toHaveProperty('currency_exchange_rate');
      expect(quotation).toHaveProperty('total');
      expect(quotation).toHaveProperty('status');
      expect(quotation).toHaveProperty('name');
    });

    it('should include grouped line items', async () => {
      const result = await getQuotationInfo(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a');
      const groupedLines = result.data.grouped_lines;
      
      expect(groupedLines).toBeDefined();
      expect(groupedLines).toHaveLength(1);
      expect(groupedLines![0].section.title).toBe('Development');
      expect(groupedLines![0].line_items).toHaveLength(2);
    });

    it('should return line item details', async () => {
      const result = await getQuotationInfo(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a');
      const lineItem = result.data.grouped_lines![0].line_items[0];
      
      expect(lineItem.quantity).toBe(40);
      expect(lineItem.description).toBe('Frontend Development');
      expect(lineItem.unit_price.amount).toBe(100.00);
      expect(lineItem.unit_price.tax).toBe('excluding');
    });

    it('should return line item totals', async () => {
      const result = await getQuotationInfo(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a');
      const lineItem = result.data.grouped_lines![0].line_items[0];
      
      expect(lineItem.total.tax_exclusive.amount).toBe(4000.00);
      expect(lineItem.total.tax_inclusive.amount).toBe(4840.00);
    });

    it('should validate id is UUID', async () => {
      await expect(getQuotationInfo(client, 'invalid')).rejects.toThrow();
    });

    it('should handle non-existent quotation', async () => {
      const errorClient = new TeamleaderClient({
        accessToken: 'test-token',
        fetch: createMockFetch({}) as unknown as typeof fetch,
      });

      await expect(
        getQuotationInfo(errorClient, 'f1dfb84c-3c29-4548-9b9b-9090a0807000')
      ).rejects.toThrow();
    });

    it('should return document template', async () => {
      const result = await getQuotationInfo(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a');
      
      expect(result.data.document_template).toBeDefined();
      expect(result.data.document_template?.type).toBe('documentTemplate');
    });
  });

  describe('teamleader_quotation_create', () => {
    it('should create a quotation with required fields', async () => {
      const result = await createQuotation(client, {
        deal_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
        grouped_lines: [
          {
            section: {
              title: 'Services',
            },
            line_items: [
              {
                quantity: 10,
                description: 'Consulting',
                unit_price: {
                  amount: 100,
                  tax: 'excluding',
                },
                tax_rate_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742b',
              },
            ],
          },
        ],
      });

      expect(result.type).toBe('quotation');
      expect(result.id).toBe('quotation-uuid-new');
    });

    it('should create a quotation with text instead of lines', async () => {
      const result = await createQuotation(client, {
        deal_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
        text: 'Simple quotation text with details',
      });

      expect(result.id).toBeDefined();
    });

    it('should create a quotation with multiple sections', async () => {
      const result = await createQuotation(client, {
        deal_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
        grouped_lines: [
          {
            section: { title: 'Development' },
            line_items: [
              {
                quantity: 40,
                description: 'Frontend',
                unit_price: { amount: 100, tax: 'excluding' },
                tax_rate_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742b',
              },
            ],
          },
          {
            section: { title: 'Design' },
            line_items: [
              {
                quantity: 20,
                description: 'UI Design',
                unit_price: { amount: 80, tax: 'excluding' },
                tax_rate_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742b',
              },
            ],
          },
        ],
      });

      expect(result.id).toBeDefined();
    });

    it('should create a quotation with discounts', async () => {
      const result = await createQuotation(client, {
        deal_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
        grouped_lines: [],
        discounts: [
          {
            description: 'Early bird discount',
            type: 'percentage',
            value: 10,
          },
        ],
      });

      expect(result.id).toBeDefined();
    });

    it('should create a quotation with currency', async () => {
      const result = await createQuotation(client, {
        deal_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
        currency: {
          code: 'EUR',
          exchange_rate: 1,
        },
        grouped_lines: [],
      });

      expect(result.id).toBeDefined();
    });

    it('should create a quotation with expiry', async () => {
      const result = await createQuotation(client, {
        deal_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
        grouped_lines: [],
        expiry: {
          expires_after: '2026-03-01',
          action_after_expiry: 'lock',
        },
      });

      expect(result.id).toBeDefined();
    });

    it('should validate deal_id is UUID', async () => {
      await expect(
        createQuotation(client, {
          deal_id: 'not-a-uuid',
          grouped_lines: [],
        })
      ).rejects.toThrow();
    });

    it('should validate tax_rate_id is UUID', async () => {
      await expect(
        createQuotation(client, {
          deal_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
          grouped_lines: [
            {
              line_items: [
                {
                  quantity: 1,
                  description: 'Test',
                  unit_price: { amount: 100, tax: 'excluding' },
                  tax_rate_id: 'not-a-uuid',
                },
              ],
            },
          ],
        })
      ).rejects.toThrow();
    });
  });

  describe('teamleader_quotation_send', () => {
    it('should send a quotation', async () => {
      await expect(
        sendQuotation(client, {
          quotations: ['f1dfb84c-3c29-4548-9b9b-9090a080742a'],
          recipients: {
            to: [
              { email_address: 'customer@example.com' },
            ],
          },
          subject: 'Your Quotation',
          content: 'Please find your quotation attached. Sign here: #LINK',
          language: 'en',
        })
      ).resolves.not.toThrow();
    });

    it('should send multiple quotations from same deal', async () => {
      await expect(
        sendQuotation(client, {
          quotations: [
            'f1dfb84c-3c29-4548-9b9b-9090a080742a',
            'f1dfb84c-3c29-4548-9b9b-9090a080742b',
          ],
          recipients: {
            to: [{ email_address: 'customer@example.com' }],
          },
          subject: 'Your Quotations',
          content: 'Please find your quotations attached. #LINK',
          language: 'en',
        })
      ).resolves.not.toThrow();
    });

    it('should send with CC and BCC', async () => {
      await expect(
        sendQuotation(client, {
          quotations: ['f1dfb84c-3c29-4548-9b9b-9090a080742a'],
          recipients: {
            to: [{ email_address: 'customer@example.com' }],
            cc: [{ email_address: 'manager@example.com' }],
            bcc: [{ email_address: 'archive@example.com' }],
          },
          subject: 'Your Quotation',
          content: 'Please review. #LINK',
          language: 'nl',
        })
      ).resolves.not.toThrow();
    });

    it('should send with sender information', async () => {
      await expect(
        sendQuotation(client, {
          quotations: ['f1dfb84c-3c29-4548-9b9b-9090a080742a'],
          from: {
            sender: {
              type: 'user',
              id: 'f1dfb84c-3c29-4548-9b9b-9090a080742b',
            },
            email_address: 'sales@company.com',
          },
          recipients: {
            to: [{ email_address: 'customer@example.com' }],
          },
          subject: 'Your Quotation',
          content: '#LINK',
          language: 'en',
        })
      ).resolves.not.toThrow();
    });

    it('should validate quotation ids are UUIDs', async () => {
      await expect(
        sendQuotation(client, {
          quotations: ['not-a-uuid'],
          recipients: {
            to: [{ email_address: 'customer@example.com' }],
          },
          subject: 'Test',
          content: 'Test',
          language: 'en',
        })
      ).rejects.toThrow();
    });

    it('should validate email addresses', async () => {
      await expect(
        sendQuotation(client, {
          quotations: ['f1dfb84c-3c29-4548-9b9b-9090a080742a'],
          recipients: {
            to: [{ email_address: 'not-an-email' }],
          },
          subject: 'Test',
          content: 'Test',
          language: 'en',
        })
      ).rejects.toThrow();
    });
  });

  describe('teamleader_quotation_accept', () => {
    it('should accept a quotation', async () => {
      await expect(
        acceptQuotation(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a')
      ).resolves.not.toThrow();
    });

    it('should validate id is UUID', async () => {
      await expect(
        acceptQuotation(client, 'not-a-uuid')
      ).rejects.toThrow();
    });
  });

  describe('teamleader_quotation_delete', () => {
    it('should delete a quotation', async () => {
      await expect(
        deleteQuotation(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a')
      ).resolves.not.toThrow();
    });

    it('should validate id is UUID', async () => {
      await expect(
        deleteQuotation(client, 'not-a-uuid')
      ).rejects.toThrow();
    });
  });

  describe('teamleader_quotation_download', () => {
    it('should download a quotation as PDF', async () => {
      const result = await downloadQuotation(
        client, 
        'f1dfb84c-3c29-4548-9b9b-9090a080742a',
        'pdf'
      );
      
      expect(result.data.location).toBe('https://cdn.teamleader.eu/file');
      expect(result.data.expires).toBeDefined();
    });

    it('should validate id is UUID', async () => {
      await expect(
        downloadQuotation(client, 'not-a-uuid')
      ).rejects.toThrow();
    });
  });
});
