# Teamleader MCP Server - Roadmap

## ✅ v1.0.0 - RELEASED (2026-01-31)

### Core Tools - ALL COMPLETE ✅
- [x] Calendar (events.list, events.info, events.create)
- [x] Contacts (contacts.list, contacts.info)
- [x] Email (via SMTP fallback + emailTracking)
- [x] Invoices (draft, list, info, send, book, delete, registerPayment)
- [x] Quotations (create, list, info, update, send, accept, delete, download)

### Extended Tools - ALL COMPLETE ✅
- [x] Companies (list, info, create, update, delete, tag, untag)
- [x] Deals (list, info, create, update, move, win, lose, delete)
- [x] Products (list, info, create, update, delete)
- [x] Time Tracking (list, info, add, update, delete + timer functions)

### Testing - COMPLETE ✅
- [x] All mocks verified against official API docs (apiary.apib)
- [x] Unit tests for every tool
- [x] Error handling tests
- [x] 259 tests passing
- [x] `npm run test:run` ✅ 100% green

### Documentation - COMPLETE ✅
- [x] README with installation instructions
- [x] OAuth setup guide
- [x] Tool usage examples
- [x] .env.example with all required vars
- [x] CHANGELOG.md
- [x] LICENSE (MIT)

---

## v1.1.0 - Planned Features

### New Endpoints
- [ ] Projects (projects-v2.list, projects-v2.info, projects-v2.create)
- [ ] Milestones (milestones.list, milestones.info)
- [ ] Tasks (tasks.list, tasks.info, tasks.create)
- [ ] Tickets (tickets.list, tickets.info)
- [ ] Files (files.list, files.upload, files.download)

### Improvements
- [ ] Automatic token refresh
- [ ] Webhook support
- [ ] Rate limit handling with retry
- [ ] Batch operations

### Tooling
- [ ] GitHub Actions CI/CD
- [ ] npm publish workflow
- [ ] Docker image

---

## v1.2.0 - Advanced Features

### Extended API Coverage
- [ ] Subscriptions
- [ ] Credit Notes
- [ ] Work Orders
- [ ] Custom Fields management
- [ ] Tags management

### Enterprise Features
- [ ] Multi-account support
- [ ] Audit logging
- [ ] Caching layer

---

## Data Source
**All mock data verified against:**
- https://developer.focus.teamleader.eu/docs/api
- https://raw.githubusercontent.com/teamleadercrm/api/master/apiary.apib

---

## Project Info
- **Author:** Weichie.com
- **License:** MIT
- **Repository:** GitHub (to be published)
