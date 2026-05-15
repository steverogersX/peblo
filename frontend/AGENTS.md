# Peblo Notes — Frontend Agent Guide

## Stack

| Tool | Version | Notes |
|------|---------|-------|
| Next.js | 16.2.6 | App Router only — no Pages Router |
| React | 19.2.4 | Server Components by default; add `"use client"` only when needed |
| TypeScript | 5.x | Strict mode |
| Tailwind CSS | 4.x | Configured via `globals.css` imports, not `tailwind.config.*` |
| shadcn/ui | 4.x | Components live in `src/components/ui/` |
| Tiptap | 3.x | Rich-text editor; extensions in `src/lib/editor-extensions.ts` |
| Recharts | 3.x | Charts used in dashboard widgets |
| Zod | — | Schema validation; schemas in `src/lib/schemas/` |
| lucide-react | 1.x | Icon library |

## Project Structure

```
src/
  app/
    layout.tsx          # Root layout (fonts: Inter + JetBrains Mono)
    globals.css         # Tailwind 4 + tw-animate-css + shadcn theme tokens
    page.tsx            # Landing / redirect page
    dashboard/
      layout.tsx        # Wraps DashboardProvider + Sidebar + Header
      page.tsx          # Dashboard overview grid
    notes/
      layout.tsx
      page.tsx          # Notes list + editor view
  components/
    ui/                 # shadcn primitives (button, card, badge, avatar, …)
    layout/
      Sidebar.tsx       # Left nav — links to /dashboard /notes /shared /archive /settings
      Header.tsx        # Top bar with page title
    dashboard/          # Dashboard-specific widgets
      DashboardStats.tsx
      StatCard.tsx
      WeeklyActivity.tsx  # Recharts bar chart
      RecentNotes.tsx
      AIUsageCard.tsx
      TopTags.tsx
    notes/              # Notes feature components
      NoteList.tsx
      NoteCard.tsx
      NoteEditor.tsx
      RichEditor.tsx    # Tiptap wrapper
      EditorToolbar.tsx
      TagInput.tsx
  contexts/
    DashboardContext.tsx  # useReducer-based context; exposes useDashboard()
  lib/
    utils.ts            # cn() helper (clsx + tailwind-merge)
    mock-data.ts        # MOCK_INSIGHTS — replace with API calls when backend is ready
    mock-notes.ts       # Mock notes data
    editor-extensions.ts # Tiptap extension bundle
    schemas/
      insights.ts       # Zod schemas + inferred types for ProductivityInsights
      note.ts           # Zod schemas + inferred types for notes
```

## UI Rules

- ONLY use shadcn/ui components — never build UI components from scratch
- ONLY use Tailwind CSS for styling — no custom CSS files
- ONLY use lucide-react for icons
- Follow React patterns: custom hooks for logic, composition over prop drilling, co-locate state as low as possible

## Conventions

### Server vs Client Components
- Default to Server Components. Add `"use client"` only when you need hooks, event handlers, or browser APIs.
- Context providers (`DashboardProvider`) must be client components — keep them as thin wrappers.

### Styling
- Use Tailwind utility classes directly; do not write custom CSS except in `globals.css`.
- Design language: dark theme with `#0e0e0e` sidebar, `#141313` main background, `#e5e2e1` primary text, `#8e9192` muted text, `#508eff` accent blue.
- Use `cn()` from `@/lib/utils` when conditionally combining classes.

### Schemas & Types
- Define data shapes with Zod in `src/lib/schemas/`, export both the schema and the inferred type.
- Do not duplicate types — import from the schema file.

### Data Fetching
- Dashboard data flows through `DashboardContext`. Components call `useDashboard()` — never fetch directly inside a widget.
- Backend is not yet wired up. `DashboardContext` currently resolves from `MOCK_INSIGHTS` after a simulated delay. Replace the `refresh()` body with a real `fetch()` call when the API is ready.

### Navigation
Sidebar routes: `/dashboard`, `/notes`, `/shared`, `/archive`, `/settings`

## Commands

```bash
# from frontend/
npm run dev      # dev server on http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

## What Is Not Done Yet
- Backend API integration (all data is mocked)
- Auth / user session (user is hardcoded as "John Doe / Free plan" in Sidebar)
- `/shared`, `/archive`, `/settings` routes (nav links exist, pages do not)
- Real note persistence (notes are in-memory mock data)
