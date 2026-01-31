import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockInvoices, createMockFetch } from '../mocks/teamleader.js';
import { 
  listInvoices, 
  getInvoiceInfo, 
  draftInvoice,
  sendInvoice,
  bookInvoice,
  deleteInvoice,
} from '../../src/tools/invoices.js';
import { TeamleaderClient } from '../../src/client/teamleader.js';

describe('Invoices Tools', () => {
  let mockFetch: ReturnType<typeof createMockFetch>;
  let client: TeamleaderClient;

  beforeEach(() => {
    vi.resetAllMocks();
    mockFetch = createMockFetch({
      'invoices.list': mockInvoices.list,
      'invoices.info': mockInvoices.info,
      'invoices.draft': mockInvoices.draft,
      'invoices.send': {},
      'invoices.book': {},
      'invoices.delete': {},
    });
    client = new TeamleaderClient({
      accessToken: 'test-token',
      fetch: mockFetch as unknown as typeof fetch,
    });
  });

  describe('teamleader_invoices_list', () => {
    it('should list all invoices without filters', async () => {
      const result = await listInvoices(client, {});
      
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].invoice_number).toBe('2026 / 1');
      expect(result.data[1].invoice_number).toBe('2026 / 2');
    });

    it('should handle pagination metadata', async () => {
      const result = await listInvoices(client, {});
      
      expect(result.meta?.matches).toBe(2);
      expect(result.meta?.page.number).toBe(1);
    });

    it('should return invoice status', async () => {
      const result = await listInvoices(client, {});
      
      expect(result.data[0].status).toBe('outstanding');
      expect(result.data[1].status).toBe('matched');
    });

    it('should return paid status', async () => {
      const result = await listInvoices(client, {});
      
      expect(result.data[0].paid).toBe(false);
      expect(result.data[1].paid).toBe(true);
    });

    it('should filter by status', async () => {
      const filteredMockFetch = createMockFetch({
        'invoices.list': {
          data: mockInvoices.list.data.filter(inv => inv.status === 'outstanding'),
          meta: { page: { size: 20, number: 1 }, matches: 1 },
        },
      });
      const filteredClient = new TeamleaderClient({
        accessToken: 'test-token',
        fetch: filteredMockFetch as unknown as typeof fetch,
      });

      const result = await listInvoices(filteredClient, { status: ['outstanding'] });
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('outstanding');
    });

    it('should filter by customer', async () => {
      const result = await listInvoices(client, { 
        customer: { 
          type: 'company', 
          id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a' 
        } 
      });
      
      expect(result.data).toBeDefined();
    });

    it('should filter by department_id', async () => {
      const result = await listInvoices(client, { 
        department_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a' 
      });
      
      expect(result.data).toBeDefined();
    });

    it('should return total amounts', async () => {
      const result = await listInvoices(client, {});
      const invoice = result.data[0];
      
      expect(invoice.total.tax_exclusive.amount).toBe(1000.00);
      expect(invoice.total.tax_inclusive.amount).toBe(1210.00);
      expect(invoice.total.due.amount).toBe(1210.00);
    });

    it('should return invoicee information', async () => {
      const result = await listInvoices(client, {});
      const invoice = result.data[0];
      
      expect(invoice.invoicee.name).toBe('Acme Corporation');
      expect(invoice.invoicee.vat_number).toBe('BE0899623035');
      expect(invoice.invoicee.customer.type).toBe('company');
    });

    it('should return tax information', async () => {
      const result = await listInvoices(client, {});
      const taxes = result.data[0].total.taxes;
      
      expect(taxes).toHaveLength(1);
      expect(taxes[0].rate).toBe(0.21);
      expect(taxes[0].tax.amount).toBe(210.00);
    });

    it('should validate department_id is UUID', async () => {
      await expect(
        listInvoices(client, { department_id: 'not-a-uuid' })
      ).rejects.toThrow();
    });

    it('should filter by invoice date range', async () => {
      const result = await listInvoices(client, { 
        invoice_date_after: '2026-01-01',
        invoice_date_before: '2026-12-31'
      });
      
      expect(result.data).toBeDefined();
    });
  });

  describe('teamleader_invoice_info', () => {
    it('should get invoice details by id', async () => {
      const result = await getInvoiceInfo(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a');
      
      expect(result.data.id).toBe('invoice-uuid-1');
      expect(result.data.invoice_number).toBe('2026 / 1');
      expect(result.data.status).toBe('outstanding');
    });

    it('should include all invoice fields', async () => {
      const result = await getInvoiceInfo(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a');
      const invoice = result.data;
      
      expect(invoice).toHaveProperty('id');
      expect(invoice).toHaveProperty('department');
      expect(invoice).toHaveProperty('invoice_number');
      expect(invoice).toHaveProperty('invoice_date');
      expect(invoice).toHaveProperty('status');
      expect(invoice).toHaveProperty('due_on');
      expect(invoice).toHaveProperty('paid');
      expect(invoice).toHaveProperty('invoicee');
      expect(invoice).toHaveProperty('total');
      expect(invoice).toHaveProperty('grouped_lines');
      expect(invoice).toHaveProperty('payment_term');
    });

    it('should include grouped line items', async () => {
      const result = await getInvoiceInfo(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a');
      const groupedLines = result.data.grouped_lines;
      
      expect(groupedLines).toBeDefined();
      expect(groupedLines).toHaveLength(1);
      expect(groupedLines![0].section.title).toBe('Development Services');
      expect(groupedLines![0].line_items).toHaveLength(1);
    });

    it('should return line item details', async () => {
      const result = await getInvoiceInfo(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a');
      const lineItem = result.data.grouped_lines![0].line_items[0];
      
      expect(lineItem.quantity).toBe(10);
      expect(lineItem.description).toBe('Web Development Hours');
      expect(lineItem.unit_price.amount).toBe(100.00);
      expect(lineItem.unit_price.tax).toBe('excluding');
    });

    it('should validate id is UUID', async () => {
      await expect(getInvoiceInfo(client, 'invalid')).rejects.toThrow();
    });

    it('should handle non-existent invoice', async () => {
      const errorClient = new TeamleaderClient({
        accessToken: 'test-token',
        fetch: createMockFetch({}) as unknown as typeof fetch,
      });

      await expect(
        getInvoiceInfo(errorClient, 'f1dfb84c-3c29-4548-9b9b-9090a0807000')
      ).rejects.toThrow();
    });

    it('should return payment information', async () => {
      const result = await getInvoiceInfo(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a');
      
      expect(result.data.payments).toBeDefined();
      expect(result.data.payment_reference).toBe('+++084/2613/66074+++');
    });

    it('should return currency exchange rate', async () => {
      const result = await getInvoiceInfo(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a');
      
      expect(result.data.currency_exchange_rate).toBeDefined();
      expect(result.data.currency_exchange_rate.from).toBe('EUR');
      expect(result.data.currency_exchange_rate.to).toBe('EUR');
      expect(result.data.currency_exchange_rate.rate).toBe(1);
    });
  });

  describe('teamleader_invoice_draft', () => {
    it('should create a draft invoice with required fields', async () => {
      const result = await draftInvoice(client, {
        invoicee: {
          customer: {
            type: 'company',
            id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
          },
        },
        department_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742b',
        payment_term: {
          type: 'cash',
        },
        grouped_lines: [
          {
            section: {
              title: 'Services',
            },
            line_items: [
              {
                quantity: 5,
                description: 'Consulting hours',
                unit_price: {
                  amount: 100,
                  tax: 'excluding',
                },
                tax_rate_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742c',
              },
            ],
          },
        ],
      });

      expect(result.type).toBe('invoice');
      expect(result.id).toBe('invoice-uuid-new');
    });

    it('should create a draft invoice with for_attention_of as name', async () => {
      const result = await draftInvoice(client, {
        invoicee: {
          customer: {
            type: 'company',
            id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
          },
          for_attention_of: {
            name: 'Finance Department',
          },
        },
        department_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742b',
        payment_term: {
          type: 'cash',
        },
        grouped_lines: [],
      });

      expect(result.id).toBeDefined();
    });

    it('should create a draft invoice with for_attention_of as contact', async () => {
      const result = await draftInvoice(client, {
        invoicee: {
          customer: {
            type: 'company',
            id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
          },
          for_attention_of: {
            contact_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742d',
          },
        },
        department_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742b',
        payment_term: {
          type: 'cash',
        },
        grouped_lines: [],
      });

      expect(result.id).toBeDefined();
    });

    it('should create a draft invoice with multiple line items', async () => {
      const result = await draftInvoice(client, {
        invoicee: {
          customer: {
            type: 'contact',
            id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
          },
        },
        department_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742b',
        payment_term: {
          type: 'after_invoice_date',
          days: 30,
        },
        grouped_lines: [
          {
            section: { title: 'Development' },
            line_items: [
              {
                quantity: 10,
                description: 'Frontend Development',
                unit_price: { amount: 100, tax: 'excluding' },
                tax_rate_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742c',
              },
              {
                quantity: 5,
                description: 'Backend Development',
                unit_price: { amount: 120, tax: 'excluding' },
                tax_rate_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742c',
              },
            ],
          },
        ],
      });

      expect(result.id).toBeDefined();
    });

    it('should create a draft invoice with optional note', async () => {
      const result = await draftInvoice(client, {
        invoicee: {
          customer: {
            type: 'company',
            id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
          },
        },
        department_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742b',
        payment_term: {
          type: 'cash',
        },
        grouped_lines: [],
        note: 'Thank you for your business!',
      });

      expect(result.id).toBeDefined();
    });

    it('should validate customer type', async () => {
      await expect(
        draftInvoice(client, {
          invoicee: {
            customer: {
              type: 'invalid' as 'company',
              id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
            },
          },
          department_id: 'f1dfb84c-3c29-4548-9b9b-9090a080742b',
          payment_term: { type: 'cash' },
          grouped_lines: [],
        })
      ).rejects.toThrow();
    });

    it('should validate department_id is UUID', async () => {
      await expect(
        draftInvoice(client, {
          invoicee: {
            customer: {
              type: 'company',
              id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
            },
          },
          department_id: 'not-a-uuid',
          payment_term: { type: 'cash' },
          grouped_lines: [],
        })
      ).rejects.toThrow();
    });
  });

  describe('teamleader_invoice_send', () => {
    it('should send an invoice', async () => {
      await expect(
        sendInvoice(client, {
          id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
          content: {
            subject: 'Your Invoice',
            body: 'Please find your invoice attached.',
          },
          recipients: {
            to: [
              { email: 'customer@example.com' },
            ],
          },
        })
      ).resolves.not.toThrow();
    });

    it('should send an invoice with CC recipients', async () => {
      await expect(
        sendInvoice(client, {
          id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
          content: {
            subject: 'Your Invoice',
            body: 'Please find your invoice attached.',
          },
          recipients: {
            to: [{ email: 'customer@example.com' }],
            cc: [{ email: 'accountant@example.com' }],
          },
        })
      ).resolves.not.toThrow();
    });

    it('should validate id is UUID', async () => {
      await expect(
        sendInvoice(client, {
          id: 'not-a-uuid',
          content: {
            subject: 'Your Invoice',
            body: 'Please find your invoice attached.',
          },
        })
      ).rejects.toThrow();
    });

    it('should validate email addresses', async () => {
      await expect(
        sendInvoice(client, {
          id: 'f1dfb84c-3c29-4548-9b9b-9090a080742a',
          content: {
            subject: 'Your Invoice',
            body: 'Please find your invoice attached.',
          },
          recipients: {
            to: [{ email: 'not-an-email' }],
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('teamleader_invoice_book', () => {
    it('should book a draft invoice', async () => {
      await expect(
        bookInvoice(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a', '2026-01-31')
      ).resolves.not.toThrow();
    });

    it('should validate id is UUID', async () => {
      await expect(
        bookInvoice(client, 'not-a-uuid', '2026-01-31')
      ).rejects.toThrow();
    });
  });

  describe('teamleader_invoice_delete', () => {
    it('should delete an invoice', async () => {
      await expect(
        deleteInvoice(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a')
      ).resolves.not.toThrow();
    });

    it('should validate id is UUID', async () => {
      await expect(
        deleteInvoice(client, 'not-a-uuid')
      ).rejects.toThrow();
    });
  });
});
