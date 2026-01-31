import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockContacts, createMockFetch } from '../mocks/teamleader.js';
import { listContacts, getContactInfo, createContact } from '../../src/tools/contacts.js';
import { TeamleaderClient } from '../../src/client/teamleader.js';

describe('Contacts Tools', () => {
  let mockFetch: ReturnType<typeof createMockFetch>;
  let client: TeamleaderClient;

  beforeEach(() => {
    vi.resetAllMocks();
    mockFetch = createMockFetch({
      'contacts.list': mockContacts.list,
      'contacts.info': mockContacts.info,
      'contacts.add': { type: 'contact', id: 'contact-uuid-new' },
    });
    client = new TeamleaderClient({
      accessToken: 'test-token',
      fetch: mockFetch as unknown as typeof fetch,
    });
  });

  describe('teamleader_contacts_list', () => {
    it('should list all contacts without filters', async () => {
      const result = await listContacts(client, {});
      
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].first_name).toBe('John');
      expect(result.data[1].first_name).toBe('Jane');
    });

    it('should filter contacts by name', async () => {
      const filteredMockFetch = createMockFetch({
        'contacts.list': {
          data: mockContacts.list.data.filter(
            (c) => c.first_name.includes('John') || c.last_name.includes('John')
          ),
          meta: { page: { size: 20, number: 1 }, matches: 1 },
        },
      });
      const filteredClient = new TeamleaderClient({
        accessToken: 'test-token',
        fetch: filteredMockFetch as unknown as typeof fetch,
      });

      const result = await listContacts(filteredClient, { name: 'John' });
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0].first_name).toBe('John');
    });

    it('should filter contacts by email', async () => {
      const filteredMockFetch = createMockFetch({
        'contacts.list': {
          data: mockContacts.list.data.filter(
            (c) => c.emails.some((e) => e.email.includes('john'))
          ),
          meta: { page: { size: 20, number: 1 }, matches: 1 },
        },
      });
      const filteredClient = new TeamleaderClient({
        accessToken: 'test-token',
        fetch: filteredMockFetch as unknown as typeof fetch,
      });

      const result = await listContacts(filteredClient, { email: 'john' });
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0].emails[0].email).toContain('john');
    });

    it('should handle pagination metadata', async () => {
      const result = await listContacts(client, {});
      
      expect(result.meta?.matches).toBe(2);
      expect(result.meta?.page.number).toBe(1);
    });

    it('should return contact email addresses', async () => {
      const result = await listContacts(client, {});
      const contact = result.data[0];
      
      expect(contact.emails).toBeDefined();
      expect(contact.emails).toHaveLength(1);
      expect(contact.emails[0].email).toBe('john.doe@example.com');
    });

    it('should return contact phone numbers', async () => {
      const result = await listContacts(client, {});
      const contact = result.data[0];
      
      expect(contact.telephones).toBeDefined();
      expect(contact.telephones).toHaveLength(1);
      expect(contact.telephones[0].number).toContain('+32');
    });

    it('should handle contacts without optional fields', async () => {
      const result = await listContacts(client, {});
      const contactWithoutOptionals = result.data[1]; // Jane Smith
      
      expect(contactWithoutOptionals.telephones).toHaveLength(0);
      expect(contactWithoutOptionals.website).toBeNull();
      // In list view, API returns primary_address (nullable) not addresses array
      expect((contactWithoutOptionals as unknown as { primary_address: unknown }).primary_address).toBeNull();
      expect(contactWithoutOptionals.birthdate).toBeNull();
    });

    it('should filter by tags', async () => {
      const result = await listContacts(client, { tags: ['vip'] });
      
      expect(result.data).toBeDefined();
    });

    it('should filter by status', async () => {
      const result = await listContacts(client, { status: 'active' });
      
      expect(result.data).toBeDefined();
    });

    it('should validate company_id is UUID', async () => {
      await expect(
        listContacts(client, { company_id: 'not-a-uuid' })
      ).rejects.toThrow();
    });
  });

  describe('teamleader_contact_info', () => {
    it('should get contact details by id', async () => {
      const result = await getContactInfo(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a');
      
      expect(result.data.id).toBe('contact-uuid-1');
      expect(result.data.first_name).toBe('John');
      expect(result.data.last_name).toBe('Doe');
    });

    it('should include all contact fields', async () => {
      const result = await getContactInfo(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a');
      const contact = result.data;
      
      expect(contact).toHaveProperty('id');
      expect(contact).toHaveProperty('first_name');
      expect(contact).toHaveProperty('last_name');
      expect(contact).toHaveProperty('salutation');
      expect(contact).toHaveProperty('emails');
      expect(contact).toHaveProperty('telephones');
      expect(contact).toHaveProperty('website');
      expect(contact).toHaveProperty('addresses');
      expect(contact).toHaveProperty('gender');
      expect(contact).toHaveProperty('birthdate');
      expect(contact).toHaveProperty('language');
      expect(contact).toHaveProperty('tags');
      expect(contact).toHaveProperty('status');
    });

    it('should include company links for contact', async () => {
      const result = await getContactInfo(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a');
      const contact = result.data;
      
      expect(contact.companies).toBeDefined();
      expect(contact.companies).toHaveLength(1);
      expect(contact.companies![0].company.id).toBe('company-uuid-1');
      expect(contact.companies![0].position).toBe('CEO');
      expect(contact.companies![0].is_primary).toBe(true);
    });

    it('should validate id is UUID', async () => {
      await expect(getContactInfo(client, 'invalid')).rejects.toThrow();
    });

    it('should handle non-existent contact', async () => {
      const errorClient = new TeamleaderClient({
        accessToken: 'test-token',
        fetch: createMockFetch({}) as unknown as typeof fetch,
      });

      await expect(
        getContactInfo(errorClient, 'f1dfb84c-3c29-4548-9b9b-9090a0807000')
      ).rejects.toThrow();
    });

    it('should return address information', async () => {
      const result = await getContactInfo(client, 'f1dfb84c-3c29-4548-9b9b-9090a080742a');
      const contact = result.data;
      const address = contact.addresses[0];
      
      expect(address.type).toBe('primary');
      expect(address.address.line_1).toBe('Main Street 123');
      expect(address.address.city).toBe('Brussels');
      expect(address.address.country).toBe('BE');
    });
  });

  describe('teamleader_contact_create', () => {
    it('should create a contact with required fields', async () => {
      const result = await createContact(client, {
        first_name: 'New',
        last_name: 'Contact',
      });

      expect(result.type).toBe('contact');
      expect(result.id).toBe('contact-uuid-new');
    });

    it('should create a contact with email', async () => {
      const result = await createContact(client, {
        first_name: 'Test',
        last_name: 'User',
        emails: [{ type: 'primary', email: 'test@example.com' }],
      });

      expect(result.id).toBeDefined();
    });

    it('should create a contact with tags', async () => {
      const result = await createContact(client, {
        first_name: 'Tagged',
        last_name: 'Contact',
        tags: ['prospect', 'newsletter'],
      });

      expect(result.id).toBeDefined();
    });
  });
});
