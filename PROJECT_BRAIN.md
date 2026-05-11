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

## ACTIVE BLOCKERS (as of 2026-05-11)

1. Copyright not filed - OPEN - Denarius action - https://copyright.gov/registration
2. ISBN not purchased - OPEN - Denarius action - https://www.myidentifiers.com
3. Cover design not completed - OPEN - Design work needed
4. Chapter 4 needs final completion - OPEN - Bishop Motes
5. Chapter 5 needs final completion - OPEN - Bishop Motes

RULE: Copyright and ISBN are Denarius-owned business actions.
Do NOT build around them as completed. Track as OPEN until Denarius confirms done.

---

## BACKEND DATA ISSUE - DIAGNOSED 2026-05-11

Symptom: /api/book/dashboard returns HTTP 200 but empty arrays for blockers, chapters, openTasks.

Root cause (from reading main.py):
The at_get() helper catches ALL exceptions silently and returns [].
Empty arrays caused by one or more of:

1. Missing/invalid BOOK_AIRTABLE_TOKEN in Railway env vars (most likely)
   Token needs: data.records:read AND data.records:write scopes
2. Missing/wrong BOOK_AIRTABLE_BASE_ID - must be app4GKdk1AqmiOyKx
3. BK_Project filter {Active Project}=1 - needs one record with this true
4. BK_Blockers filter {Status}='Active' - records may use 'Open' not 'Active'
5. Table name case-sensitivity mismatch

Fix order:
1. Regenerate PAT at airtable.com/create/tokens with data.records:read + data.records:write
2. Update BOOK_AIRTABLE_TOKEN in Railway env vars
3. Confirm BOOK_AIRTABLE_BASE_ID = app4GKdk1AqmiOyKx in Railway
4. Verify BK_Blockers Status field uses 'Active' not 'Open'
5. Verify BK_Project has Active Project = true on at least one record

---

## AIRTABLE SCHEMA (confirmed - case-sensitive)

BK_Project   - filter: {Active Project}=1
BK_Chapters  - no filter, max 20
BK_Tasks     - filter: Status != Done AND != Resolved
BK_Blockers  - filter: {Status}='Active'
BK_Revenue   - no filter
BK_Expenses  - no filter
BK_Platforms - no filter
BK_Marketing - optional phase filter
BK_PressKit  - no filter
BK_AgentLog  - sort Created desc

---

## SESSION PROTOCOL - REQUIRED EVERY SESSION

Before ANY code change:
1. Read /mnt/skills/user/book-manager/SKILL.md fully
2. Read this file (PROJECT_BRAIN.md) fully
3. No code changes without updating PROJECT_BRAIN.md
4. Visual preview required before any UI push
5. User (Denarius) approval required before any deployment
6. Dual-Engine Build Protocol required for major changes

NEVER push UI changes without approval.
NEVER build around open blockers as if resolved.

Session close must append to SESSION LOG:
- What changed
- Files changed
- Blockers found
- Tests run
- Commit SHA
- Next recommended action

---

## PUBLISHING CHECKLIST (June 15 gate - in order)

1. [ ] Copyright filing - copyright.gov/registration - Denarius action
2. [ ] ISBN purchase - myidentifiers.com - Denarius action
3. [ ] Cover design complete
4. [ ] Chapter 4 complete and approved
5. [ ] Chapter 5 complete and approved
6. [ ] All 8 chapters complete and reviewed
7. [ ] Manuscript formatted for print
8. [ ] Print vendor selected and proof ordered
9. [ ] 150 units ordered and confirmed for delivery before June 15
10. [ ] Convention logistics confirmed

---

## PENDING MANUSCRIPT CHANGE

Book_change_note_2 - received 2026-05-11
Location: Page 95, paragraph 2
New text: Bishop Motes completed his undergraduate studies at the U. of S.C. and the University of the State of NY in Communications and Human Relations. He then completed his graduate studies at Hofstra University in Marriage and Family Therapy and Psychology. He is a former member of the American Association of Marriage and Family Therapy (AAMFT).

Status: PENDING - awaiting manuscript .docx upload from Denarius to apply.

---

## SESSION LOG

### SESSION: 2026-05-11

What changed:
- PROJECT_BRAIN.md created - first commit, system memory established
- Full backend main.py read and diagnosed
- Full App.jsx (416 lines) read and inventoried
- Live app audit: all 6 tabs checked, data confirmed empty from Airtable

Files changed: PROJECT_BRAIN.md (created)

Blockers found:
- All 5 publishing blockers remain open
- Airtable token likely missing or lacks scope in Railway
- BK_Blockers filter uses 'Active' - verify Airtable records match

Tests run:
- /api/book/dashboard - HTTP 200, all arrays empty
- /api/book/project - 404
- Browser audit all 6 tabs confirmed

Commit SHA: fac87db (local) - remote push pending GitHub PAT

Next recommended actions:
1. Regenerate Airtable PAT with read+write scope, update Railway env var
2. Confirm BOOK_AIRTABLE_BASE_ID in Railway
3. File Copyright at copyright.gov TODAY
4. Purchase ISBN at myidentifiers.com TODAY
5. Upload manuscript docx for page 95 paragraph 2 edit
6. Next session: re-audit dashboard after env fix, then proceed to UI preview
