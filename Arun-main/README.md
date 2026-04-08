# TaskFlow

A full-stack **Task Management System** built with React.js, Node.js, Express.js, PostgreSQL, JWT, and bcrypt.

## Features
- 🔐 JWT-based authentication (register/login)
- ✅ Create, update, delete tasks with **priority** (high/medium/low) and **status** (todo/in_progress/done)
- 📊 Dashboard with Kanban board and real-time stats
- 🔍 Filter by status, priority, and search
- 🗄️ Indexed PostgreSQL schema for optimised queries

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React.js + Vite |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (indexed) |
| Auth | JWT + bcrypt |

## Project Structure
```
TaskFlow/
├── backend/          # Express REST API
│   ├── migrations/   # SQL schema with indexes
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       └── routes/
└── frontend/         # React + Vite SPA
    └── src/
        ├── api/
        ├── components/
        ├── context/
        └── pages/
```

## Setup

### 1. Database
```sql
-- Create database in PostgreSQL
CREATE DATABASE taskflow;
-- Then run:
psql -U postgres -d taskflow -f backend/migrations/init.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # Fill in DB credentials and JWT secret
npm install
npm run dev            # Runs on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev            # Runs on http://localhost:5173
```

## API Endpoints
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/tasks` | Yes | List tasks (filterable) |
| GET | `/api/tasks/stats` | Yes | Task counts |
| POST | `/api/tasks` | Yes | Create task |
| GET | `/api/tasks/:id` | Yes | Get single task |
| PUT | `/api/tasks/:id` | Yes | Update task |
| DELETE | `/api/tasks/:id` | Yes | Delete task |
