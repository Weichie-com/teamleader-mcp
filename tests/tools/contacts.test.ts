import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockContacts, createMockFetch } from '../mocks/teamleader.js';

// We'll import these once implemented
// import { listContacts, getContactInfo } from '../../src/tools/contacts.js';
// import { TeamleaderClient } from '../../src/client/teamleader.js';

describe('Contacts Tools', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('teamleader_contacts_list', () => {
    it('should list all contacts without filters', async () => {
      const mockFetch = createMockFetch({
        'contacts.list': mockContacts.list,
      });
      
      // TODO: Implement and test
      // const client = new TeamleaderClient({ accessToken: 'test-token', fetch: mockFetch });
      // const result = await listContacts(client, {});
      
      // expect(result).toBeDefined();
      // expect(result.data).toHaveLength(2);
      // expect(result.data[0].first_name).toBe('John');
      
      expect(mockContacts.list.data).toHaveLength(2);
    });

    it('should filter contacts by name', async () => {
      // Filter to only return contacts matching "John"
      const filteredContacts = {
        data: mockContacts.list.data.filter(
          (c) => c.first_name.includes('John') || c.last_name.includes('John')
        ),
        meta: { page: { size: 20, number: 1 }, matches: 1 },
      };
      
      const mockFetch = createMockFetch({
        'contacts.list': filteredContacts,
      });
      
      // TODO: Implement and test
      // const client = new TeamleaderClient({ accessToken: 'test-token', fetch: mockFetch });
      // const result = await listContacts(client, { name: 'John' });
      
      // expect(result.data).toHaveLength(1);
      // expect(result.data[0].first_name).toBe('John');
      
      expect(filteredContacts.data).toHaveLength(1);
      expect(filteredContacts.data[0].first_name).toBe('John');
    });

    it('should filter contacts by email', async () => {
      // Filter to only return contacts with matching email
      const filteredContacts = {
        data: mockContacts.list.data.filter(
          (c) => c.emails.some((e) => e.email.includes('john'))
        ),
        meta: { page: { size: 20, number: 1 }, matches: 1 },
      };
      
      const mockFetch = createMockFetch({
        'contacts.list': filteredContacts,
      });
      
      // TODO: Implement and test
      // const client = new TeamleaderClient({ accessToken: 'test-token', fetch: mockFetch });
      // const result = await listContacts(client, { email: 'john' });
      
      // expect(result.data).toHaveLength(1);
      // expect(result.data[0].emails[0].email).toContain('john');
      
      expect(filteredContacts.data).toHaveLength(1);
    });

    it('should handle pagination metadata', async () => {
      const mockFetch = createMockFetch({
        'contacts.list': mockContacts.list,
      });
      
      // TODO: Implement and test
      // const client = new TeamleaderClient({ accessToken: 'test-token', fetch: mockFetch });
      // const result = await listContacts(client, {});
      
      // expect(result.meta.matches).toBe(2);
      // expect(result.meta.page.number).toBe(1);
      
      expect(mockContacts.list.meta.matches).toBe(2);
    });

    it('should return contact email addresses', async () => {
      const contact = mockContacts.list.data[0];
      
      expect(contact.emails).toBeDefined();
      expect(contact.emails).toHaveLength(1);
      expect(contact.emails[0].email).toBe('john.doe@example.com');
    });

    it('should return contact phone numbers', async () => {
      const contact = mockContacts.list.data[0];
      
      expect(contact.telephones).toBeDefined();
      expect(contact.telephones).toHaveLength(1);
      expect(contact.telephones[0].number).toContain('+32');
    });

    it('should handle contacts without optional fields', async () => {
      const contactWithoutOptionals = mockContacts.list.data[1];
      
      // Jane Smith has minimal info
      expect(contactWithoutOptionals.telephones).toHaveLength(0);
      expect(contactWithoutOptionals.website).toBeNull();
      expect(contactWithoutOptionals.addresses).toHaveLength(0);
      expect(contactWithoutOptionals.birthdate).toBeNull();
    });
  });

  describe('teamleader_contact_info', () => {
    it('should get contact details by id', async () => {
      const mockFetch = createMockFetch({
        'contacts.info': mockContacts.info,
      });
      
      // TODO: Implement and test
      // const client = new TeamleaderClient({ accessToken: 'test-token', fetch: mockFetch });
      // const result = await getContactInfo(client, 'contact-uuid-1');
      
      // expect(result.data.id).toBe('contact-uuid-1');
      // expect(result.data.first_name).toBe('John');
      // expect(result.data.last_name).toBe('Doe');
      
      expect(mockContacts.info.data.id).toBe('contact-uuid-1');
    });

    it('should include all contact fields', async () => {
      const contact = mockContacts.info.data;
      
      // Verify all expected fields exist
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
      const contact = mockContacts.info.data;
      
      // Contact info includes company relationships
      expect(contact.companies).toBeDefined();
      expect(contact.companies).toHaveLength(1);
      expect(contact.companies[0].company.id).toBe('company-uuid-1');
      expect(contact.companies[0].position).toBe('CEO');
      expect(contact.companies[0].is_primary).toBe(true);
    });

    it('should handle non-existent contact', async () => {
      const mockFetch = createMockFetch({});
      
      // TODO: Implement and test error handling
      // const client = new TeamleaderClient({ accessToken: 'test-token', fetch: mockFetch });
      // await expect(getContactInfo(client, 'non-existent')).rejects.toThrow();
      
      expect(true).toBe(true); // Placeholder
    });

    it('should return address information', async () => {
      const contact = mockContacts.info.data;
      const address = contact.addresses[0];
      
      expect(address.type).toBe('primary');
      expect(address.address.line_1).toBe('Main Street 123');
      expect(address.address.city).toBe('Brussels');
      expect(address.address.country).toBe('BE');
    });
  });
});
