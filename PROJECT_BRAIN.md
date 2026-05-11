# PROJECT_BRAIN.md
# Book Manager Dashboard - Source of Truth
# Project: Book Management / Book Manager Dashboard
# Last updated: 2026-05-11 (Session 3)

---

## PROJECT IDENTITY

- Book Title: Tales from the Hood: A Biblical Guide to Growing from Male to Man
- Author: Bishop Roskco A. Motes, PhD
- Manager: Denarius Motes (MotesArt)
- Assistant: Mya (Executive AI, writes on behalf of Denarius)
- Dashboard: motesart-book-manager.netlify.app
- Repo: Motesart27/book-manager
- Purpose: Personal, generational, legacy work. A deposit into the Motes family story.

---

## SYSTEM STACK

Frontend: motesart-book-manager.netlify.app
Backend API: book-manager-production-e2cc.up.railway.app
Airtable Base: MotesArt Book Manager (app4GKdk1AqmiOyKx)
GitHub: Motesart27/book-manager
Deploy: Netlify (frontend), Railway (backend /backend root)

NEVER verify frontend changes on Railway. Netlify only.

---

## LAUNCH DEADLINE

June 15, 2026 - PAW Convention
Units target: 150 hardcover
This deadline is HARD. 35 days remaining as of 2026-05-11.

---

## MANUSCRIPT STATUS - CONFIRMED 2026-05-11

Source: Tales_of_the_Hood_full_book.zip (audited this session)
- PDF: 107 pages, fully laid out, print-ready
- Docx: 25,815 words, 8 embedded illustrations
- Cover: FINAL LOCKED - dark cinematic stairway, gold title typography, Bishop Roskco A. Motes PhD byline

Chapter map:
- Chapter I   MALE-HOOD    - Page 21 - COMPLETE
- Chapter II  BOY-HOOD     - Page 31 - COMPLETE
- Chapter III MAN-HOOD     - Page 43 - COMPLETE
- Chapter IV  HUSBAND-HOOD - Page 55 - COMPLETE
- Chapter V   FATHER-HOOD  - Page 71 - COMPLETE
- Chapter VI  MENTOR-HOOD  - Page 83 - COMPLETE
- Conclusion               - Page 100 - COMPLETE
- About the Author         - Page 106 - COMPLETE
- Front matter (copyright page, dedication, TOC) - COMPLETE

PENDING: Page 95 paragraph 2 edit (Book_change_note_2) - apply then re-export PDF

---

## ACTIVE BLOCKERS (as of 2026-05-11)

1. Copyright not filed - OPEN - BISHOP MOTES action - $65 - copyright.gov/registration
2. ISBN not purchased - OPEN - BISHOP MOTES action - $125 - myidentifiers.com
3. Airtable PAT missing/invalid - OPEN - Denarius action - airtable.com/create/tokens
4. Page 95 para 2 manuscript edit - OPEN - apply change note, re-export

COMPLETED:
- Cover design - DONE
- Chapter 4 (HUSBAND-HOOD) - DONE - page 55
- Chapter 5 (FATHER-HOOD) - DONE - page 71
- Email to Bishop Motes - DONE - drafted and saved in Gmail (ID: r866117417684851371)
- PROJECT_BRAIN.md committed - DONE - SHA: fe00450

---

## CONNECTED MCP TOOLS (active - verified 2026-05-11)

These tools are live and available to Mya right now:

| Tool | What it does for Book Manager |
|---|---|
| Gmail | Draft, search, and send emails to Bishop Motes and vendors |
| Google Calendar | Create events, set reminders, send invites to Bishop Motes |
| Google Drive | Store and share manuscript files, cover art, PDFs |
| Netlify | Deploy the Book Manager frontend |

---

## SKILL MAP - BOOK MANAGER (updated 2026-05-11)

### INSTALLED / AVAILABLE NOW

| Skill | Type | Purpose for Book Manager |
|---|---|---|
| book-manager | User | Core skill — session constitution, blockers, chapter status |
| docx | Public | Edit manuscript, apply change notes, format chapters |
| pdf | Public | Export print-ready PDF, proof review, distribution copy |
| pdf-reading | Public | Read and audit manuscript PDFs without editing |
| pptx | Public | Convention presentation, pitch deck for Bishop Motes |
| internal-comms | Example | Vendor emails, printer briefs, Bishop Motes updates |
| canvas-design | Example | Cover design concepts, convention marketing materials |
| doc-coauthoring | Example | Structured chapter co-authoring with Bishop Motes |
| file-reading | Public | Read any uploaded file type — zip, docx, images |
| frontend-design | Public | Book Manager dashboard UI improvements |

### MCP CONNECTIONS FOR BOOK MANAGER

| MCP Tool | Use Case | Status |
|---|---|---|
| Gmail | Mya emails Bishop Motes updates, vendor outreach, copyright/ISBN reminders | CONNECTED |
| Google Calendar | Send Bishop Motes calendar events: copyright deadline, ISBN deadline, proof date, convention | CONNECTED |
| Google Drive | Upload and share final PDF, cover art, and manuscript with Bishop Motes | CONNECTED |
| Netlify | Deploy dashboard updates | CONNECTED |

