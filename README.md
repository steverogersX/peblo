# Peblo

A notes app with AI-powered summaries, action item extraction, and title suggestions.

## Demo Account

| Field    | Value          |
|----------|----------------|
| Email    | demo@peblo.dev |
| Password | Demo1234!      |

The demo account is pre-loaded with **20 detailed notes** covering AI agents, swarms, RAG, vector databases, LangGraph, multi-agent systems, prompt engineering, agent safety, and the future of AI-native software development — spread across May 1–20, 2026.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL

### Install

```bash
pnpm install
```

### Environment

Copy and fill in the backend env:

```bash
cp backend/.env.example backend/.env
```

Required variables:

```
DATABASE_URL=postgresql://user:password@localhost:5432/peblo
JWT_SECRET=your-secret
MISTRAL_API_KEY=your-mistral-key   # for AI summaries
```

### Database

```bash
pnpm --filter @peblo/backend db:push   # apply schema
pnpm --filter @peblo/backend db:seed   # seed demo user + 20 notes
```

### Run

```bash
pnpm dev   # starts backend (port 3001) and frontend (port 3000) concurrently
```

## Seed Notes Topics

The demo account contains detailed notes on:

1. What Are AI Agents? A Primer
2. ReAct Pattern — Reasoning + Acting in Agents
3. RAG — Retrieval-Augmented Generation Deep Dive
4. Multi-Agent Systems and Swarms
5. Agent Memory: Types and Implementation
6. Tool Use and Function Calling in LLMs
7. How AI Agents Changed Software Development
8. Agentic Coding Tools — Landscape Review 2026
9. RAG vs Fine-Tuning: When to Use What
10. Prompt Engineering for Agent Systems
11. Evaluating AI Agents: Metrics and Frameworks
12. Agent Orchestration with LangGraph
13. Vector Databases Compared: pgvector vs Pinecone vs Qdrant
14. Human-in-the-Loop: Where Agents Need to Pause
15. The Rise of Autonomous Software Engineers
16. Building Production RAG: Lessons Learned
17. CrewAI: Role-Based Multi-Agent Teams
18. Agent Safety and Guardrails in Production
19. Agentic Workflows: End-to-End Design Patterns
20. The Future of Software: AI-Native Development
