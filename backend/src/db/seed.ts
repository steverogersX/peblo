import "dotenv/config";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "./index";
import { notes, users } from "./schema";
import { eq } from "drizzle-orm";

const SEED_EMAIL = "seed@peblo.dev";
const SEED_PASSWORD = "Seed1234";

const SEED_NOTES_DATA = [
  {
    id: randomUUID(),
    title: "Sprint Planning — May 2026",
    content:
      "## Goals\n\n- Ship authentication flow\n- Complete notes CRUD\n- Add AI summary feature\n\n## Action Items\n\n1. Set up Prisma schema\n2. Implement JWT auth middleware\n3. Build note editor UI\n4. Wire up AI summary endpoint\n\n## Notes\n\nTarget velocity is 32 story points. Carry-over from last sprint: 5 points.",
    tags: ["work", "meeting"],
    category: "Work",
    visibility: "private" as const,
    isArchived: false,
    createdAt: new Date("2026-05-14T10:00:00Z"),
    updatedAt: new Date("2026-05-14T10:00:00Z"),
  },
  {
    id: randomUUID(),
    title: "API Architecture Review",
    content:
      "## REST vs tRPC Decision\n\nAfter evaluating both approaches, we're going with REST + Zod for the public API surface.\n\n**Reasons:**\n- Easier for external consumers\n- Works better with existing tooling\n- tRPC overhead for a small team isn't justified\n\n## Endpoints Draft\n\n- POST /auth/signup\n- POST /auth/login\n- GET /notes\n- POST /notes\n- PATCH /notes/:id\n- DELETE /notes/:id",
    tags: ["work", "research"],
    category: "Technical",
    visibility: "private" as const,
    isArchived: false,
    createdAt: new Date("2026-05-14T08:30:00Z"),
    updatedAt: new Date("2026-05-14T08:30:00Z"),
  },
  {
    id: randomUUID(),
    title: "User Research Findings",
    content:
      "## Key Insights from 12 interviews\n\n1. Users want keyboard-first navigation\n2. Auto-save is a hard requirement — people distrust manual save\n3. Tag management should be frictionless (type and press enter)\n4. Dark mode is strongly preferred by 9/12 participants\n\n## Pain points with existing tools\n\n- Notion is too complex for quick capture\n- Apple Notes lacks organisation\n- Obsidian has steep learning curve",
    tags: ["research", "product"],
    category: "Research",
    visibility: "private" as const,
    isArchived: false,
    createdAt: new Date("2026-05-13T17:45:00Z"),
    updatedAt: new Date("2026-05-13T17:45:00Z"),
  },
  {
    id: randomUUID(),
    title: "Onboarding Flow Ideas",
    content:
      "## Draft flow\n\n1. Email + password signup\n2. Name prompt\n3. Create first note immediately (no dashboard first)\n4. Tooltip tour on first note\n5. AI summary nudge after 200+ words\n\n## Open questions\n\n- Should we gate AI features behind email verification?\n- Skip button for experienced users?",
    tags: ["product", "ideas"],
    category: "Product",
    visibility: "public" as const,
    isArchived: false,
    createdAt: new Date("2026-05-13T14:00:00Z"),
    updatedAt: new Date("2026-05-13T14:00:00Z"),
  },
  {
    id: randomUUID(),
    title: "Weekly Retro — May 12",
    content:
      "## What went well\n\n- Shipped the dashboard UI ahead of schedule\n- Good design alignment session\n- No major blockers\n\n## What didn't\n\n- Recharts integration took longer than expected\n- Context structure was redesigned mid-sprint\n\n## Action items\n\n- Write better estimates for UI work\n- Document context patterns in CLAUDE.md",
    tags: ["work", "meeting"],
    category: "Work",
    visibility: "private" as const,
    isArchived: false,
    createdAt: new Date("2026-05-12T09:00:00Z"),
    updatedAt: new Date("2026-05-12T09:00:00Z"),
  },
  {
    id: randomUUID(),
    title: "Reading List — Q2 2026",
    content:
      "## Currently reading\n\n- The Pragmatic Programmer (Andrew Hunt)\n- Shape Up (Ryan Singer)\n\n## Queue\n\n- Staff Engineer (Will Larson)\n- An Elegant Puzzle (Will Larson)\n- A Philosophy of Software Design (John Ousterhout)\n\n## Completed\n\n- Clean Architecture ✓\n- Designing Data-Intensive Applications ✓",
    tags: ["personal", "learning"],
    category: "Personal",
    visibility: "private" as const,
    isArchived: false,
    createdAt: new Date("2026-05-10T20:00:00Z"),
    updatedAt: new Date("2026-05-10T20:00:00Z"),
  },
  {
    id: randomUUID(),
    title: "Old Competitor Analysis",
    content:
      "## Summary\n\nInitial competitor research from Q1. Superseded by the updated analysis.\n\n- Notion: richest feature set, complex pricing\n- Bear: great for personal use, no web version\n- Obsidian: power users, steep learning curve\n- Craft: iOS-first, beautiful but limited on web",
    tags: ["research", "product"],
    category: "Research",
    visibility: "private" as const,
    isArchived: true,
    createdAt: new Date("2026-03-10T09:00:00Z"),
    updatedAt: new Date("2026-03-18T14:00:00Z"),
  },
  {
    id: randomUUID(),
    title: "Q1 Goals — Carried Over",
    content:
      "## Goals that didn't ship\n\n- Collaborative editing (moved to Q3)\n- Mobile app MVP (deprioritised)\n- Public API (still in design)\n\nArchived after Q1 review. See updated roadmap for current priorities.",
    tags: ["work"],
    category: "Work",
    visibility: "private" as const,
    isArchived: true,
    createdAt: new Date("2026-01-02T08:00:00Z"),
    updatedAt: new Date("2026-03-31T17:00:00Z"),
  },
  {
    id: randomUUID(),
    title: "Draft: Pricing Page Copy",
    content:
      "## Early draft\n\nThis was an early brainstorm for the pricing page. Replaced by the version in Figma.\n\n**Free tier:** 50 notes, 5 AI summaries/month\n**Pro:** Unlimited notes, 100 AI summaries, shared workspaces — $8/mo",
    tags: ["product", "ideas"],
    category: "Product",
    visibility: "private" as const,
    isArchived: true,
    createdAt: new Date("2026-04-05T11:00:00Z"),
    updatedAt: new Date("2026-04-20T10:00:00Z"),
  },
];

async function seed() {
  console.log("Seeding database...");

  // Upsert seed user
  let [seedUser] = await db.select().from(users).where(eq(users.email, SEED_EMAIL)).limit(1);
  if (!seedUser) {
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);
    [seedUser] = await db
      .insert(users)
      .values({ name: "Seed User", email: SEED_EMAIL, passwordHash })
      .returning();
  }

  await db.delete(notes).where(eq(notes.userId, seedUser.id));
  await db.insert(notes).values(SEED_NOTES_DATA.map((n) => ({ ...n, userId: seedUser.id })));
  console.log(`Inserted ${SEED_NOTES_DATA.length} notes for seed user (${SEED_EMAIL}).`);
  console.log(`Seed user password: ${SEED_PASSWORD}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
