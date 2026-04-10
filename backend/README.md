# MotesArt Book Manager — Backend API

Standalone Railway service for the Book Manager system.

## Environment Variables (set in Railway)

```
BOOK_AIRTABLE_TOKEN=your_airtable_pat
BOOK_AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
ANTHROPIC_API_KEY=your_anthropic_key
FM_APP_URL=https://web-production-f6963.up.railway.app
PORT=5050
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Service health |
| GET | /api/book/dashboard | Full aggregated dashboard state |
| GET | /api/book/os-summary | Lightweight read for OS panel |
| GET | /api/book/project | Active project record |
| PATCH | /api/book/project/:id | Update project |
| GET | /api/book/chapters | All chapters |
| PATCH | /api/book/chapters/:id/status | Update chapter status |
| GET/POST | /api/book/tasks | Tasks |
| PATCH | /api/book/tasks/:id | Update task |
| GET/POST | /api/book/expenses | Expenses (auto-syncs to FM) |
| GET/POST | /api/book/revenue | Revenue (auto-syncs to FM) |
| GET/POST | /api/book/marketing | Marketing content |
| GET/POST | /api/book/press-kit | Press kit assets |
| GET | /api/book/platforms | Platform accounts |
| PATCH | /api/book/platforms/:id | Update platform |
| GET | /api/book/blockers | Active blockers |
| PATCH | /api/book/blockers/:id | Resolve blocker |
| POST | /api/book/agent | Book Manager AI agent |
| GET | /api/book/agent-log | Agent session history |

## FM Sync Rules
- Expenses and Revenue auto-sync to FinanceMind on POST
- FM sync is NON-BLOCKING — book record saves even if FM is down
- FM Linked field tracks sync status per record