### SKILLS TO CONSIDER ADDING

| Skill | Why | Priority |
|---|---|---|
| skill-creator | Build and update Book Manager skill properly | HIGH |
| theme-factory | Design system for dashboard and convention materials | MEDIUM |
| web-artifacts-builder | Dashboard component builds | MEDIUM |
| xlsx | Budget tracking, unit pricing, print vendor quotes | MEDIUM |
| algorithmic-art | Convention visuals if needed | LOW |

---

## BACKEND DATA ISSUE - DIAGNOSED 2026-05-11

Symptom: /api/book/dashboard returns HTTP 200 but empty arrays.
Root cause: at_get() catches all exceptions silently, returns [].
Most likely: BOOK_AIRTABLE_TOKEN missing or lacks scope in Railway.

Fix order:
1. Regenerate PAT at airtable.com/create/tokens with data.records:read + data.records:write
2. Update BOOK_AIRTABLE_TOKEN in Railway env vars
3. Confirm BOOK_AIRTABLE_BASE_ID = app4GKdk1AqmiOyKx
4. Verify BK_Blockers Status = 'Active' not 'Open'
5. Verify BK_Project has Active Project = true

---

## AIRTABLE SCHEMA (confirmed - case-sensitive)

BK_Project   - filter: {Active Project}=1
BK_Chapters  - no filter, max 20
BK_Tasks     - Status != Done AND != Resolved
BK_Blockers  - {Status}='Active'
BK_Revenue, BK_Expenses, BK_Platforms - no filter
BK_Marketing - optional phase filter
BK_PressKit, BK_AgentLog - no filter

---

## SESSION PROTOCOL - REQUIRED EVERY SESSION

1. Read /mnt/skills/user/book-manager/SKILL.md fully
2. Read PROJECT_BRAIN.md fully
3. No code changes without updating PROJECT_BRAIN.md
4. Visual preview before any UI push
5. Denarius approval before deployment
6. Dual-Engine Build Protocol for major changes
7. Append session log at close

---

## PUBLISHING CHECKLIST (June 15 gate)

1. [x] Cover design complete and locked
2. [x] All 6 chapters complete
3. [x] Manuscript formatted (107 pages PDF)
4. [x] Chapter illustrations placed (8 total)
5. [x] About the Author page complete
6. [x] Email update sent to Bishop Motes
7. [ ] Copyright filing - copyright.gov/registration - BISHOP MOTES ($65)
8. [ ] ISBN purchase - myidentifiers.com - BISHOP MOTES ($125)
9. [ ] Page 95 para 2 edit applied and PDF re-exported
10. [ ] Airtable PAT fixed - Denarius
11. [ ] Print vendor selected and proof ordered
12. [ ] 150 units ordered confirmed for delivery before June 15
13. [ ] Convention logistics confirmed

---

## CALENDAR ACTIONS - MYA CAN EXECUTE

Using Google Calendar (connected), Mya can send Bishop Motes calendar events for:
- Copyright filing deadline
- ISBN purchase deadline
- Proof approval date
- Print order cutoff date
- Convention date (June 15)

To trigger: tell Mya to send Bishop Motes a calendar invite for any of the above.
His email: roskcomotes@gmail.com

---

## PENDING MANUSCRIPT CHANGE

Book_change_note_2 - received 2026-05-11 - Page 95 para 2:
New text: Bishop Motes completed his undergraduate studies at the U. of S.C. and the University of the State of NY in Communications and Human Relations. He then completed his graduate studies at Hofstra University in Marriage and Family Therapy and Psychology. He is a former member of the American Association of Marriage and Family Therapy (AAMFT).
Status: PENDING - upload docx to apply
docs: update project brain - skill map, MCP connections, calendar capability locked---

## SESSION LOG

### SESSION 2026-05-11 (1)
Created PROJECT_BRAIN.md. Backend diagnosed. App.jsx read. All 6 tabs audited.
Commit: 7e76a31

### SESSION 2026-05-11 (2)
Audited zip. 107pp PDF, 25,815 words, all 6 chapters confirmed complete.
Final cover confirmed. Closed: Cover, Ch4, Ch5 blockers.
Copyright/ISBN ownership corrected to Bishop Motes.
Commit: fe00450

### SESSION 2026-05-11 (3)
Full skill and MCP audit completed.
Connected tools confirmed: Gmail, Google Calendar, Google Drive, Netlify.
Book Manager skill map updated with all available skills and MCP connections.
Calendar capability confirmed - can send Bishop Motes events directly.
Email draft created in Gmail (r866117417684851371).
PROJECT_BRAIN.md updated with connected tools, skill map, calendar actions section.
Skill update for book-manager SKILL.md written and ready to install.
Commit SHA: (pending)
Next: Push this update. Send calendar invites to Bishop Motes. Fix Airtable PAT.
