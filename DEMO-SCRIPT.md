# Demo Script: Teamleader MCP + Claude Desktop

**Duur:** 5-7 minuten  
**Doel:** Toon hoe natuurlijke taal → Teamleader acties werkt via Claude Desktop

---

## 🎬 Pre-Demo Setup

### Vereisten
- [ ] Claude Desktop open met Teamleader MCP geconfigureerd
- [ ] Teamleader Focus open in browser (voor verificatie)
- [ ] Screen recording software klaar
- [ ] Zorg dat er al wat test-data in Teamleader zit (contacts, companies, deals)

### Audio Tips
- Praat rustig, duidelijk
- Laat Claude even "denken" - dat is juist interessant om te zien
- Toon het proces, niet alleen het resultaat

---

## 🎥 Demo Flow

### Intro (30 seconden)

**Script:**
> "I'll show you how Claude can directly interact with Teamleader Focus using natural language. No coding, no API calls - just conversation."

---

### Scene 1: Contact Lookup (45 seconden)

**Prompt:**
```
Find the contact details for Sarah Johnson
```

**Wat te tonen:**
- Claude zoekt automatisch in Teamleader
- Toont naam, email, telefoon, linked company
- Highlight: "Geen zoekformulier nodig, gewoon vragen"

**Verificatie:** Toon dezelfde contact in Teamleader UI

---

### Scene 2: Company + Deals Overview (1 minuut)

**Prompt:**
```
Show me all open deals for Acme Corporation and their total value
```

**Wat te tonen:**
- Claude vindt het bedrijf
- Haalt alle open deals op
- Berekent totale waarde
- Highlight: "Combinatie van data uit meerdere endpoints in één vraag"

---

### Scene 3: Create a Deal (1.5 minuut)

**Prompt:**
```
Create a new deal for TechStart BV:
- Title: Website Redesign 2026
- Value: €15,000
- Expected close date: end of March
```

**Wat te tonen:**
- Claude vindt/matcht de company
- Vraagt eventueel om bevestiging of missing info
- Maakt de deal aan
- Toont de nieuwe deal ID

**Verificatie:** Refresh Teamleader deals view, toon de nieuwe deal

---

### Scene 4: Invoice Creation (1.5 minuut)

**Prompt:**
```
Draft an invoice for DataFlow Solutions:
- 20 hours of consulting at €125/hour
- 10 hours of development at €95/hour
- Payment term: 30 days
```

**Wat te tonen:**
- Claude zoekt de company
- Maakt grouped line items
- Berekent totaal automatisch
- Draft invoice aangemaakt

**Highlight:** "Complexe invoice structuur via natuurlijke taal"

---

### Scene 5: Calendar + Meeting (45 seconden)

**Prompt:**
```
Schedule a project kickoff meeting with Sarah Johnson next Tuesday at 2pm for 1 hour
```

**Wat te tonen:**
- Claude vindt de contact
- Berekent de juiste datum
- Maakt event met linked contact

---

### Scene 6: Power Move - Multi-step Workflow (1 minuut)

**Prompt:**
```
I just closed the deal with TechStart BV. Mark the Website Redesign deal as won, 
create a draft invoice for the first milestone (€5,000), and schedule a kickoff 
meeting with their primary contact for next Monday at 10am.
```

**Wat te tonen:**
- Claude voert 3+ acties uit in sequence
- Deal → Won
- Invoice → Drafted
- Event → Created
- Alles linked aan dezelfde company/contact

**Highlight:** "This is the real power - complex workflows in one sentence"

---

### Outro (30 seconden)

**Script:**
> "This MCP server exposes 42 tools covering the entire Teamleader API - contacts, companies, deals, invoices, quotations, products, time tracking, and calendar events. 
> 
> It's open source, free to use, and works with any MCP-compatible AI assistant. Try it yourself - link in the description."

---

## 📝 Alternative Prompts (Backups)

Als iets niet werkt, deze zijn makkelijk te demo'en:

### Time Tracking
```
Log 3 hours of work on the TechStart project yesterday afternoon, 
description: "Frontend development and code review"
```

### Quick Contact Search
```
What's the email address for anyone at DataFlow Solutions?
```

### Deal Pipeline Check
```
How many deals do I have in each pipeline phase right now?
```

### Quotation
```
Create a quotation for CloudFirst NV: 
Annual maintenance contract, €3,600
```

---

## ⚠️ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Tool call fails | Check access token validity in Teamleader |
| Company not found | Use exact name or show graceful "not found" handling |
| Date parsing | Be explicit: "next Tuesday March 11th" |
| Slow response | Normal! API calls take time, fill with narration |

---

## 🎯 Key Messages to Convey

1. **Natural Language** - No API knowledge needed
2. **Full Coverage** - 42 tools, all major Teamleader features
3. **Context Aware** - Claude understands relationships (company → contacts → deals)
4. **Workflow Automation** - Multiple actions in one prompt
5. **Open Source** - Free, customizable, community-driven

---

## Post-Demo Checklist

- [ ] Clean up test data created during demo
- [ ] Or keep it and show "real" data in the recording
- [ ] Export recording
- [ ] Add any text overlays/callouts if needed
