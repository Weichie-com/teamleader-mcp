# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-31

### Added

#### CRM Module
- **Companies** - Full CRUD operations
  - `teamleader_companies_list` - List companies with filters (name, VAT, tags, status)
  - `teamleader_company_info` - Get company details by ID
  - `teamleader_company_create` - Create a new company
  - `teamleader_company_update` - Update an existing company

- **Contacts** - List and read operations
  - `teamleader_contacts_list` - List contacts with filters
  - `teamleader_contact_info` - Get contact details by ID

#### Deals Module
- **Deals** - Complete pipeline management
  - `teamleader_deals_list` - List deals with filters (status, customer, phase)
  - `teamleader_deal_info` - Get deal details by ID
  - `teamleader_deal_create` - Create a new deal
  - `teamleader_deal_update` - Update an existing deal
  - `teamleader_deal_move` - Move deal to a different phase
  - `teamleader_deal_win` - Mark deal as won
  - `teamleader_deal_lose` - Mark deal as lost with optional reason

#### Invoicing Module
- **Invoices** - Complete invoice lifecycle
  - `teamleader_invoices_list` - List invoices with filters
  - `teamleader_invoice_info` - Get invoice details by ID
  - `teamleader_invoice_draft` - Create a draft invoice
  - `teamleader_invoice_send` - Send invoice via email
  - `teamleader_invoice_book` - Book (finalize) a draft invoice
  - `teamleader_invoice_delete` - Delete an invoice
  - `teamleader_invoice_register_payment` - Register a payment

- **Quotations** - Complete quotation management
  - `teamleader_quotations_list` - List quotations
  - `teamleader_quotation_info` - Get quotation details
  - `teamleader_quotation_create` - Create a new quotation
  - `teamleader_quotation_send` - Send quotation via email
  - `teamleader_quotation_accept` - Mark quotation as accepted
  - `teamleader_quotation_delete` - Delete a quotation
  - `teamleader_quotation_download` - Get PDF download link

#### Products Module
- **Products** - Product catalog management
  - `teamleader_products_list` - List products with filters
  - `teamleader_product_info` - Get product details
  - `teamleader_product_create` - Create a new product
  - `teamleader_product_update` - Update a product

#### Time Tracking Module
- **Time Tracking** - Track billable and non-billable time
  - `teamleader_timetracking_list` - List time entries
  - `teamleader_timetracking_info` - Get time entry details
  - `teamleader_timetracking_add` - Add a time entry
  - `teamleader_timetracking_update` - Update a time entry
  - `teamleader_timetracking_delete` - Delete a time entry

#### Calendar Module
- **Calendar Events** - Event management
  - `teamleader_events_list` - List calendar events
  - `teamleader_event_info` - Get event details
  - `teamleader_event_create` - Create a new event

#### Email Module
- **Email Tracking** - Log emails to CRM entities
  - `teamleader_email_track` - Log an email to an entity
  - `teamleader_emails_list` - List tracked emails

### Technical
- Full TypeScript implementation with strict typing
- Zod schemas for input validation
- 259 unit tests with 100% pass rate
- MCP SDK integration
- OAuth 2.0 authentication support

## [0.1.0] - 2026-01-30

### Added
- Initial project setup
- Basic calendar, contacts, and email tracking tools
- Teamleader API client with authentication
- Test infrastructure with Vitest
