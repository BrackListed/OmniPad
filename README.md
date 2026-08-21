# ⚡ OmniPad — Asynchronous Active-Recall Engine

> **High-throughput document processing pipeline turning dense 100+ page course modules into active, spoken, and Socratic, Feynman, Quiz, or Flashcard evaluation sessions.**

---

## 🎯 The Problem
Traditional student AI tools rely on passive summaries or struggle with severe context degradation when processing long-term academic readings (>50 pages). Furthermore, standard chatbots promote passive learning instead of **active recall**—allowing students to review concepts without testing whether they can articulate them simply.

**OmniPad** solves this by combining **asynchronous document ingestion** with **voice-driven, constraint-enforced active recall models**.

---

## 🏗️ Architecture & Engineering Highlights

### Content Generation Pipeline

A 100+ page PDF is too large for a single LLM call and too slow to process inside a request/response cycle. OmniPad decouples ingestion from generation with a Redis-backed job queue: the API enqueues the work, a separate worker parses and chunks the document, and the mode the user picked decides which prompt turns those chunks into a study session.

```mermaid
flowchart TD
    PDF["📄 100+ page PDF"]
    Upload["Upload endpoint\ndedup by SHA-256 hash"]
    Queue[("Redis / BullMQ queue")]
    Worker["Worker\nparses PDF, chunks text (~12k chars)"]

    PDF --> Upload --> Queue --> Worker

    Worker --> Feynman["Feynman prompt\ngenerates teach-it-back questions"]
    Worker --> Socratic["Socratic prompt\ngenerates guiding questions + hints"]
    Worker --> Quiz["Quiz prompt\ngenerates multiple-choice questions"]
    Worker --> Flashcards["Flashcards prompt\ngenerates front/back cards"]

    Feynman --> DB[("PostgreSQL\nstudy_sessions.payload")]
    Socratic --> DB
    Quiz --> DB
    Flashcards --> DB

    DB --> FE["Frontend fetches the session\nand displays it to the user"]
```

### How It Grades Your Answers

Every generated question carries its own `referenceAnswer` alongside it. Grading free-response answers (Feynman, Socratic) doesn't touch the heavy generation pipeline at all — it's a single, fast Groq call that compares what you wrote against that reference.

```mermaid
flowchart TD
    Question["Question + its referenceAnswer\n(from study_sessions.payload)"]
    Answer["You type or speak an answer"]
    Endpoint["POST /process-answer"]
    LLM["Groq — openai/gpt-oss-20b\ncompares your answer to the referenceAnswer"]
    Correct{"Judged correct?"}
    Pass["✅ Score +1\nadvance to next question"]
    Fail["❌ Explanation returned\nshown in the UI"]

    Question --> Answer --> Endpoint --> LLM --> Correct
    Correct -->|Yes| Pass
    Correct -->|No| Fail
```

### Highlights

- **Decoupled ingestion** — PDF parsing and multi-chunk LLM generation happen in a BullMQ worker, not the request thread, so a 100-page upload never blocks or times out the API.
- **Content dedup** — uploads are hashed (SHA-256) before insert; re-uploading the same file reuses the existing record instead of reprocessing it.
- **One document, four modes** — Feynman, Socratic, Quiz, and Flashcards are all generated from the same chunked source text via mode-specific system prompts, not four separate pipelines.
- **Real-time grading, separate from generation** — free-response answers (Feynman/Socratic) are graded via a lightweight, single-call Groq request (`/process-answer`), decoupled from the heavier chunked generation path.
- **Clerk-driven identity** — user rows are provisioned via a Clerk webhook (`user.created`) rather than on first API call, keeping auth and app data in sync.
- **Resumable onboarding tour** — a driver.js-powered product tour tracks per-mode visitation state so it can resume correctly across page navigations, and persists completion (`has_seen_tour`) server-side so it only plays once per user.

### Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/radix, FullCalendar, Recharts, driver.js |
| Auth | Clerk |
| API | Express 5, Drizzle ORM (schema) + raw `pg` queries |
| Async jobs | BullMQ + Redis |
| Database | PostgreSQL |
| LLM | Groq (`openai/gpt-oss-20b`) |
| File parsing | `pdf-parse` |

---

## 🚀 Running It Locally

### Prerequisites

- Node.js 20+
- A PostgreSQL database (local, [Neon](https://neon.tech), [Supabase](https://supabase.com), etc.)
- A Redis instance reachable at `localhost:6379` (the queue connection is currently hardcoded — see `redisOptions` in `backend/index.ts` and `backend/worker.js`)
- A [Clerk](https://clerk.com) application (publishable key, secret key, webhook signing secret)
- A [Groq](https://console.groq.com) API key

### 1. Clone & install

```bash
git clone <this-repo-url>
cd OmniPad

cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=5000
FRONTEND_URL=http://localhost:5173
GROQ_API_KEY=your_groq_api_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SIGNING_SECRET=your_clerk_webhook_signing_secret
```

Create `frontend/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 3. Push the database schema

```bash
cd backend
npx drizzle-kit push
```

### 4. Start Redis

```bash
docker run -p 6379:6379 redis
```

### 5. Run all three processes

```bash
# Terminal 1 — API server
cd backend && npx tsx index.ts

# Terminal 2 — background worker (PDF parsing + question generation)
cd backend && node worker.js

# Terminal 3 — frontend
cd frontend && npm run dev
```

Then open **http://localhost:5173**.

> In Clerk's dashboard, point the `user.created` webhook at `http://<your-tunnel-url>/webhooks/clerk` (e.g. via `ngrok`) so new sign-ups get provisioned in Postgres.

---

## 📸 Screenshots

### Dashboard
![Dashboard](docs/Dashboard.png)

### Calendar
![Calendar](docs/Calendar.png)

### Study Hub
![Study Hub](docs/Study-Hub.png)

### History Analytics
![History Analytics](docs/History-Analytics.png)

### Feynman Reviewer
![Feynman Reviewer](docs/Feynman.png)

### Socratic Reviewer
![Socratic Reviewer](docs/Socratic.png)

### Quiz Reviewer
![Quiz Reviewer](docs/Quiz.png)

### Flashcards Reviewer
![Flashcards Reviewer](docs/Flashcards.png)

---

## 🌐 Live Demo

**[https://omni-pad-sepia.vercel.app/]**