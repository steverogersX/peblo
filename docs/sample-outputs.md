# Sample Outputs

Representative API responses, AI-generated content, database schema, and application screenshots for the Peblo Notes application.

---

## Screenshots

### Dashboard — Stats & Weekly Activity
![Dashboard stats and weekly activity chart](<../assets/peblo-notes (1).png>)

### Dashboard — Recent Notes, AI Usage & Top Tags
![Dashboard lower section showing recently edited notes, AI usage stats, and most-used tags](<../assets/peblo-notes (2).png>)

### Notes Workspace — Rich Text Editor
![Notes list and rich text editor with tags and category](<../assets/peblo-notes (3).png>)

### Notes Workspace — AI Sidebar (Summary & Action Items)
![Notes editor with AI sidebar open showing generated summary and action items](<../assets/peblo-notes (4).png>)

### Notes Workspace — Filter & Sort Popover
![Notes editor with filter and sort popover open](<../assets/peblo-notes (5).png>)

### Shared Notes Management
![Shared by me page showing publicly shared notes with access controls](<../assets/peblo-notes (6).png>)

### Settings — Account
![Settings page showing account details and danger zone](<../assets/peblo-notes (7).png>)

### Settings — User Menu
![Settings page with sidebar user menu open](<../assets/peblo-notes (8).png>)

### Notes Workspace — Share Popover
![Notes editor with share link popover showing access level options](<../assets/peblo-notes (9).png>)

---

## Authentication

### POST /api/auth/signup

**Request**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "Secure123"
}
```

**Response — 201 Created**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "createdAt": "2026-05-16T10:22:00.000Z"
    }
  }
}
```

A `Set-Cookie` header is included in the response with an HTTP-only, `sameSite=lax` JWT cookie valid for 7 days.

---

### POST /api/auth/login

**Request**
```json
{
  "email": "jane@example.com",
  "password": "Secure123"
}
```

**Response — 200 OK**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "createdAt": "2026-05-16T10:22:00.000Z"
    }
  }
}
```

---

### GET /api/auth/me

**Response — 200 OK**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "createdAt": "2026-05-16T10:22:00.000Z"
    }
  }
}
```

---

### DELETE /api/auth/account

Permanently deletes the authenticated user's account and all their notes (cascade). Clears the session cookie.

**Response — 200 OK**
```json
{
  "success": true
}
```

The client is redirected to `/login` after this call because the session cookie is cleared and `AuthContext` sets `user` to `null`.

---

## Notes

### GET /api/notes

