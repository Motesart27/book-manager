# PROJECT_BRAIN.md
# Book Manager Dashboard - Source of Truth
# Project: Book Management / Book Manager Dashboard

---

## PROJECT IDENTITY

- Book Title: Tales from the Hood: A Biblical Guide to Growing from Male to Man
- Author: Bishop Roskco A. Motes, PhD
- Dashboard Name: Book Manager Dashboard
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
This deadline is HARD.

---

## MANUSCRIPT STATUS - CONFIRMED 2026-05-11

Confirmed from zip audit (Tales_of_the_Hood_full_book.zip):
- PDF: 107 pages, fully laid out
- Docx: 25,815 words, 8 embedded illustrations
- Cover: CONFIRMED FINAL - dark cinematic stairway scene, gold title typography, Bishop Roskco A. Motes PhD byline
- Chapter I   MALE-HOOD    - Page 21 - COMPLETE
- Chapter II  BOY-HOOD     - Page 31 - COMPLETE
- Chapter III MAN-HOOD     - Page 43 - COMPLETE
- Chapter IV  HUSBAND-HOOD - Page 55 - COMPLETE
- Chapter V   FATHER-HOOD  - Page 71 - COMPLETE
- Chapter VI  MENTOR-HOOD  - Page 83 - COMPLETE
- Conclusion  - Page 100   - COMPLETE
- About the Author - Page 106 - COMPLETE
- Front matter (copyright page, dedication, TOC) - COMPLETE

PENDING: Page 95 paragraph 2 edit (Book_change_note_2) - apply and re-export

---

## ACTIVE BLOCKERS (as of 2026-05-11 Update 2)

1. Copyright not filed - OPEN - Bishop Motes must act - $65 - https://copyright.gov/registration
2. ISBN not purchased - OPEN - Bishop Motes must act - $125 - https://www.myidentifiers.com
3. Airtable PAT missing/invalid - OPEN - Denarius action - airtable.com/create/tokens
4. Page 95 para 2 manuscript edit - OPEN - pending docx upload

COMPLETED BLOCKERS:
- Cover design - DONE
- Chapter 4 (HUSBAND-HOOD) - DONE - page 55
- Chapter 5 (FATHER-HOOD) - DONE - page 71

RULE: Copyright and ISBN are Bishop Motes actions. Denarius manages and tracks.

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

## AIRTABLE SCHEMA

BK_Project   - filter: {Active Project}=1
BK_Chapters  - no filter, max 20
BK_Tasks     - Status != Done AND != Resolved
BK_Blockers  - {Status}='Active'
BK_Revenue, BK_Expenses, BK_Platforms - no filter
BK_Marketing - optional phase filter
BK_PressKit, BK_AgentLog - no filter

---

## SESSION PROTOCOL

1. Read SKILL.md fully
2. Read PROJECT_BRAIN.md fully
3. No code changes without updating PROJECT_BRAIN.md
4. Visual preview before any UI push
5. Denarius approval before deployment
6. Dual-Engine Build Protocol for major changes
7. Append session log at close

---

## PUBLISHING CHECKLIST (June 15 gate)

1. [x] Cover design complete
2. [x] Chapter 4 complete
3. [x] Chapter 5 complete
4. [x] All 6 chapters complete
5. [x] Manuscript formatted (107 pages)
6. [ ] Copyright filing - copyright.gov/registration - Bishop Motes
7. [ ] ISBN purchase - myidentifiers.com - Bishop Motes
8. [ ] Page 95 para 2 edit applied
9. [ ] Print vendor selected and proof ordered
10. [ ] 150 units ordered before June 15
11. [ ] Convention logistics confirmed

---

## PENDING MANUSCRIPT CHANGE

Book_change_note_2 - received 2026-05-11 - Page 95 para 2:
Bishop Motes completed his undergraduate studies at the U. of S.C. and the University of the State of NY in Communications and Human Relations. He then completed his graduate studies at Hofstra University in Marriage and Family Therapy and Psychology. He is a former member of the American Association of Marriage and Family Therapy (AAMFT).
Status: PENDING

---

## SESSION LOG

### SESSION 2026-05-11 (1)
Created PROJECT_BRAIN.md. Backend diagnosed. App.jsx read. All 6 tabs audited.
Commit: 7e76a31

### SESSION 2026-05-11 (2)
Audited Tales_of_the_Hood_full_book.zip. 107pp PDF, 25,815 words, all 6 chapters confirmed complete.
Final cover confirmed. Closed: Cover, Ch4, Ch5 blockers.
Updated: Copyright/ISBN ownership corrected to Bishop Motes.
Pending: push this update, send email, apply page 95 edit.
