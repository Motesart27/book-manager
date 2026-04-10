# MotesArt Book Manager

Standalone publishing management system for "Tales from the Hood" by Bishop Roskco A. Motes, PhD.

## Architecture

```
GitHub: Motesart27/book-manager
  ├── /               → Netlify frontend (React + Vite)
  └── /backend        → Railway backend (Python Flask)
```

## Services

| Service | URL |
|---------|-----|
| Frontend | https://[book-manager].netlify.app |
| Backend API | https://book-manager-api.up.railway.app |
| Airtable Base | MotesArt — Book Manager |
| OS Read Endpoint | GET /api/book/os-summary |

## Connection to Motesart OS

The Motesart OS BOOK panel reads ONLY from:
`GET /api/book/os-summary`

No write access from OS. Book Manager is fully standalone.

## Environment Variables

### Frontend (Netlify)
```
VITE_BOOK_API_URL=https://book-manager-api.up.railway.app
```

### Backend (Railway)
```
BOOK_AIRTABLE_TOKEN=your_pat
BOOK_AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
ANTHROPIC_API_KEY=your_key
FM_APP_URL=https://web-production-f6963.up.railway.app
PORT=5050
```

## Deploy

Frontend → Netlify (auto-deploy on push to main)
Backend → Railway (auto-deploy on push to main, root: /backend)