**Response — 200 OK**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "note-001-uuid",
        "title": "Sprint Planning Notes",
        "content": "## Goals\n\nDeliver the auth module by Friday...",
        "tags": ["work", "planning", "sprint"],
        "category": "Engineering",
        "visibility": "private",
        "shareLinkPermission": "none",
        "shareToken": null,
        "isArchived": false,
        "aiSummary": null,
        "aiActionItems": null,
        "aiGeneratedAt": null,
        "createdAt": "2026-05-14T09:00:00.000Z",
        "updatedAt": "2026-05-15T14:30:00.000Z"
      },
      {
        "id": "note-002-uuid",
        "title": "Book Notes — Thinking Fast and Slow",
        "content": "## Key Ideas\n\nSystem 1 vs System 2 thinking...",
        "tags": ["reading", "psychology"],
        "category": "Personal",
        "visibility": "public",
        "shareLinkPermission": "view",
        "shareToken": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "isArchived": false,
        "aiSummary": "A personal reading guide covering Daniel Kahneman's dual-process theory...",
        "aiActionItems": ["Re-read chapter 3 on anchoring", "Apply framing effect analysis to next decision"],
        "aiGeneratedAt": "2026-05-15T11:00:00.000Z",
        "createdAt": "2026-05-10T08:00:00.000Z",
        "updatedAt": "2026-05-15T11:00:00.000Z"
      }
    ],
    "nextCursor": "eyJ1cGRhdGVkQXQiOiIyMDI2LTA1LTE0VDA5OjAwOjAwLjAwMFoiLCJpZCI6Im5vdGUtMDAxLXV1aWQifQ==",
    "hasMore": true
  }
}
```

The `nextCursor` is a base64url-encoded `{ updatedAt, id }` pair. Pass it as `?cursor=<value>` to fetch the next page.

---

### POST /api/notes

**Request**
```json
{
  "title": "Project Planning",
  "content": "## Kickoff\n\nLet's align on the Q3 roadmap...",
  "tags": ["work", "planning"],
  "category": "Engineering"
}
```

**Response — 201 Created**
```json
{
  "success": true,
  "data": {
    "note": {
      "id": "note-003-uuid",
      "title": "Project Planning",
      "content": "## Kickoff\n\nLet's align on the Q3 roadmap...",
      "tags": ["work", "planning"],
      "category": "Engineering",
      "visibility": "private",
      "shareLinkPermission": "none",
      "shareToken": null,
      "isArchived": false,
      "aiSummary": null,
      "aiActionItems": null,
      "aiGeneratedAt": null,
      "createdAt": "2026-05-16T10:45:00.000Z",
      "updatedAt": "2026-05-16T10:45:00.000Z"
    }
  }
}
```

---

### PATCH /api/notes/:id

**Request** (partial update — any subset of fields)
```json
{
  "title": "Q3 Project Planning",
  "tags": ["work", "planning", "q3"]
}
```

**Response — 200 OK**
```json
{
  "success": true,
  "data": {
    "note": {
      "id": "note-003-uuid",
      "title": "Q3 Project Planning",
      "content": "## Kickoff\n\nLet's align on the Q3 roadmap...",
      "tags": ["work", "planning", "q3"],
      "category": "Engineering",
      "visibility": "private",
      "shareLinkPermission": "none",
      "shareToken": null,
      "isArchived": false,
      "aiSummary": null,
      "aiActionItems": null,
      "aiGeneratedAt": null,
      "createdAt": "2026-05-16T10:45:00.000Z",
      "updatedAt": "2026-05-16T10:47:33.000Z"
    }
  }
}
```

---

### Enabling share link (PATCH /api/notes/:id)

**Request**
```json
{
  "shareLinkPermission": "view"
}
```

**Response — 200 OK** (share token generated automatically)
```json
{
  "success": true,
  "data": {
    "note": {
      "id": "note-003-uuid",
      "title": "Q3 Project Planning",
      "visibility": "public",
      "shareLinkPermission": "view",
      "shareToken": "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
      "updatedAt": "2026-05-16T10:50:00.000Z"
    }
  }
}
```

---

## Productivity Insights

### GET /api/insights

Returns stats computed across **all** of the user's notes server-side (no pagination limit), so the dashboard always reflects accurate totals even for large accounts.

**Response — 200 OK**
```json
{
  "success": true,
  "data": {
    "insights": {
      "totalNotes": 23,
      "archivedNotes": 3,
      "notesThisWeek": 5,
      "wordsWritten": 14280,
      "recentlyEditedNotes": [
        { "id": "note-001-uuid", "title": "Sprint Planning Notes", "updatedAt": "2026-05-16T10:47:33.000Z" },
        { "id": "note-002-uuid", "title": "Book Notes — Thinking Fast and Slow", "updatedAt": "2026-05-15T11:00:00.000Z" },
        { "id": "note-003-uuid", "title": "Q3 Roadmap Draft", "updatedAt": "2026-05-14T09:30:00.000Z" },
        { "id": "note-004-uuid", "title": "Meeting Notes — May 13", "updatedAt": "2026-05-13T16:20:00.000Z" },
        { "id": "note-005-uuid", "title": "Ideas Backlog", "updatedAt": "2026-05-12T08:45:00.000Z" }
      ],
      "mostUsedTags": [
        { "tag": "work", "count": 11 },
        { "tag": "planning", "count": 7 },
        { "tag": "ai-agents", "count": 5 },
        { "tag": "reading", "count": 3 },
        { "tag": "personal", "count": 2 }
      ],
      "aiUsage": {
        "totalRequests": 8,
        "thisWeek": 3,
        "thisMonth": 8
      },
      "weeklyActivity": [
        { "date": "Sat", "notesCreated": 1, "notesEdited": 2 },
        { "date": "Sun", "notesCreated": 0, "notesEdited": 0 },
        { "date": "Mon", "notesCreated": 2, "notesEdited": 3 },
        { "date": "Tue", "notesCreated": 1, "notesEdited": 1 },
        { "date": "Wed", "notesCreated": 0, "notesEdited": 4 },
        { "date": "Thu", "notesCreated": 1, "notesEdited": 2 },
        { "date": "Fri", "notesCreated": 1, "notesEdited": 1 }
      ]
    }
  }
}
```

---

## AI Summarisation

### POST /api/notes/:id/summarize

**Input note content (Markdown)**
```markdown
## Weekly Project Standup — May 12

Today the team discussed the auth module progress. Backend JWT implementation
is complete and tested. Frontend login and signup forms are live but the
session refresh flow still has a bug where tokens expire silently.

The dashboard needs the weekly chart wired up to real data — currently showing
mock data from `lib/mock-data.ts`.

