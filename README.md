# Week 1 – Foundation & Deployment

## Goal
Stand up a live portfolio shell (frontend) and a deployed backend API skeleton.

## Tech Stack
- **Frontend:** Next.js + TypeScript + Tailwind CSS
- **Backend:** FastAPI
- **Database:** Azure PostgreSQL (Flexible Server)

## Architecture Diagram
```mermaid
flowchart LR
  U[User] -->|HTTPS| SWA[Azure Static Web Apps]
  SWA -->|Next.js App| FE[Frontend UI]
  FE -->|API Calls| AS[Azure App Service]
  AS -->|FastAPI| BE[Backend API]
  BE -->|SQL| PG[(Azure PostgreSQL Flexible Server)]
```

## Monorepo Layout
```
.
├── backend
│   ├── app
│   │   ├── db.py
│   │   └── main.py
│   └── requirements.txt
├── frontend
│   ├── app
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── projects
│   │   │   └── page.tsx
│   │   └── resume
│   │       └── page.tsx
│   ├── next.config.js
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
└── .gitignore
```

## Local Development
### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql+asyncpg://user:password@host:5432/dbname"
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment Checklist
- **Azure App Service (backend):** deploy `backend` with `uvicorn` startup.
- **Azure Static Web Apps (frontend):** deploy `frontend` build output.
- **Azure PostgreSQL Flexible Server:** provision and set `DATABASE_URL`.

## Deliverables
- Live portfolio URL (frontend)
- Backend API running with `/health`
- Clean README with architecture diagram
