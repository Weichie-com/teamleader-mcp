/**
 * Mock responses for Teamleader Focus API
 * Based on official API documentation: https://developer.teamleader.eu/
 */

// ============================================================================
// CONTACTS MOCKS - Updated to match official API structure
// ============================================================================

export const mockContacts = {
  list: {
    data: [
      {
        id: 'contact-uuid-1',
        first_name: 'John',
        last_name: 'Doe',
        status: 'active',
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
        primary_address: {
          line_1: 'Main Street 123',
          postal_code: '1000',
          city: 'Brussels',
          country: 'BE',
        },
        gender: 'male',
        birthdate: '1985-06-15',
        iban: 'BE12123412341234',
        bic: 'BICBANK',
        national_identification_number: '86792345-L',
        language: 'nl',
        payment_term: {
          type: 'cash',
        },
        invoicing_preferences: {
          electronic_invoicing_address: null,
        },
        tags: ['vip', 'partner'],
        added_at: '2024-01-15T10:30:00+01:00',
        updated_at: '2026-01-20T14:00:00+01:00',
        web_url: 'https://focus.teamleader.eu/contact_detail.php?id=contact-uuid-1',
      },
      {
        id: 'contact-uuid-2',
        first_name: 'Jane',
        last_name: 'Smith',
        status: 'active',
        salutation: 'Ms',
        emails: [
          {
            type: 'primary',
            email: 'jane.smith@example.com',
          },
        ],
        telephones: [],
        website: null,
        primary_address: null,
        gender: 'female',
        birthdate: null,
        iban: null,
        bic: null,
        national_identification_number: null,
        language: 'en',
        payment_term: null,
        invoicing_preferences: {
          electronic_invoicing_address: null,
        },
        tags: [],
        added_at: '2025-03-10T09:00:00+01:00',
        updated_at: '2026-01-25T11:30:00+01:00',
        web_url: 'https://focus.teamleader.eu/contact_detail.php?id=contact-uuid-2',
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
      status: 'active',
      salutation: 'Mr',
      vat_number: 'BE0899623034',
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
      iban: 'BE12123412341234',
      bic: 'BICBANK',
      national_identification_number: '00051730-A',
      companies: [
        {
          position: 'CEO',
          secondary_position: 'Technical lead',
          division: 'Engineering',
          decision_maker: true,
          company: {
            type: 'company',
            id: 'company-uuid-1',
          },
          is_primary: true,
        },
      ],
      language: 'en',
      payment_term: {
        type: 'cash',
      },
      invoicing_preferences: {
        electronic_invoicing_address: null,
      },
      remarks: 'First contact at expo',
      tags: ['vip', 'partner'],
      custom_fields: [],
      marketing_mails_consent: false,
      added_at: '2024-01-15T10:30:00+01:00',
      updated_at: '2026-01-20T14:00:00+01:00',
      web_url: 'https://focus.teamleader.eu/contact_detail.php?id=contact-uuid-1',
    },
  },
};

// ============================================================================
// EVENTS/CALENDAR MOCKS - Updated to match official API structure
// ============================================================================

export const mockEvents = {
  list: {
    data: [
      {
        id: 'event-uuid-1',
        creator: {
          type: 'user',
          id: 'user-uuid-1',
        },
        task: {
          type: 'task',
          id: 'task-uuid-1',
        },
        activity_type: {
          type: 'activityType',
          id: 'activity-type-uuid-1',
        },
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
      },
      {
        id: 'event-uuid-2',
        creator: {
          type: 'user',
          id: 'user-uuid-1',
        },
        task: null,
        activity_type: {
          type: 'activityType',
          id: 'activity-type-uuid-2',
        },
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
      creator: {
        type: 'user',
        id: 'user-uuid-1',
      },
      task: {
        type: 'task',
        id: 'task-uuid-1',
      },
      activity_type: {
        type: 'activityType',
        id: 'activity-type-uuid-1',
      },
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
    },
  },

  create: {
    type: 'event',
    id: 'event-uuid-new',
  },
};

// ============================================================================
// USERS MOCKS
// ============================================================================

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
      email_verification_status: 'confirmed',
      telephones: [],
      language: 'nl-BE',
      function: 'Developer',
      time_zone: 'Europe/Brussels',
      preferences: {
        invoiceable: true,
        historic_time_tracking_limit: null,
        whitelabeling: true,
      },
    },
  },

  list: {
    data: [
      {
        id: 'user-uuid-1',
        account: {
          type: 'account',
          id: 'account-uuid-1',
        },
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        telephones: [],
        language: 'nl',
        function: 'Developer',
        status: 'active',
        teams: [
          {
            type: 'team',
            id: 'team-uuid-1',
          },
        ],
      },
    ],
    meta: {
      page: {
        size: 20,
        number: 1,
      },
      matches: 1,
    },
  },
};