On the AI side, the Mistral integration works end-to-end but we haven't handled
the case where the user's API key has run out of quota.

Action item: Sara will investigate the silent token expiry bug before Thursday.
Action item: Marcus will replace mock dashboard data with the real insights API.
Action item: Priya will add a rate-limit error banner for the AI summary flow.
```

**Response — 200 OK**
```json
{
  "success": true,
  "data": {
    "note": {
      "id": "note-001-uuid",
      "title": "Weekly Project Standup — May 12",
      "aiSummary": "This note captures a weekly engineering standup covering three active work streams. The backend auth (JWT) is complete, while the frontend has a known session-refresh bug causing silent token expiry. The dashboard is still using mock data and needs to be connected to the real insights API endpoint. The AI summarisation feature works end-to-end but lacks error handling for quota exhaustion. Three clear owners and deadlines were assigned to address these gaps before Thursday.",
      "aiActionItems": [
        "Investigate silent token expiry bug in the frontend session-refresh flow (Sara, by Thursday)",
        "Replace mock dashboard data with the real /api/insights endpoint (Marcus)",
        "Add a user-facing rate-limit error banner to the AI summary feature (Priya)"
      ],
      "aiGeneratedAt": "2026-05-16T11:02:44.000Z",
      "updatedAt": "2026-05-16T11:02:44.000Z"
    },
    "suggestedTitle": "Standup — May 12: Auth bug, dashboard data, AI quota handling"
  }
}
```

The `suggestedTitle` is returned alongside the updated note but is not automatically applied — the user can accept it with one click in the AI sidebar.

---

## Public Share

### GET /api/public/notes/:token

Accessible without a session cookie. The `shareToken` field is stripped from the response to prevent token leakage.

**Response — 200 OK**
```json
{
  "success": true,
  "data": {
    "note": {
      "id": "note-002-uuid",
      "title": "Book Notes — Thinking Fast and Slow",
      "content": "## Key Ideas\n\nSystem 1 vs System 2 thinking...",
      "tags": ["reading", "psychology"],
      "category": "Personal",
      "visibility": "public",
      "shareLinkPermission": "view",
      "isArchived": false,
      "aiSummary": "A personal reading guide covering Daniel Kahneman's dual-process theory...",
      "aiActionItems": ["Re-read chapter 3 on anchoring"],
      "aiGeneratedAt": "2026-05-15T11:00:00.000Z",
      "createdAt": "2026-05-10T08:00:00.000Z",
      "updatedAt": "2026-05-15T11:00:00.000Z",
      "ownerName": "Jane Smith"
    }
  }
}
```

---

## Error Responses

### 401 Unauthorized — missing or invalid session

```json
{
  "success": false,
  "error": {
    "name": "UNAUTHORIZED",
    "code": 401,
    "message": "You must be logged in to access this resource."
  }
}
```

### 403 Forbidden — note not owned by user / share link disabled

```json
{
  "success": false,
  "error": {
    "name": "FORBIDDEN",
    "code": 403,
    "message": "This note is not publicly accessible."
  }
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": {
    "name": "NOT_FOUND",
    "code": 404,
    "message": "Note not found."
  }
}
```

### 409 Conflict — duplicate email on signup

```json
{
  "success": false,
  "error": {
    "name": "CONFLICT",
    "code": 409,
    "message": "A user with this email already exists."
  }
}
```

### 429 Rate Limit — Mistral quota exhausted

```json
{
  "success": false,
  "error": {
    "name": "AI_RATE_LIMITED",
    "code": 429,
    "message": "AI service rate limit reached. Please wait a moment and try again."
  }
}
```

### 504 Gateway Timeout — Mistral too slow

```json
{
  "success": false,
  "error": {
    "name": "AI_TIMEOUT",
    "code": 504,
    "message": "AI service timed out. Please try again."
  }
}
```

---

## Database Schema (SQL)

```sql
CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notes (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title                 TEXT        NOT NULL DEFAULT '',
  content               TEXT        NOT NULL DEFAULT '',
  tags                  JSONB[]     NOT NULL DEFAULT '{}',
  category              TEXT,
  visibility            TEXT        NOT NULL DEFAULT 'private',
  share_link_permission TEXT        NOT NULL DEFAULT 'none',
  share_token           TEXT        UNIQUE,
  is_archived           BOOLEAN     NOT NULL DEFAULT false,
  ai_summary            TEXT,
  ai_action_items       JSONB[],
  ai_generated_at       TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

The `visibility` column is derived automatically when `share_link_permission` changes: setting permission to `'view'` or `'edit'` sets visibility to `'public'`; setting it back to `'none'` resets visibility to `'private'`.
