import type { Note } from "@/lib/schemas/note";

export const MOCK_NOTES: Note[] = [
  {
    id: "note-1",
    title: "Sprint Planning — May 2026",
    content:
      "## Goals\n\n- Ship authentication flow\n- Complete notes CRUD\n- Add AI summary feature\n\n## Action Items\n\n1. Set up Prisma schema\n2. Implement JWT auth middleware\n3. Build note editor UI\n4. Wire up AI summary endpoint\n\n## Notes\n\nTarget velocity is 32 story points. Carry-over from last sprint: 5 points.",
    tags: ["work", "meeting"],
    category: "Work",
    visibility: "private",
    isArchived: false,
    createdAt: "2026-05-14T10:00:00Z",
    updatedAt: "2026-05-14T10:00:00Z",
  },
  {
    id: "note-2",
    title: "API Architecture Review",
    content:
      "## REST vs tRPC Decision\n\nAfter evaluating both approaches, we're going with REST + Zod for the public API surface.\n\n**Reasons:**\n- Easier for external consumers\n- Works better with existing tooling\n- tRPC overhead for a small team isn't justified\n\n## Endpoints Draft\n\n- POST /auth/signup\n- POST /auth/login\n- GET /notes\n- POST /notes\n- PATCH /notes/:id\n- DELETE /notes/:id",
    tags: ["work", "research"],
    category: "Technical",
    visibility: "private",
    isArchived: false,
    createdAt: "2026-05-14T08:30:00Z",
    updatedAt: "2026-05-14T08:30:00Z",
  },
  {
    id: "note-3",
    title: "User Research Findings",
    content:
      "## Key Insights from 12 interviews\n\n1. Users want keyboard-first navigation\n2. Auto-save is a hard requirement — people distrust manual save\n3. Tag management should be frictionless (type and press enter)\n4. Dark mode is strongly preferred by 9/12 participants\n\n## Pain points with existing tools\n\n- Notion is too complex for quick capture\n- Apple Notes lacks organisation\n- Obsidian has steep learning curve",
    tags: ["research", "product"],
    category: "Research",
    visibility: "private",
    isArchived: false,
    createdAt: "2026-05-13T17:45:00Z",
    updatedAt: "2026-05-13T17:45:00Z",
  },
  {
    id: "note-4",
    title: "Onboarding Flow Ideas",
    content:
      "## Draft flow\n\n1. Email + password signup\n2. Name prompt\n3. Create first note immediately (no dashboard first)\n4. Tooltip tour on first note\n5. AI summary nudge after 200+ words\n\n## Open questions\n\n- Should we gate AI features behind email verification?\n- Skip button for experienced users?",
    tags: ["product", "ideas"],
    category: "Product",
    visibility: "public",
    isArchived: false,
    createdAt: "2026-05-13T14:00:00Z",
    updatedAt: "2026-05-13T14:00:00Z",
  },
  {
    id: "note-5",
    title: "Weekly Retro — May 12",
    content:
      "## What went well\n\n- Shipped the dashboard UI ahead of schedule\n- Good design alignment session\n- No major blockers\n\n## What didn't\n\n- Recharts integration took longer than expected\n- Context structure was redesigned mid-sprint\n\n## Action items\n\n- Write better estimates for UI work\n- Document context patterns in CLAUDE.md",
    tags: ["work", "meeting"],
    category: "Work",
    visibility: "private",
    isArchived: false,
    createdAt: "2026-05-12T09:00:00Z",
    updatedAt: "2026-05-12T09:00:00Z",
  },
  {
    id: "note-6",
    title: "Reading List — Q2 2026",
    content:
      "## Currently reading\n\n- The Pragmatic Programmer (Andrew Hunt)\n- Shape Up (Ryan Singer)\n\n## Queue\n\n- Staff Engineer (Will Larson)\n- An Elegant Puzzle (Will Larson)\n- A Philosophy of Software Design (John Ousterhout)\n\n## Completed\n\n- Clean Architecture ✓\n- Designing Data-Intensive Applications ✓",
    tags: ["personal", "learning"],
    category: "Personal",
    visibility: "private",
    isArchived: false,
    createdAt: "2026-05-10T20:00:00Z",
    updatedAt: "2026-05-10T20:00:00Z",
  },
];
