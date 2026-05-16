# Peblo Notes — Collaborative AI Notes Workspace

A full-stack, AI-powered notes application built for the Peblo take-home challenge. Create and manage notes with a rich-text editor, organise them with tags and categories, generate AI summaries and action items via Mistral, search and filter instantly, share notes publicly with granular permissions, and track your productivity on a live dashboard.

## Demo

[![Watch the demo](https://img.youtube.com/vi/txOsm7-NQ4A/maxresdefault.jpg)](https://www.youtube.com/watch?v=txOsm7-NQ4A)

---

## Table of Contents

- [Demo](#demo)
- [Screenshots](#screenshots)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Testing the Application](#testing-the-application)
- [Project Structure](#project-structure)
- [Sample Outputs](#sample-outputs)
- [Optional Enhancements](#optional-enhancements)

---

## Screenshots

| Dashboard | Notes Editor |
|---|---|
| ![](<assets/peblo-notes (1).png>) | ![](<assets/peblo-notes (3).png>) |
| Stats, weekly activity chart | Rich text editor with tags & category |

| AI Sidebar | Filter & Sort |
|---|---|
| ![](<assets/peblo-notes (4).png>) | ![](<assets/peblo-notes (5).png>) |
| AI-generated summary, action items, suggested title | Tag/category filter and sort popover |

| Public Sharing | Shared Notes |
|---|---|
| ![](<assets/peblo-notes (9).png>) | ![](<assets/peblo-notes (6).png>) |
| Share popover with access level picker | Shared-by-me management page |

| Dashboard (lower) | Settings |
|---|---|
| ![](<assets/peblo-notes (2).png>) | ![](<assets/peblo-notes (7).png>) |
| Recent notes, AI usage stats, top tags | Account management and danger zone |

---

## Features

### 1. Authentication
- Email / password signup and login
- Passwords hashed with bcryptjs (12 salt rounds)
- JWT issued on login, stored in HTTP-only cookies (7-day expiry)
- All note endpoints are protected by `requireAuth` middleware
- `secure` cookie flag is enabled in production automatically

### 2. Notes Workspace
- Create, edit, and delete notes with a **Tiptap** rich-text editor
- Full Markdown support with live serialisation via `tiptap-markdown`
- **Auto-save** — changes are debounced for 700 ms then synced to the server; a "saving / saved" indicator shows the status
- Organise notes with **tags** (JSONB array, normalised to lowercase-hyphenated) and a single **category** per note
- **Archive** notes without deleting them; a dedicated `/archive` page lists and restores them
- Cursor-based pagination (25 notes per page) so the list stays fast as it grows

### 3. AI Integration (Mistral)
- Open the resizable AI sidebar on any note and click **Generate Summary**
- Mistral processes the note's title + plain-text content and returns:
  - A detailed **summary** (500–1 000 characters)
  - Up to 5 extracted **action items**
  - A **suggested title** if the current one is weak
- Summary, action items, and generation timestamp are persisted on the note record in PostgreSQL
- Graceful error handling: rate-limit (429), timeout (504), invalid key (403), and generic (500) all surface a user-readable message with guidance

### 4. Search & Filtering
- **Keyword search** — matches title, content, and tags simultaneously (case-insensitive, client-side for instant feedback)
- **Tag filter** — AND logic: only notes that have every selected tag are shown
- **Category filter** — OR logic: any selected category matches
- **Sort** by last updated (default), created date, or title A–Z
- The list updates instantly — no network round-trip required

### 5. Public Share Page
- Per-note share links with three permission levels: **none**, **view**, **edit**
- A unique UUID share token is generated lazily when sharing is first enabled
- `GET /api/public/notes/:token` — accessible without a session cookie
- `PATCH /api/public/notes/:token` — allowed only when permission is `edit`
- Public viewer at `/view/:token` shows title, tags, author name, and full content
- Real-time **presence avatars** via Socket.io show other people currently viewing the note

### 6. Productivity Dashboard
- **Total notes** and **archived notes** count
- **Notes created this week**
- **Most-used tags** with per-tag counts
- **AI usage statistics** — how many notes have been summarised, and when
- **Weekly activity bar chart** — notes created per day over the last 7 days (Recharts)
- **Recently edited notes** quick list

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│                                                                 │
│  Next.js 16 (App Router) · React 19 · Tailwind 4 · shadcn/ui  │
│  Tiptap (rich-text)  ·  Recharts (charts)  ·  Socket.io-client │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ AuthContext │  │ NotesContext │  │    SettingsContext      │ │
│  │ (JWT cookie)│  │ (useReducer) │  │  (localStorage)        │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
└──────────────────────────┬────────────────────────┬────────────┘
                           │  REST (fetch + cookie)  │  WebSocket
                           ▼                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Express API Server (:3001)                    │
│                                                                 │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────────────┐ │
│  │/api/auth │  │/api/notes │  │/api/public/notes (no auth)   │ │
│  └──────────┘  └───────────┘  └──────────────────────────────┘ │
│                                                                 │
│  Middleware: requireAuth · validateBody(Zod) · errorHandler     │
│  Services:  auth.service  ·  notes.service (CRUD + AI)          │
│                                                                 │
│  ┌──────────────────────┐  ┌───────────────────────────────┐   │
│  │  Drizzle ORM         │  │  Mistral AI (@ai-sdk/mistral)  │   │
│  │  (type-safe SQL)     │  │  generateObject + Zod schema   │   │
│  └──────────┬───────────┘  └───────────────────────────────┘   │
└─────────────┼───────────────────────────────────────────────────┘
              ▼
┌─────────────────────────┐
│   PostgreSQL Database   │
│   tables: users · notes │
└─────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| **Monorepo (pnpm workspaces)** | Shared Zod schemas between frontend and backend eliminate duplicated type definitions and prevent drift |
| **Cursor-based pagination** | Stable ordering even when notes are updated mid-scroll; encodes `{ updatedAt, id }` as base64url |
| **Optimistic UI** | `NotesContext` applies local state changes immediately and syncs with the server in the background — the UI never waits for a network round-trip |
| **HTTP-only cookies for JWTs** | Not accessible from JavaScript, preventing XSS token theft |
| **Drizzle ORM** | Fully type-safe SQL queries with no runtime schema mismatch; lightweight migrations via `drizzle-kit push` |
| **Resizable AI sidebar** | `react-resizable-panels` keeps the main editor undisturbed while the AI panel is open |
| **Socket.io presence rooms** | Rooms keyed by share token; viewer identity is ephemeral (no DB persistence), auto-cleaned on disconnect |
| **Zod env validation** | Server crashes at startup with a clear message if any required variable is missing or malformed — no silent failures |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | Next.js (App Router) | 16.2.6 |
| | React | 19.2.4 |
| | TypeScript | 5.x |
| | Tailwind CSS | 4.3.0 |
| | shadcn/ui | 4.7.0 |
| | Tiptap (rich-text editor) | 3.23.4 |
| | Recharts (charts) | 3.8.1 |
| | Socket.io-client | 4.8.3 |
| | react-resizable-panels | 4.11.1 |
| | Zod | 3.24.1 |
| **Backend** | Node.js + Express | 4.21.2 |
| | TypeScript + tsx | 5.6.3 |
| | Drizzle ORM + drizzle-kit | 0.41.0 |
| | jsonwebtoken | 9.0.3 |
| | bcryptjs | 3.0.3 |
| | Socket.io | 4.8.3 |
| | Zod | 3.24.1 |
| **Database** | PostgreSQL | 14+ |
| **AI Provider** | Mistral AI (via `@ai-sdk/mistral`) | — |
| **Shared package** | `@peblo/shared` — Zod schemas & inferred types | workspace |
| **Package manager** | pnpm workspaces | 9+ |

---

## Database Schema

### `users`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `name` | `text` | NOT NULL | Display name |
| `email` | `text` | NOT NULL, UNIQUE | Login identifier |
| `password_hash` | `text` | NOT NULL | bcrypt, 12 rounds |
| `created_at` | `timestamptz` | default `now()` | |

### `notes`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `user_id` | `uuid` | FK → `users.id` ON DELETE CASCADE | Owner |
| `title` | `text` | NOT NULL, default `''` | |
| `content` | `text` | NOT NULL, default `''` | Stored as Markdown |
| `tags` | `jsonb[]` | NOT NULL, default `'[]'` | Array of tag strings |
| `category` | `text` | nullable | Single category label |
| `visibility` | `text` | NOT NULL, default `'private'` | `'private'` or `'public'` |
| `share_link_permission` | `text` | NOT NULL, default `'none'` | `'none'`, `'view'`, or `'edit'` |
| `share_token` | `text` | UNIQUE, nullable | UUID; lazy-generated on first share |
| `is_archived` | `boolean` | NOT NULL, default `false` | |
| `ai_summary` | `text` | nullable | Persisted AI summary text |
| `ai_action_items` | `jsonb[]` | nullable | Array of action-item strings |
| `ai_generated_at` | `timestamptz` | nullable | Timestamp of last AI run |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Updated on every PATCH |

---

## API Reference

All private endpoints require a valid session cookie obtained from `/api/auth/login` or `/api/auth/signup`.

#### Standard response envelope

```jsonc
// Success
{ "success": true, "data": { ... } }

// Error
{
  "success": false,
  "error": {
    "name": "UNAUTHORIZED",      // machine-readable constant
    "code": 401,                 // HTTP status
    "message": "You must be logged in to access this resource."
  }
}
```

### Authentication

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | `{ name, email, password }` | Register; sets session cookie |
| `POST` | `/api/auth/login` | `{ email, password }` | Login; sets session cookie |
| `POST` | `/api/auth/logout` | — | Clears session cookie |
| `GET` | `/api/auth/me` | — | Returns the current authenticated user |
| `DELETE` | `/api/auth/account` | — | Permanently deletes account and all notes; clears cookie |

Password rules: ≥ 8 characters, at least 1 uppercase letter, at least 1 digit.

### Notes (requires auth)

| Method | Path | Query / Body | Description |
|---|---|---|---|
| `GET` | `/api/notes` | `?cursor=&limit=` | Paginated note list (default 25) |
| `POST` | `/api/notes` | `{ id?, title?, content?, tags?, category?, visibility? }` | Create note |
| `PATCH` | `/api/notes/:id` | Any subset of note fields | Partial update |
| `DELETE` | `/api/notes/:id` | — | Delete note |
| `POST` | `/api/notes/:id/summarize` | — | Trigger Mistral AI summarisation |

### Productivity Insights (requires auth)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/insights` | Returns computed stats across **all** the user's notes (no pagination limit) |

### Public Notes (no auth required)

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/api/public/notes/:token` | — | Fetch a publicly shared note |
| `PATCH` | `/api/public/notes/:token` | `{ title?, content? }` | Edit (only if permission = `'edit'`) |

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Returns `{ ok: true }` |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (`npm install -g pnpm`)
- **PostgreSQL** ≥ 14 running locally, or a hosted connection string
- A **Mistral AI** API key — the free tier at [console.mistral.ai](https://console.mistral.ai) is sufficient

### 1 — Clone the repository

```bash
git clone <your-repo-url>
cd peblo
```

### 2 — Install all dependencies

From the repo root (installs every workspace at once):

```bash
pnpm install
```

### 3 — Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in the values (see [Environment Variables](#environment-variables) for the full reference). At minimum you need:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/peblo
JWT_SECRET=<at-least-32-random-chars>
MISTRAL_API_KEY=<your-mistral-key>
```

Create the PostgreSQL database if it does not already exist:

```bash
createdb peblo
```

The frontend reads `NEXT_PUBLIC_API_URL` but defaults to `http://localhost:3001` in development. Create `frontend/.env.local` only if you change the backend port:

```env
NEXT_PUBLIC_API_URL=http://localhost:<your-port>
```

### 4 — Set up the database

```bash
# Push the Drizzle schema (creates tables)
cd backend && pnpm db:push

# Seed with demo user + 20 AI-research notes
pnpm db:seed
```

**Demo credentials after seeding:**

| Field | Value |
|---|---|
| Email | `demo@peblo.dev` |
| Password | `Demo1234!` |

---

## Environment Variables

### Backend — full reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | yes | — | `development` or `production` |
| `PORT` | yes | — | Port the Express server listens on |
| `CORS_ORIGIN` | yes | — | Allowed CORS origin (the frontend URL) |
| `DATABASE_URL` | yes | — | PostgreSQL connection string |
| `JWT_SECRET` | yes | — | Min 32 characters; signs and verifies JWTs |
| `MISTRAL_API_KEY` | yes | — | Mistral AI API key |
| `MISTRAL_MODEL` | no | `mistral-small-latest` | Mistral model ID |

All variables are validated at startup by a Zod schema. A missing or invalid value crashes the process with a descriptive error rather than failing silently at runtime.

---

## Running the Application

### Development — both servers at once

```bash
# From the repo root
pnpm dev
```

This starts:
- **Backend** on `http://localhost:3001` (tsx --watch, live reload)
- **Frontend** on `http://localhost:3000` (next dev, fast refresh)

### Development — individually

```bash
# Backend only
cd backend && pnpm dev

# Frontend only
cd frontend && pnpm dev
```

### Database utilities

```bash
cd backend

pnpm db:push    # Push schema changes to PostgreSQL (no migration files)
pnpm db:seed    # Load demo user + 20 notes
pnpm db:studio  # Open Drizzle Studio (browser-based DB explorer on :4983)
```

### Production build

```bash
# From repo root — builds shared → backend → frontend in dependency order
pnpm build

# Run backend
cd backend && node dist/server.js

# Run frontend
cd frontend && pnpm start
```

---

## Testing the Application

There is no automated test suite in the current submission. The following manual walkthrough covers every major feature:

### Authentication flow

1. Open `http://localhost:3000` — you are redirected to `/login`
2. Click **Sign up** and fill in name, email, and a password that meets the rules (≥ 8 chars, uppercase, digit)
3. You are redirected to `/dashboard`
4. Refresh — the session persists (HTTP-only cookie)
5. Click **Log out** in the sidebar → redirected to `/login`
6. Log back in with the same credentials

### Notes workflow

1. Navigate to `/notes`
2. Click **New Note** — an empty note opens in the editor
3. Type a title and body — watch "saving…" → "saved" in the toolbar
4. Click **Add tag** and press Enter to confirm; try adding 2–3 tags
5. Choose a category from the dropdown
6. Create 4–5 more notes across different topics
7. Type part of a title in the search box — the list filters instantly
8. Click a tag chip in the filter bar to narrow further
9. Hover a note card → click the archive icon — it disappears from the list
10. Go to `/archive` to see it; click **Restore** to bring it back

### AI summary generation

1. Open a note with several paragraphs
2. Click **AI** (sparkle icon) in the toolbar to open the AI sidebar
3. Click **Generate Summary** — a spinner appears while Mistral runs
4. The summary, action items, and suggested title appear in the panel
5. Reload the page and reopen the sidebar — the summary is still there (persisted in the DB)

### Search and filtering

1. Go to `/notes`
2. Search for a keyword — results update as you type
3. Click a tag in the filter bar — AND logic narrows the results
4. Open the sort dropdown and switch to **Title A–Z** — the list re-sorts
5. Clear filters with the × buttons

### Public sharing flow

1. Open any note and click the **Share** button (chain-link icon)
2. Select **View only** from the permission dropdown — a link is generated
3. Copy the link and open it in an incognito window — the note is visible without login
4. Switch the permission to **Can edit**, reopen the link, make a change, and save — changes persist
5. Set permission back to **None** — the link now returns a 403 error

### Dashboard insights

1. Navigate to `/dashboard`
2. Verify total notes, archived count, and this-week count in the stat cards
3. The bar chart shows per-day note creation for the last 7 days
4. The Top Tags section lists your most-used tags with counts
5. The AI Usage card shows how many notes have an AI summary
6. The Recent Notes list shows the 5 most recently modified notes

---

## Project Structure

```
peblo/
├── package.json              # Root workspace config (pnpm)
├── .env.example              # Root-level env template (for reference)
│
├── shared/                   # @peblo/shared — shared Zod schemas & TypeScript types
│   └── src/schemas/
│       ├── note.ts           # Note, UpdateNote, NoteVisibility, ShareLinkPermission
│       └── insights.ts       # ProductivityInsights, TagCount, WeeklyActivity, AIUsage
│
├── backend/
│   ├── .env.example          # Backend env template
│   └── src/
│       ├── server.ts         # HTTP + Socket.io bootstrap
│       ├── app.ts            # Express app, route mounting, middleware
│       ├── config/env.ts     # Zod env validation (crashes on bad config)
│       ├── db/
│       │   ├── schema.ts     # Drizzle table definitions (users, notes)
│       │   ├── index.ts      # pg Pool + Drizzle instance
│       │   └── seed.ts       # Demo user + 20 AI-research notes
│       ├── lib/
│       │   ├── AppError.ts   # Custom error class with static helpers
│       │   └── schemas.ts    # Zod request-body schemas
│       ├── middleware/
│       │   ├── auth.ts       # requireAuth — JWT → req.user
│       │   ├── validate.ts   # validateBody(schema)
│       │   └── errorHandler.ts # Maps errors → JSON responses
│       ├── realtime/
│       │   └── presence.ts   # Socket.io room management
│       ├── routes/
│       │   ├── auth.ts
│       │   ├── notes.ts
│       │   └── publicNotes.ts
│       └── services/
│           ├── auth.service.ts  # signup, login, verifyToken
│           └── notes.service.ts # CRUD, cursor pagination, AI summarisation
│
└── frontend/
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx                  # Redirects to /dashboard or /login
        │   ├── (auth)/
        │   │   ├── login/page.tsx
        │   │   └── signup/page.tsx
        │   ├── dashboard/
        │   │   ├── layout.tsx            # Sidebar + Header + providers wrapper
        │   │   └── page.tsx              # Dashboard stats grid
        │   ├── notes/
        │   │   ├── layout.tsx
        │   │   ├── page.tsx              # Note list + editor split view
        │   │   └── [noteId]/page.tsx     # Deeplinkable note URL
        │   ├── archive/page.tsx          # Archived notes list
        │   ├── shared/page.tsx           # User's shared notes list
        │   └── view/[token]/page.tsx     # Public shared note viewer
        ├── components/
        │   ├── ui/                       # shadcn/ui primitives
        │   ├── layout/
        │   │   ├── Sidebar.tsx           # Left nav
        │   │   └── Header.tsx            # Top bar
        │   ├── dashboard/
        │   │   ├── DashboardStats.tsx    # 4-stat card grid
        │   │   ├── StatCard.tsx
        │   │   ├── WeeklyActivity.tsx    # Recharts bar chart
        │   │   ├── RecentNotes.tsx
        │   │   ├── AIUsageCard.tsx
        │   │   └── TopTags.tsx
        │   └── notes/
        │       ├── NoteList.tsx          # Searchable, filterable list
        │       ├── NoteCard.tsx
        │       ├── NoteEditor.tsx        # Editor shell + toolbar
        │       ├── RichEditor.tsx        # Tiptap wrapper
        │       ├── EditorToolbar.tsx     # Formatting buttons
        │       ├── TagInput.tsx          # Tag selector with autocomplete
        │       ├── NoteAISidebar.tsx     # Resizable AI panel
        │       └── NoteSharePopover.tsx  # Share link configuration
        ├── contexts/
        │   ├── AuthContext.tsx           # User session state
        │   ├── NotesContext.tsx          # useReducer state machine for notes
        │   ├── SettingsContext.tsx       # Persisted user preferences
        │   └── TagColorContext.tsx       # Consistent tag colour assignment
        ├── hooks/
        │   └── usePresence.ts            # Socket.io viewer presence
        └── lib/
            ├── api/
            │   ├── client.ts             # Base fetch wrapper (shared cookie, error handling)
            │   ├── auth.ts               # Auth API calls
            │   └── notes.ts              # Notes API calls
            ├── editor-extensions.ts      # Tiptap extension bundle
            └── schemas/
                ├── note.ts
                └── insights.ts
```

---

## Sample Outputs

See [`docs/sample-outputs.md`](docs/sample-outputs.md) for:

- Example API responses (auth, notes CRUD, public share, AI summarisation)
- Full AI-generated output (summary, action items, suggested title)
- Database schema reference

---

## Optional Enhancements

| Enhancement | Status | Detail |
|---|---|---|
| Markdown preview | Implemented | Live Markdown serialisation in Tiptap via `tiptap-markdown` |
| Optimistic UI updates | Implemented | `NotesContext` updates local state before the server confirms |
| Dark mode | Implemented | Dark theme throughout (`#0e0e0e` sidebar, `#141313` main area) |
| Real-time collaboration (presence) | Partial | Viewer presence via Socket.io; simultaneous edits are awareness-only |
| Keyboard shortcuts | Partial | Tiptap standard shortcuts (Ctrl+B, Ctrl+I, etc.) active in editor |

---

## Demo Account

| Field | Value |
|---|---|
| Email | `demo@peblo.dev` |
| Password | `Demo1234!` |

The demo account comes pre-loaded with **20 detailed notes** on AI agents, RAG, multi-agent systems, LangGraph, vector databases, prompt engineering, and the future of AI-native development — spread across May 2026 to give the weekly chart realistic data.
