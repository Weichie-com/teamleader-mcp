# Teamleader MCP Server - Roadmap to v1.0.0

## Project Goal
Een production-ready MCP server voor Teamleader Focus API die:
- Alle mock data haalt uit de officiële TL API documentatie
- Volledige test coverage heeft voor alle tools
- Klaar is voor open-source release door Weichie.com

## Data Source
**Alle mock data MOET komen van:**
- https://developer.focus.teamleader.eu/docs/api
- https://raw.githubusercontent.com/teamleadercrm/api/master/apiary.apib

Geen verzonnen data. Alleen echte API response structures.

## v1.0.0 Checklist

### Core Tools
- [x] Calendar (events.list, events.info, events.create)
- [x] Contacts (contacts.list, contacts.info)
- [x] Email (via SMTP fallback)
- [ ] Invoices (invoices.draft, invoices.list, invoices.info, invoices.send)
- [ ] Quotations (quotations.create, quotations.list, quotations.info, quotations.send)

### Nice-to-have Tools (v1.1+)
- [ ] Companies (companies.list, companies.info)
- [ ] Deals (deals.list, deals.info, deals.create)
- [ ] Products (products.list, products.info)
- [ ] Time Tracking (timeTracking.list, timeTracking.add)

### Testing Requirements
- [ ] All mocks verified against official API docs
- [ ] Unit tests for every tool
- [ ] Error handling tests
- [ ] Minimum 80% coverage
- [ ] All tests passing (`npm run test:run`)

### Documentation
- [ ] README with installation instructions
- [ ] OAuth setup guide
- [ ] Tool usage examples
- [ ] .env.example with all required vars

### Release Prep
- [ ] Clean git history
- [ ] LICENSE (MIT)
- [ ] CHANGELOG.md
- [ ] npm package ready
- [ ] GitHub repo (weichie/teamleader-mcp or similar)

## Current Status
- **Phase:** Building core tools + verifying mocks
- **Last updated:** 2026-01-31

## Notes
- OAuth handled by user (test account available)
- Email via SMTP (TL has no direct send endpoint)
- Focus on most-used endpoints first
