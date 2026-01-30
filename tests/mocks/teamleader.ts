/**
 * Mock responses for Teamleader Focus API
 */

export const mockEvents = {
  list: {
    data: [
      {
        id: 'event-uuid-1',
        title: 'Team meeting',
        description: 'Weekly team sync',
        starts_at: '2026-02-01T10:00:00+01:00',
        ends_at: '2026-02-01T11:00:00+01:00',
        location: 'Office',
        attendees: [
          {
            type: 'user',
            id: 'user-uuid-1',
          },
        ],
        links: [
          {
            type: 'contact',
            id: 'contact-uuid-1',
          },
        ],
        creator: {
          type: 'user',
          id: 'user-uuid-1',
        },
        task: null,
        recurrence: null,
      },
      {
        id: 'event-uuid-2',
        title: 'Client call',
        description: 'Discuss project',
        starts_at: '2026-02-01T14:00:00+01:00',
        ends_at: '2026-02-01T15:00:00+01:00',
        location: null,
        attendees: [],
        links: [
          {
            type: 'contact',
            id: 'contact-uuid-2',
          },
        ],
        creator: {
          type: 'user',
          id: 'user-uuid-1',
        },
        task: null,
        recurrence: null,
      },
    ],
    meta: {
      page: {
        size: 20,
        number: 1,
      },
      matches: 2,
    },
  },

  info: {
    data: {
      id: 'event-uuid-1',
      title: 'Team meeting',
      description: 'Weekly team sync',
      starts_at: '2026-02-01T10:00:00+01:00',
      ends_at: '2026-02-01T11:00:00+01:00',
      location: 'Office',
      attendees: [
        {
          type: 'user',
          id: 'user-uuid-1',
        },
      ],
      links: [
        {
          type: 'contact',
          id: 'contact-uuid-1',
        },
      ],
      creator: {
        type: 'user',
        id: 'user-uuid-1',
      },
      task: null,
      recurrence: null,
    },
  },

  create: {
    type: 'event',
    id: 'event-uuid-new',
  },
};

export const mockContacts = {
  list: {
    data: [
      {
        id: 'contact-uuid-1',
        first_name: 'John',
        last_name: 'Doe',
        salutation: 'Mr',
        emails: [
          {
            type: 'primary',
            email: 'john.doe@example.com',
          },
        ],
        telephones: [
          {
            type: 'phone',
            number: '+32 471 12 34 56',
          },
        ],
        website: 'https://johndoe.example.com',
        addresses: [
          {
            type: 'primary',
            address: {
              line_1: 'Main Street 123',
              postal_code: '1000',
              city: 'Brussels',
              country: 'BE',
            },
          },
        ],
        gender: 'male',
        birthdate: '1985-06-15',
        language: 'nl',
        added_at: '2024-01-15T10:30:00+01:00',
        updated_at: '2026-01-20T14:00:00+01:00',
        tags: ['vip', 'partner'],
        status: 'active',
      },
      {
        id: 'contact-uuid-2',
        first_name: 'Jane',
        last_name: 'Smith',
        salutation: 'Ms',
        emails: [
          {
            type: 'primary',
            email: 'jane.smith@example.com',
          },
        ],
        telephones: [],
        website: null,
        addresses: [],
        gender: 'female',
        birthdate: null,
        language: 'en',
        added_at: '2025-03-10T09:00:00+01:00',
        updated_at: '2026-01-25T11:30:00+01:00',
        tags: [],
        status: 'active',
      },
    ],
    meta: {
      page: {
        size: 20,
        number: 1,
      },
      matches: 2,
    },
  },

  info: {
    data: {
      id: 'contact-uuid-1',
      first_name: 'John',
      last_name: 'Doe',
      salutation: 'Mr',
      emails: [
        {
          type: 'primary',
          email: 'john.doe@example.com',
        },
      ],
      telephones: [
        {
          type: 'phone',
          number: '+32 471 12 34 56',
        },
      ],
      website: 'https://johndoe.example.com',
      addresses: [
        {
          type: 'primary',
          address: {
            line_1: 'Main Street 123',
            postal_code: '1000',
            city: 'Brussels',
            country: 'BE',
          },
        },
      ],
      gender: 'male',
      birthdate: '1985-06-15',
      language: 'nl',
      added_at: '2024-01-15T10:30:00+01:00',
      updated_at: '2026-01-20T14:00:00+01:00',
      tags: ['vip', 'partner'],
      status: 'active',
      companies: [
        {
          company: {
            type: 'company',
            id: 'company-uuid-1',
          },
          position: 'CEO',
          is_primary: true,
        },
      ],
    },
  },
};

export const mockUsers = {
  me: {
    data: {
      id: 'user-uuid-1',
      account: {
        type: 'account',
        id: 'account-uuid-1',
      },
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      language: 'nl',
      telephones: [],
      function: 'Developer',
      status: 'active',
    },
  },
};

// Helper to create mock fetch responses
export function createMockFetch(responses: Record<string, unknown>) {
  return async (url: string, options?: RequestInit): Promise<Response> => {
    const endpoint = url.replace('https://api.focus.teamleader.eu/', '');
    
    // Parse the endpoint to get the action
    const response = responses[endpoint];
    
    if (!response) {
      return new Response(
        JSON.stringify({
          errors: [{ title: `Unknown endpoint: ${endpoint}` }],
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': '200',
        'X-RateLimit-Remaining': '199',
      },
    });
  };
}
