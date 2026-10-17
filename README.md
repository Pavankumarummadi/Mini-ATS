# Mini ATS

A small Applicant Tracking System to manage candidates, hiring stages, search and dashboard metrics.

**Stack:** Django 5 + Django REST Framework (SQLite) · React 18 + Vite

## Features
- **Pipeline board**: drag candidates between Applied, Screening, Interview, Offer, Hired and Rejected (a dropdown on each card does the same without dragging)
- **Candidates table**: search by name, email, role or skill; filter by stage
- **Dashboard**: total, in progress, new this week, hire rate, candidates by stage, hiring funnel, top roles
- Add, edit and delete candidates, with validation (required fields, unique email)
- **Stage history** per candidate, recorded on every move
- Seed command with 10 demo candidates, and API tests

## Run locally

Backend (http://localhost:8000):
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed        # optional demo data
python manage.py runserver
python manage.py test        # run tests
```

Frontend (http://localhost:5173):
```bash
cd frontend
cp .env.example .env         # VITE_API_URL=http://localhost:8000/api
npm install
npm run dev
```

## API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/candidates/?search=&stage=&role=&ordering=` | List with search and filters |
| POST | `/api/candidates/` | Create |
| GET/PATCH/DELETE | `/api/candidates/:id/` | Read, update (including `stage`), delete |
| GET | `/api/dashboard/` | Metrics |

## Deploy
**Backend on Render:** New Web Service from this repo, root directory `backend`, build command `./build.sh`, start command `gunicorn config.wsgi`, environment variables `DEBUG=0`, `SECRET_KEY=<random>`. (`render.yaml` is included.) The free tier uses SQLite, so data resets on redeploy; `build.sh` re-seeds demo data. Use Postgres for real use.

**Frontend on Vercel or Netlify:** root directory `frontend`, build command `npm run build`, output directory `dist`, environment variable `VITE_API_URL=https://<your-render-app>.onrender.com/api`.

## Project layout
```
backend/   config/ (settings, urls) · candidates/ (models, serializers, views, tests, seed command)
frontend/  src/App.jsx · api.js · components/ (Pipeline, CandidateTable, Dashboard, CandidateModal)
```
