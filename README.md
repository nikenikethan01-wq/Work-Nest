<h1 align="center">Work-Nest</h1>

<p align="center">
  A full-stack freelance platform where clients post jobs and freelancers apply for them.
</p>

<p align="center">
  <b>Live Demo:</b> <a href="https://work-nest-git-main-jones-projects4.vercel.app">LIVE</a>
</p>

Work-Nest covers the whole flow: posting a job, finding a job, chatting, applying, hiring, submitting work, and completing the project.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [How It Works](#-how-it-works)
- [Database](#-database)
- [API Overview](#-api-overview)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [What I Learned](#-what-i-learned)
- [Author](#-author)

---

## ✨ Features

### 👤 For Clients

- Create, edit, and delete jobs (while the job is still live)
- See all applications for a job
- Accept one application (the rest are rejected automatically) or reject one
- Review submitted work and mark the project as complete
- Dashboard with active jobs, total applications, and hired freelancers

### 💼 For Freelancers

- Browse live jobs with search, category, and budget filters
- Chat with clients to talk about scope and budget
- Apply to a job (only once per job)
- Submit finished work for client review
- Dashboard with recent applications and active projects

### 🌐 For Everyone

- Register and log in as a client or a freelancer
- Real-time chat with online status
- Each role can only see its own pages and use its own API routes

---

## 🛠 Tech Stack

| Part | Technology |
|------|------------|
| **Frontend** | React, React Router, Context API, HTML, CSS |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Real-time** | Socket.IO |
| **Auth** | Express Session, connect-pg-simple, bcrypt |
| **Other** | express-rate-limit, validator |

---

## ⚙️ How It Works

**Login**
The server creates a session after login and stores it in PostgreSQL. The browser keeps only a session cookie (`httpOnly`, and `secure` in production).

**Authorization**
Middleware checks the user's role on every request. The SQL queries also check ownership, for example `WHERE id = $1 AND client_id = $2`. The user's identity always comes from the session, never from the request body.

**Hiring**
Accepting an application runs in one database transaction. It accepts the chosen application, rejects the others, and creates the project. If any step fails, everything is rolled back.

**Status Control**
Jobs, applications, and projects only move through valid stages, using guarded updates such as `WHERE status = 'pending'`.

**Chat**
Each user joins a private Socket.IO room. The server checks that the sender is part of the conversation, saves the message to PostgreSQL, and then sends it to the other user. A disconnect does not lose messages.

### Status Flow

| Item | Stages |
|------|--------|
| **Job** | `live` → `in_progress` → `completed` |
| **Application** | `pending` → `accepted` or `rejected` |
| **Project** | `in_progress` → `submitted` → `completed` |

---

## 🗄 Database

**Tables:** `users`, `client_profiles`, `freelancer_profiles`, `jobs`, `applications`, `projects`, `conversations`, `messages`, `session`

- Login details live in `users`. Role-specific details live in the two profile tables.
- `applications` uses a composite primary key `(job_id, freelancer_id)`, so a freelancer can apply to a job only once.
- `conversations` has a unique `(client_id, freelancer_id)` pair, so two users have only one conversation.

---

## 🔌 API Overview

**Base path:** `/api`

| Router | Path | Used For |
|--------|------|----------|
| **Auth** | `/api/auth` | Register, login, logout, current user (`/me`) |
| **Client** | `/api/client` | Jobs, applications, projects, dashboard, profile |
| **Freelancer** | `/api/freelancer` | Browse jobs, apply, projects, dashboard, profile |
| **Chat** | `/api/chat` | Conversations and messages |

### Example Routes

| Method | Route | What It Does |
|--------|-------|--------------|
| `POST` | `/api/auth/login` | Log in |
| `POST` | `/api/client/jobs/createjob` | Create a job |
| `PATCH` | `/api/client/applications/:jobId/:freelancerId/accept` | Hire a freelancer |
| `POST` | `/api/freelancer/jobs/:id/application` | Apply to a job |
| `PATCH` | `/api/freelancer/project/:projectId/submit` | Submit work |
| `PATCH` | `/api/client/project/:projectId/status` | Complete a project |
| `GET` | `/api/chat/conversations/:conversationId/messages` | Get chat history |

---

## 🚀 Getting Started

### Requirements

- Node.js 18 or newer
- PostgreSQL

### 1. Clone the project

```bash
git clone YOUR_REPO_URL
cd YOUR_REPO_FOLDER
```

### 2. Set up the database

Create a database and run your SQL schema file to create the tables.

```bash
createdb worknest
psql worknest -f schema.sql
```

### 3. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:

```env
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
SESSION_SECRET=replace-with-a-long-random-string
DATABASE_URL=postgresql://user:password@localhost:5432/worknest
NODE_ENV=development
```

Start the server:

```bash
npm run dev
```

### 4. Set up the client

```bash
cd client
npm install
npm run dev
```

Open the URL that Vite shows in the terminal (usually `http://localhost:5173`).

---

## 📁 Project Structure

```text
server/
├── controller/    # Request handlers (auth, client, freelancer, chat)
├── routes/        # Route definitions
├── middleware/    # Auth, roles, sessions, rate limits
├── db/            # Database connection
├── utils/         # Helper functions
└── index.js       # Express app and Socket.IO setup

client/
└── src/           # React app
```

---

## 📚 What I Learned

- Using database transactions so multi-step actions either fully work or do nothing
- Getting the user's identity from the server session instead of trusting the frontend
- Designing a relational schema and changing it as the requirements grew
- Using one private Socket.IO room per user and saving messages before sending them
- Cleaning up Socket.IO listeners in `useEffect` so messages do not show up twice

---

## 👨‍💻 Author

**YOUR NAME**

- GitHub: [YOUR_GITHUB_LINK](YOUR_GITHUB_LINK)
- LinkedIn: [YOUR_LINKEDIN_LINK](YOUR_LINKEDIN_LINK)
- Email: YOUR_EMAIL