// ============================================================================
// INVOICES MOCKS - Based on official API structure
// ============================================================================

export const mockInvoices = {
  list: {
    data: [
      {
        id: 'invoice-uuid-1',
        department: {
          type: 'department',
          id: 'department-uuid-1',
        },
        invoice_number: '2026 / 1',
        invoice_date: '2026-01-15',
        status: 'outstanding',
        due_on: '2026-02-15',
        paid: false,
        paid_at: null,
        sent: true,
        purchase_order_number: '000023',
        payment_reference: '+++084/2613/66074+++',
        invoicee: {
          name: 'Acme Corporation',
          vat_number: 'BE0899623035',
          customer: {
            type: 'company',
            id: 'company-uuid-1',
          },
          for_attention_of: {
            name: 'John Doe',
            contact: {
              type: 'contact',
              id: 'contact-uuid-1',
            },
          },
        },
        total: {
          tax_exclusive: {
            amount: 1000.00,
            currency: 'EUR',
          },
          tax_inclusive: {
            amount: 1210.00,
            currency: 'EUR',
          },
          payable: {
            amount: 1210.00,
            currency: 'EUR',
          },
          taxes: [
            {
              rate: 0.21,
              taxable: {
                amount: 1000.00,
                currency: 'EUR',
              },
              tax: {
                amount: 210.00,
                currency: 'EUR',
              },
            },
          ],
          due: {
            amount: 1210.00,
            currency: 'EUR',
          },
        },
        currency_exchange_rate: {
          from: 'EUR',
          to: 'EUR',
          rate: 1,
        },
        created_at: '2026-01-15T10:00:00+01:00',
        updated_at: '2026-01-15T10:30:00+01:00',
        web_url: 'https://focus.teamleader.eu/invoice_detail.php?id=invoice-uuid-1',
        file: {
          type: 'file',
          id: 'file-uuid-1',
        },
        deal: {
          type: 'deal',
          id: 'deal-uuid-1',
        },
        project: null,
      },
      {
        id: 'invoice-uuid-2',
        department: {
          type: 'department',
          id: 'department-uuid-1',
        },
        invoice_number: '2026 / 2',
        invoice_date: '2026-01-20',
        status: 'matched',
        due_on: '2026-02-20',
        paid: true,
        paid_at: '2026-01-25T14:00:00+01:00',
        sent: true,
        purchase_order_number: null,
        payment_reference: '+++084/2613/66075+++',
        invoicee: {
          name: 'John Doe',
          vat_number: null,
          customer: {
            type: 'contact',
            id: 'contact-uuid-1',
          },
          for_attention_of: null,
        },
        total: {
          tax_exclusive: {
            amount: 500.00,
            currency: 'EUR',
          },
          tax_inclusive: {
            amount: 605.00,
            currency: 'EUR',
          },
          payable: {
            amount: 605.00,
            currency: 'EUR',
          },
          taxes: [
            {
              rate: 0.21,
              taxable: {
                amount: 500.00,
                currency: 'EUR',
              },
              tax: {
                amount: 105.00,
                currency: 'EUR',
              },
            },
          ],
          due: {
            amount: 0.00,
            currency: 'EUR',
          },
        },
        currency_exchange_rate: {
          from: 'EUR',
          to: 'EUR',
          rate: 1,
        },
        created_at: '2026-01-20T09:00:00+01:00',
        updated_at: '2026-01-25T14:00:00+01:00',
        web_url: 'https://focus.teamleader.eu/invoice_detail.php?id=invoice-uuid-2',
        file: null,
        deal: null,
        project: null,
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
      id: 'invoice-uuid-1',
      department: {
        type: 'department',
        id: 'department-uuid-1',
      },
      invoice_number: '2026 / 1',
      invoice_date: '2026-01-15',
      status: 'outstanding',
      due_on: '2026-02-15',
      paid: false,
      paid_at: null,
      sent: true,
      purchase_order_number: '000023',
      invoicee: {
        name: 'Acme Corporation',
        vat_number: 'BE0899623035',
        customer: {
          type: 'company',
          id: 'company-uuid-1',
        },
        for_attention_of: {
          name: 'John Doe',
          contact: {
            type: 'contact',
            id: 'contact-uuid-1',
          },
        },
        email: 'invoices@acme.com',
        national_identification_number: '123',
      },
      discounts: [],
      grouped_lines: [
        {
          section: {
            title: 'Development Services',
          },
          line_items: [
            {
              product: {
                type: 'product',
                id: 'product-uuid-1',
              },
              product_category: null,
              quantity: 10,
              description: 'Web Development Hours',
              extended_description: 'Frontend and backend development work',
              unit: {
                type: 'unitOfMeasure',
                id: 'unit-uuid-hours',
              },
              unit_price: {
                amount: 100.00,
                tax: 'excluding',
              },
              tax: {
                type: 'taxRate',
                id: 'tax-rate-uuid-21',
              },
              discount: null,
              total: {
                tax_exclusive: {
                  amount: 1000.00,
                  currency: 'EUR',
                },
                tax_exclusive_before_discount: {
                  amount: 1000.00,
                  currency: 'EUR',
                },
                tax_inclusive: {
                  amount: 1210.00,
                  currency: 'EUR',
                },
                tax_inclusive_before_discount: {
                  amount: 1210.00,
                  currency: 'EUR',
                },
              },
              withheld_tax: null,
            },
          ],
        },
      ],
      total: {
        tax_exclusive: {
          amount: 1000.00,
          currency: 'EUR',
        },
        tax_exclusive_before_discount: {
          amount: 1000.00,
          currency: 'EUR',
        },
        tax_inclusive: {
          amount: 1210.00,
          currency: 'EUR',
        },
        tax_inclusive_before_discount: {
          amount: 1210.00,
          currency: 'EUR',
        },
        taxes: [
          {
            rate: 0.21,
            taxable: {
              amount: 1000.00,
              currency: 'EUR',
            },
            tax: {
              amount: 210.00,
              currency: 'EUR',
            },
          },
        ],
        withheld_taxes: [],
        payable: {
          amount: 1210.00,
          currency: 'EUR',
        },
        due: {
          amount: 1210.00,
          currency: 'EUR',
        },
      },
      payment_term: {
        type: 'cash',
      },
      payments: [],
      payment_reference: '+++084/2613/66074+++',
      note: 'Thank you for your business',
      currency: 'EUR',
      currency_exchange_rate: {
        from: 'EUR',
        to: 'EUR',
        rate: 1,
      },
      expected_payment_method: null,
      file: {
        type: 'file',
        id: 'file-uuid-1',
      },
      deal: {
        type: 'deal',
        id: 'deal-uuid-1',
      },
      project: null,
      on_hold_since: null,
      custom_fields: [],
      created_at: '2026-01-15T10:00:00+01:00',
      updated_at: '2026-01-15T10:30:00+01:00',
      document_template: {
        type: 'documentTemplate',
        id: 'template-uuid-1',
      },
    },
  },

  draft: {
    type: 'invoice',
    id: 'invoice-uuid-new',
  },
};

// ============================================================================
// QUOTATIONS MOCKS - Based on official API structure
// ============================================================================

export const mockQuotations = {
  list: {
    data: [
      {
        id: 'quotation-uuid-1',
        deal: {
          type: 'deal',
          id: 'deal-uuid-1',
        },
        currency_exchange_rate: {
          from: 'EUR',
          to: 'EUR',
          rate: 1,
        },
        total: {
          tax_exclusive: {
            amount: 5000.00,
            currency: 'EUR',
          },
          tax_inclusive: {
            amount: 6050.00,
            currency: 'EUR',
          },
          taxes: [
            {
              rate: 0.21,
              taxable: {
                amount: 5000.00,
                currency: 'EUR',
              },
              tax: {
                amount: 1050.00,
                currency: 'EUR',
              },
            },
          ],
          purchase_price: null,
        },
        created_at: '2026-01-10T09:00:00+01:00',
        updated_at: '2026-01-10T10:30:00+01:00',
        status: 'open',
        name: 'Website Development Proposal',
      },
      {
        id: 'quotation-uuid-2',
        deal: {
          type: 'deal',
          id: 'deal-uuid-2',
        },
        currency_exchange_rate: {
          from: 'EUR',
          to: 'EUR',
          rate: 1,
        },
        total: {
          tax_exclusive: {
            amount: 2500.00,
            currency: 'EUR',
          },
          tax_inclusive: {
            amount: 3025.00,
            currency: 'EUR',
          },
          taxes: [
            {
              rate: 0.21,
              taxable: {
                amount: 2500.00,
                currency: 'EUR',
              },
              tax: {
                amount: 525.00,
                currency: 'EUR',
              },
            },
          ],
          purchase_price: null,
        },
        created_at: '2026-01-05T11:00:00+01:00',
        updated_at: '2026-01-08T14:00:00+01:00',
        status: 'accepted',
        name: 'Maintenance Contract',
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
      id: 'quotation-uuid-1',
      deal: {
        type: 'deal',
        id: 'deal-uuid-1',
      },
      grouped_lines: [
        {
          section: {
            title: 'Development',
          },
          line_items: [
            {
              product: null,
              quantity: 40,
              description: 'Frontend Development',
              extended_description: 'React-based frontend implementation',
              unit: null,
              unit_price: {
                amount: 100.00,
                tax: 'excluding',
              },
              tax: {
                type: 'taxRate',
                id: 'tax-rate-uuid-21',
              },
              discount: null,
              purchase_price: null,
              total: {
                tax_exclusive: {
                  amount: 4000.00,
                  currency: 'EUR',
                },
                tax_exclusive_before_discount: {
                  amount: 4000.00,
                  currency: 'EUR',
                },
                tax_inclusive: {
                  amount: 4840.00,
                  currency: 'EUR',
                },
                tax_inclusive_before_discount: {
                  amount: 4840.00,
                  currency: 'EUR',
                },
              },
              periodicity: null,
            },
            {
              product: null,
              quantity: 10,
              description: 'Backend Development',
              extended_description: 'Node.js API development',
              unit: null,
              unit_price: {
                amount: 100.00,
                tax: 'excluding',
              },
              tax: {
                type: 'taxRate',
                id: 'tax-rate-uuid-21',
              },
              discount: null,
              purchase_price: null,
              total: {
                tax_exclusive: {
                  amount: 1000.00,
                  currency: 'EUR',
                },
                tax_exclusive_before_discount: {
                  amount: 1000.00,
                  currency: 'EUR',
                },
                tax_inclusive: {
                  amount: 1210.00,
                  currency: 'EUR',
                },
                tax_inclusive_before_discount: {
                  amount: 1210.00,
                  currency: 'EUR',
                },
              },
              periodicity: null,
            },
          ],
        },
      ],
      currency: 'EUR',
      currency_exchange_rate: {
        from: 'EUR',
        to: 'EUR',
        rate: 1,
      },
      total: {
        tax_exclusive: {
          amount: 5000.00,
          currency: 'EUR',
        },
        tax_inclusive: {
          amount: 6050.00,
          currency: 'EUR',
        },
        taxes: [
          {
            rate: 0.21,
            taxable: {
              amount: 5000.00,
              currency: 'EUR',
            },
            tax: {
              amount: 1050.00,
              currency: 'EUR',
            },
          },
        ],
        purchase_price: null,
      },
      discounts: [],
      created_at: '2026-01-10T09:00:00+01:00',
      updated_at: '2026-01-10T10:30:00+01:00',
      status: 'open',
      name: 'Website Development Proposal',
      document_template: {
        type: 'documentTemplate',
        id: 'template-uuid-1',
      },
    },
  },

  create: {
    type: 'quotation',
    id: 'quotation-uuid-new',
  },
};

// ============================================================================
// COMPANIES MOCKS - Based on official API structure
// ============================================================================

export const mockCompanies = {
  list: {
    data: [
      {
        id: 'company-uuid-1',
        name: 'Acme Corporation',
        status: 'active',
        business_type: {
          type: 'businessType',
          id: 'business-type-uuid-1',
        },
        vat_number: 'BE0899623035',
        national_identification_number: '63326426',
        emails: [
          {
            type: 'primary',
            email: 'info@acme.com',
          },
          {
            type: 'invoicing',
            email: 'invoices@acme.com',
          },
        ],
        telephones: [
          {
            type: 'phone',
            number: '+32 2 123 45 67',
          },
        ],
        website: 'https://acme.com',
        primary_address: {
          line_1: 'Main Street 100',
          postal_code: '1000',
          city: 'Brussels',
          country: 'BE',
        },
        iban: 'BE12123412341234',
        bic: 'BICBANK',
        language: 'nl',
        preferred_currency: 'EUR',
        payment_term: {
          type: 'after_invoice_date',
          days: 30,
        },
        invoicing_preferences: {
          electronic_invoicing_address: null,
        },
        responsible_user: {
          type: 'user',
          id: 'user-uuid-1',
        },
        added_at: '2024-01-01T10:00:00+01:00',
        updated_at: '2026-01-20T14:00:00+01:00',
        web_url: 'https://focus.teamleader.eu/company_detail.php?id=company-uuid-1',
        tags: ['partner', 'enterprise'],
      },
      {
        id: 'company-uuid-2',
        name: 'Small Business Inc',
        status: 'active',
        business_type: null,
        vat_number: null,
        national_identification_number: null,
        emails: [
          {
            type: 'primary',
            email: 'contact@smallbiz.com',
          },
        ],
        telephones: [],
        website: null,
        primary_address: null,
        iban: null,
        bic: null,
        language: 'en',
        preferred_currency: null,
        payment_term: null,
        invoicing_preferences: {
          electronic_invoicing_address: null,
        },
        responsible_user: null,
        added_at: '2025-06-01T09:00:00+02:00',
        updated_at: '2026-01-25T11:30:00+01:00',
        web_url: 'https://focus.teamleader.eu/company_detail.php?id=company-uuid-2',
        tags: [],
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
      id: 'company-uuid-1',
      name: 'Acme Corporation',
      status: 'active',
      business_type: {
        type: 'businessType',
        id: 'business-type-uuid-1',
      },
      vat_number: 'BE0899623035',
      national_identification_number: '63326426',
      emails: [
        {
          type: 'primary',
          email: 'info@acme.com',
        },
      ],
      telephones: [
        {
          type: 'phone',
          number: '+32 2 123 45 67',
        },
      ],
      website: 'https://acme.com',
      addresses: [
        {
          type: 'primary',
          address: {
            line_1: 'Main Street 100',
            postal_code: '1000',
            city: 'Brussels',
            country: 'BE',
          },
        },
        {
          type: 'invoicing',
          address: {
            line_1: 'Invoice Street 50',
            postal_code: '1000',
            city: 'Brussels',
            country: 'BE',
          },
        },
      ],
      iban: 'BE12123412341234',
      bic: 'BICBANK',
      language: 'nl',
      preferred_currency: 'EUR',
      payment_term: {
        type: 'after_invoice_date',
        days: 30,
      },
      invoicing_preferences: {
        electronic_invoicing_address: null,
      },
      responsible_user: {
        type: 'user',
        id: 'user-uuid-1',
      },
      remarks: 'Important partner company',
      added_at: '2024-01-01T10:00:00+01:00',
      updated_at: '2026-01-20T14:00:00+01:00',
      web_url: 'https://focus.teamleader.eu/company_detail.php?id=company-uuid-1',
      tags: ['partner', 'enterprise'],
      custom_fields: [],
      marketing_mails_consent: true,
    },
  },

  add: {
    type: 'company',
    id: 'company-uuid-new',
  },
};

// ============================================================================
// DEALS MOCKS - Based on official API structure
// ============================================================================

export const mockDeals = {
  list: {
    data: [
      {
        id: 'deal-uuid-1',
        title: 'Website Redesign Project',
        summary: 'Complete overhaul of the corporate website',
        reference: '2026/1',
        status: 'open',
        lead: {
          customer: {
            type: 'company',
            id: 'company-uuid-1',
          },
          contact_person: {
            type: 'contact',
            id: 'contact-uuid-1',
          },
        },
        department: {
          type: 'department',
          id: 'department-uuid-1',
        },
        estimated_value: {
          amount: 15000.00,
          currency: 'EUR',
        },
        estimated_closing_date: '2026-03-15',
        estimated_probability: 0.75,
        weighted_value: {
          amount: 11250.00,
          currency: 'EUR',
        },
        purchase_order_number: 'PO-2026-001',
        current_phase: {
          type: 'dealPhase',
          id: 'phase-uuid-2',
        },
        responsible_user: {
          type: 'user',
          id: 'user-uuid-1',
        },
        closed_at: null,
        source: {
          type: 'dealSource',
          id: 'source-uuid-1',
        },
        lost_reason: null,
        created_at: '2026-01-10T09:00:00+01:00',
        updated_at: '2026-01-25T14:30:00+01:00',
        web_url: 'https://focus.teamleader.eu/sale_detail.php?id=deal-uuid-1',
        currency_exchange_rate: {
          from: 'EUR',
          to: 'EUR',
          rate: 1,
        },
        pipeline: {
          type: 'dealPipeline',
          id: 'pipeline-uuid-1',
        },
      },
      {
        id: 'deal-uuid-2',
        title: 'Mobile App Development',
        summary: null,
        reference: '2026/2',
        status: 'won',
        lead: {
          customer: {
            type: 'contact',
            id: 'contact-uuid-2',
          },
          contact_person: null,
        },
        department: {
          type: 'department',
          id: 'department-uuid-1',
        },
        estimated_value: {
          amount: 25000.00,
          currency: 'EUR',
        },
        estimated_closing_date: '2026-02-01',
        estimated_probability: 1.0,
        weighted_value: {
          amount: 25000.00,
          currency: 'EUR',
        },
        purchase_order_number: null,
        current_phase: {
          type: 'dealPhase',
          id: 'phase-uuid-4',
        },
        responsible_user: {
          type: 'user',
          id: 'user-uuid-1',
        },
        closed_at: '2026-01-28T16:00:00+01:00',
        source: null,
        lost_reason: null,
        created_at: '2025-12-01T10:00:00+01:00',
        updated_at: '2026-01-28T16:00:00+01:00',
        web_url: 'https://focus.teamleader.eu/sale_detail.php?id=deal-uuid-2',
        currency_exchange_rate: {
          from: 'EUR',
          to: 'EUR',
          rate: 1,
        },
        pipeline: {
          type: 'dealPipeline',
          id: 'pipeline-uuid-1',
        },
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
      id: 'deal-uuid-1',
      title: 'Website Redesign Project',
      summary: 'Complete overhaul of the corporate website',
      reference: '2026/1',
      status: 'open',
      lead: {
        customer: {
          type: 'company',
          id: 'company-uuid-1',
        },
        contact_person: {
          type: 'contact',
          id: 'contact-uuid-1',
        },
      },
      department: {
        type: 'department',
        id: 'department-uuid-1',
      },
      estimated_value: {
        amount: 15000.00,
        currency: 'EUR',
      },
      estimated_closing_date: '2026-03-15',
      estimated_probability: 0.75,
      weighted_value: {
        amount: 11250.00,
        currency: 'EUR',
      },
      purchase_order_number: 'PO-2026-001',
      current_phase: {
        type: 'dealPhase',
        id: 'phase-uuid-2',
      },
      responsible_user: {
        type: 'user',
        id: 'user-uuid-1',
      },
      closed_at: null,
      source: {
        type: 'dealSource',
        id: 'source-uuid-1',
      },
      phase_history: [
        {
          phase: {
            type: 'dealPhase',
            id: 'phase-uuid-1',
          },
          started_at: '2026-01-10T09:00:00+01:00',
          started_by: {
            type: 'user',
            id: 'user-uuid-1',
          },
        },
        {
          phase: {
            type: 'dealPhase',
            id: 'phase-uuid-2',
          },
          started_at: '2026-01-15T11:00:00+01:00',
          started_by: {
            type: 'user',
            id: 'user-uuid-1',
          },
        },
      ],
      quotations: [
        {
          id: 'quotation-uuid-1',
          type: 'quotation',
        },
      ],
      lost_reason: null,
      created_at: '2026-01-10T09:00:00+01:00',
      updated_at: '2026-01-25T14:30:00+01:00',
      web_url: 'https://focus.teamleader.eu/sale_detail.php?id=deal-uuid-1',
      custom_fields: [],
      currency_exchange_rate: {
        from: 'EUR',
        to: 'EUR',
        rate: 1,
      },
      pipeline: {
        type: 'dealPipeline',
        id: 'pipeline-uuid-1',
      },
    },
  },

  create: {
    type: 'deal',
    id: 'deal-uuid-new',
  },
};

export const mockDealPhases = {
  list: {
    data: [
      {
        id: 'phase-uuid-1',
        name: 'New',
        actions: ['create_task'],
        requires_attention_after: {
          amount: 3,
          unit: 'days',
        },
        probability: 0.1,
      },
      {
        id: 'phase-uuid-2',
        name: 'Qualifying',
        actions: ['create_call'],
        requires_attention_after: {
          amount: 7,
          unit: 'days',
        },
        probability: 0.25,
      },
      {
        id: 'phase-uuid-3',
        name: 'Proposal',
        actions: ['create_meeting'],
        requires_attention_after: {
          amount: 14,
          unit: 'days',
        },
        probability: 0.5,
      },
      {
        id: 'phase-uuid-4',
        name: 'Negotiation',
        actions: [],
        requires_attention_after: {
          amount: 7,
          unit: 'days',
        },
        probability: 0.75,
      },
    ],
  },
};

export const mockLostReasons = {
  list: {
    data: [
      {
        id: 'lost-reason-uuid-1',
        name: 'Price too high',
      },
      {
        id: 'lost-reason-uuid-2',
        name: 'Chose competitor',
      },
      {
        id: 'lost-reason-uuid-3',
        name: 'Project cancelled',
      },
    ],
  },
};

// ============================================================================
// PRODUCTS MOCKS - Based on official API structure
// ============================================================================

export const mockProducts = {
  list: {
    data: [
      {
        id: 'product-uuid-1',
        name: 'Web Development Hour',
        description: 'One hour of web development work',
        code: 'WEB-DEV-HOUR',
        purchase_price: null,
        selling_price: {
          amount: 100.00,
          currency: 'EUR',
        },
        unit: {
          type: 'unitOfMeasure',
          id: 'unit-uuid-hours',
        },
        added_at: '2024-01-01T10:00:00+01:00',
        updated_at: '2026-01-15T09:00:00+01:00',
      },
      {
        id: 'product-uuid-2',
        name: 'Hosting Package - Basic',
        description: 'Monthly hosting for small websites',
        code: 'HOST-BASIC',
        purchase_price: {
          amount: 5.00,
          currency: 'EUR',
        },
        selling_price: {
          amount: 25.00,
          currency: 'EUR',
        },
        unit: {
          type: 'unitOfMeasure',
          id: 'unit-uuid-month',
        },
        added_at: '2024-06-01T10:00:00+02:00',
        updated_at: '2026-01-10T11:00:00+01:00',
      },
      {
        id: 'product-uuid-3',
        name: 'Domain Registration',
        description: 'Annual domain name registration',
        code: 'DOMAIN-REG',
        purchase_price: {
          amount: 8.00,
          currency: 'EUR',
        },
        selling_price: {
          amount: 15.00,
          currency: 'EUR',
        },
        unit: null,
        added_at: '2025-01-01T10:00:00+01:00',
        updated_at: '2026-01-01T10:00:00+01:00',
      },
    ],
    meta: {
      page: {
        size: 20,
        number: 1,
      },
      matches: 3,
    },
  },

  info: {
    data: {
      id: 'product-uuid-1',
      name: 'Web Development Hour',
      description: 'One hour of web development work',
      code: 'WEB-DEV-HOUR',
      purchase_price: null,
      selling_price: {
        amount: 100.00,
        currency: 'EUR',
      },
      department: {
        type: 'department',
        id: 'department-uuid-1',
      },
      product_category: {
        type: 'productCategory',
        id: 'category-uuid-services',
      },
      tax: {
        type: 'taxRate',
        id: 'tax-rate-uuid-21',
      },
      unit: {
        type: 'unitOfMeasure',
        id: 'unit-uuid-hours',
      },
      stock: null,
      configuration: {
        stock_management_enabled: false,
      },
      custom_fields: [],
      price_list_prices: [],
      added_at: '2024-01-01T10:00:00+01:00',
      updated_at: '2026-01-15T09:00:00+01:00',
    },
  },

  add: {
    type: 'product',
    id: 'product-uuid-new',
  },
};

// ============================================================================
// TIME TRACKING MOCKS - Based on official API structure
// ============================================================================

export const mockTimeTracking = {
  list: {
    data: [
      {
        id: 'timetracking-uuid-1',
        user: {
          type: 'user',
          id: 'user-uuid-1',
        },
        work_type: {
          type: 'workType',
          id: 'worktype-uuid-1',
        },
        started_on: '2026-01-30',
        started_at: '2026-01-30T09:00:00+01:00',
        ended_at: '2026-01-30T12:00:00+01:00',
        duration: 10800, // 3 hours in seconds
        description: 'Frontend development for homepage',
        subject: {
          type: 'milestone',
          id: 'milestone-uuid-1',
        },
        invoiceable: true,
        billing_info: {
          billed: false,
          invoice: null,
        },
        hourly_rate: {
          amount: 100.00,
          currency: 'EUR',
        },
      },
      {
        id: 'timetracking-uuid-2',
        user: {
          type: 'user',
          id: 'user-uuid-1',
        },
        work_type: {
          type: 'workType',
          id: 'worktype-uuid-2',
        },
        started_on: '2026-01-30',
        started_at: '2026-01-30T13:00:00+01:00',
        ended_at: '2026-01-30T15:30:00+01:00',
        duration: 9000, // 2.5 hours in seconds
        description: 'Bug fixing and testing',
        subject: {
          type: 'ticket',
          id: 'ticket-uuid-1',
        },
        invoiceable: true,
        billing_info: {
          billed: true,
          invoice: {
            type: 'invoice',
            id: 'invoice-uuid-1',
          },
        },
        hourly_rate: {
          amount: 85.00,
          currency: 'EUR',
        },
      },
      {
        id: 'timetracking-uuid-3',
        user: {
          type: 'user',
          id: 'user-uuid-1',
        },
        work_type: null,
        started_on: '2026-01-29',
        started_at: '2026-01-29T14:00:00+01:00',
        ended_at: '2026-01-29T15:00:00+01:00',
        duration: 3600, // 1 hour in seconds
        description: 'Internal meeting',
        subject: null,
        invoiceable: false,
        billing_info: null,
        hourly_rate: null,
      },
    ],
    meta: {
      page: {
        size: 20,
        number: 1,
      },
      matches: 3,
    },
  },

  info: {
    data: {
      id: 'timetracking-uuid-1',
      user: {
        type: 'user',
        id: 'user-uuid-1',
      },
      work_type: {
        type: 'workType',
        id: 'worktype-uuid-1',
      },
      started_on: '2026-01-30',
      started_at: '2026-01-30T09:00:00+01:00',
      ended_at: '2026-01-30T12:00:00+01:00',
      duration: 10800,
      description: 'Frontend development for homepage',
      subject: {
        type: 'milestone',
        id: 'milestone-uuid-1',
      },
      invoiceable: true,
      locked: false,
      updatable: true,
      billing_info: {
        billed: false,
        invoice: null,
      },
      hourly_rate: {
        amount: 100.00,
        currency: 'EUR',
      },
    },
  },

  add: {
    type: 'timeTracking',
    id: 'timetracking-uuid-new',
  },
};

export const mockTimers = {
  current: {
    data: {
      id: 'timer-uuid-1',
      user: {
        type: 'user',
        id: 'user-uuid-1',
      },
      work_type: {
        type: 'workType',
        id: 'worktype-uuid-1',
      },
      started_at: '2026-01-31T09:00:00+01:00',
      description: 'Working on feature X',
      subject: {
        type: 'milestone',
        id: 'milestone-uuid-1',
      },
      invoiceable: true,
    },
  },

  start: {
    type: 'timer',
    id: 'timer-uuid-new',
  },
};

// ============================================================================
// DEPARTMENTS MOCKS
// ============================================================================

export const mockDepartments = {
  list: {
    data: [
      {
        id: 'department-uuid-1',
        name: 'Main Department',
        vat_number: 'BE0899623035',
        currency: 'EUR',
        emails: [
          {
            type: 'primary',
            email: 'info@company.com',
          },
        ],
        status: 'active',
      },
    ],
    meta: {
      page: {
        size: 20,
        number: 1,
      },
      matches: 1,
    },
  },
};

// ============================================================================
// TAX RATES MOCKS
// ============================================================================

export const mockTaxRates = {
  list: {
    data: [
      {
        id: 'tax-rate-uuid-21',
        description: '21%',
        rate: 0.21,
        department: {
          type: 'department',
          id: 'department-uuid-1',
        },
      },
      {
        id: 'tax-rate-uuid-6',
        description: '6%',
        rate: 0.06,
        department: {
          type: 'department',
          id: 'department-uuid-1',
        },
      },
      {
        id: 'tax-rate-uuid-0',
        description: '0%',
        rate: 0,
        department: {
          type: 'department',
          id: 'department-uuid-1',
        },
      },
    ],
    meta: {
      page: {
        size: 20,
        number: 1,
      },
      matches: 3,
    },
  },
};

// ============================================================================
// HELPER FUNCTION - Create mock fetch for testing
// ============================================================================

export function createMockFetch(responses: Record<string, unknown>) {
  return async (url: string, _options?: RequestInit): Promise<Response> => {
    const endpoint = url.replace('https://api.focus.teamleader.eu/', '');
    
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
