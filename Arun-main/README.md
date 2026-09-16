# TaskFlow

TaskFlow is a full-stack task management application with a React/Vite frontend, an Express API, Neon PostgreSQL storage, JWT authentication, and Google Sign-In.

## Features

- Email/password and Google authentication
- Create, edit, delete, and filter tasks
- Kanban workflow with To Do, In Progress, and Done columns
- Priority and due-date tracking
- Task statistics dashboard
- Neon PostgreSQL persistence

## Project Structure

```text
Arun-main/
├── backend/                  # Express REST API
│   ├── migrations/init.sql   # PostgreSQL schema
│   └── src/
└── frontend/                # React + Vite SPA
        └── src/
```

## Local Development

### Backend

Create `backend/.env` from `backend/.env.example` and set `DATABASE_URL`, `JWT_SECRET`, and `GOOGLE_CLIENT_ID`.

```powershell
cd backend
npm install
npm run dev
```

The API runs at `http://localhost:5000`.

### Frontend

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_web_client_id
```

Then run:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment Variables

### Backend

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=replace_with_a_strong_random_secret
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_web_client_id
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
```

`DATABASE_URL` is used for Neon. The separate `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` variables are only a fallback for local PostgreSQL.

### Frontend

```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_web_client_id
```

Never commit `.env` files, database passwords, JWT secrets, or Google client secrets.

## Deployment

### Render Backend

Create a Render Web Service connected to this repository:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
Health Check Path: /api/health
```

Set these Render environment variables:

```env
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your_production_secret
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_web_client_id
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
```

The repository also includes `render.yaml` for Blueprint deployment.

### Vercel Frontend

Create a Vercel project connected to this repository:

```text
Root Directory: frontend
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

Set these Vercel environment variables:

```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_web_client_id
```

The repository includes `frontend/vercel.json` for SPA route fallback.

After deployment, update Render's `CLIENT_URL` with the final Vercel URL and redeploy the backend.

## Google OAuth Configuration

In Google Cloud Console, configure the OAuth Web Client with these authorized JavaScript origins:

```text
http://localhost:5173
https://your-frontend.vercel.app
```

Use only the origin. Do not add `/login`, `/dashboard`, `/api`, or a trailing slash.

The Google client secret is not required by the browser flow and must never be placed in frontend code.

## Health Check

```text
GET /api/health
```

When the API and Neon database are connected, it returns a response containing:

```json
{
    "status": "ok",
    "database": "connected"
}
```

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register with email/password |
| POST | `/api/auth/login` | No | Login with email/password |
| POST | `/api/auth/google` | No | Login with Google ID token |
| GET | `/api/auth/me` | Yes | Get the current user |
| GET | `/api/tasks` | Yes | List filtered tasks |
| GET | `/api/tasks/stats` | Yes | Get task counts |
| POST | `/api/tasks` | Yes | Create a task |
| GET | `/api/tasks/:id` | Yes | Get one task |
| PUT | `/api/tasks/:id` | Yes | Update a task |
| DELETE | `/api/tasks/:id` | Yes | Delete a task |
