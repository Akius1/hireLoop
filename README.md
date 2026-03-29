# HireLoop — AI-Powered Hiring Pipeline on Notion

> Built for the [Notion AI Challenge](https://events.mlh.io/events/13841-the-notion-ai-challenge) · Major League Hacking × Notion

**Live Demo: [https://hire-loop-nine.vercel.app/](https://hire-loop-nine.vercel.app/)**

HireLoop turns your Notion workspace into a fully autonomous hiring system. Candidates apply, get screened by Claude AI in seconds, are automatically logged to a Notion database, and flow through a drag-and-drop kanban pipeline — all without a recruiter touching a thing until it actually matters.

---

## The Problem

Hiring is broken in small teams. Resumes pile up in inboxes, spreadsheets get stale, and by the time a recruiter reads a CV, the best candidates have already accepted another offer.

Most AI tools try to solve this by adding yet another dashboard disconnected from where your team actually works.

**HireLoop puts the pipeline inside Notion** — where your team already lives.

---

## How It Works

```
Candidate submits → Claude screens resume → Score + summary written to Notion →
Recruiter reviews dashboard → Drags card to next stage → Notion updates in real-time
```

### 1. Multi-format Application Intake
Candidates can apply three ways — upload a PDF resume, paste a LinkedIn/portfolio URL, or paste resume text directly. PDFs are parsed server-side using `pdfjs-dist` and the raw text is forwarded to Claude for screening.

### 2. Claude AI Screening (instant, structured)
Each submission is scored 0–100 by `claude-haiku-4-5` against the target role. The model returns:
- A numeric match score
- A 3-sentence fit summary
- Up to 5 detected skills

The result is written synchronously before the candidate sees their score, so Notion is always the source of truth.

### 3. Notion as the Backend
Every candidate is a Notion database page with structured properties:

| Property | Type | Description |
|---|---|---|
| Name | Title | Candidate full name |
| Role | Select | Position applied for |
| Status | Select | Pipeline stage |
| AI Score | Number | Claude's 0–100 match score |
| AI Summary | Rich Text | Claude's fit summary |
| Skills | Multi-select | Extracted skill tags |
| Applied At | Date | Submission timestamp |

Recruiters can query, filter, sort, and build custom views directly in Notion — no separate CRM needed.

### 4. Kanban Dashboard
A real-time pipeline board mirrors the Notion database across 6 stages: **Applied → Screened → Interview → Offer → Hired → Rejected**. Cards can be:
- Dragged between columns (updates Notion instantly via PATCH)
- Clicked to open a detail view with AI summary, skills, and actions
- Promoted or declined with one click

### 5. AI Interview Questions
For any candidate in the pipeline, recruiters can generate 5 tailored interview questions on demand. Claude uses the candidate's role, AI summary, and detected skills to produce questions specific to that person — not generic templates.

### 6. Automated Confirmation Email
Candidates receive a branded email (via Resend) with their AI match score, skill breakdown, and a "Top Match 🔥" badge if they score ≥ 85.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 + React 19 (App Router) |
| AI | Anthropic Claude (`claude-haiku-4-5`) via `@anthropic-ai/sdk` |
| Database / Backend | Notion API (`@notionhq/client`) |
| PDF Parsing | `pdfjs-dist` v5 (server-side) |
| Email | Resend |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/your-username/hireloop
cd hireloop
npm install
```

### 2. Create a Notion database

Create a Notion database with the following properties (exact names and types matter):

| Property Name | Type |
|---|---|
| Name | Title |
| Role | Select |
| Status | Select |
| AI Score | Number |
| AI Summary | Rich Text |
| Skills | Multi-select |
| Resume Link | URL |
| Applied At | Date |

Create a Notion integration at [notion.so/my-integrations](https://www.notion.so/my-integrations), share the database with it, and copy the database ID from the URL (`notion.so/<workspace>/<DATABASE_ID>?v=...`).

### 3. Environment variables

Create `.env.local`:

```env
NOTION_API_KEY=secret_...
NOTION_DATABASE_ID=...
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
```

### 4. Run

```bash
npm run dev
# → http://localhost:3000
```

- `/apply` — candidate-facing application form
- `/dashboard` — recruiter pipeline board

---

## Project Structure

```
src/
├── app/
│   ├── apply/page.tsx               # Candidate application form
│   ├── dashboard/page.tsx           # Recruiter kanban board
│   └── api/
│       ├── parse-pdf/route.ts       # Server-side PDF text extraction
│       ├── screen/route.ts          # Claude screening + Notion write
│       ├── candidates/route.ts      # GET + PATCH pipeline candidates
│       └── interview-questions/     # On-demand AI interview questions
└── lib/
    ├── notion.ts                    # Notion client + CRUD helpers
    └── email.ts                     # Resend email template
```

---

## Why This Stands Out

**Notion is the entire backend.** There's no secondary database, no ORM, no migrations. Every write goes to Notion, every read comes from Notion. Open the Notion database alongside the dashboard and they're always in sync — because they're the same data.

**The AI does the boring work first.** A recruiter opening the dashboard for the first time already has every candidate scored, summarised, and tagged. The AI Review Queue surfaces high-scorers (≥70) still in "Applied" so no strong candidate gets lost.

**Zero friction for candidates.** The apply form works without an account, handles PDF upload or plain text, and returns instant AI feedback — making it viable as a real public application portal, not just a demo.

---

## Demo Flow

1. Go to `/apply`, submit a resume PDF for "Frontend Engineer"
2. See the AI score, summary, and detected skills appear in seconds
3. Open `/dashboard` — the candidate is already in the **Applied** column
4. Open your Notion database — the page is there with all properties populated
5. Drag the card to **Interview** — Notion updates immediately
6. Click the card → **Generate AI Interview Questions** → 5 tailored questions appear

---

Built with Claude AI × Notion × Next.js
