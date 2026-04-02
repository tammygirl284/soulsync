# SoulSync

The control room for Anne, running on Pinocchio.

**SoulSync** is the dashboard layer on top of Anne (your AI Chief of Staff).  
Anne runs on Pinocchio (Mac Mini M4) via n8n. SoulSync lets you see what Anne  
is tracking, add/update records, manage her tools, and keep her system prompt in sync.

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (utility classes + global CSS for shared components)
- **Airtable REST API** (Anne OS base: `app0QFzXHkZ6MeiO1`)
- **Vercel** (deployment target: `soulsync.vercel.app`)

---

## Local setup

```bash
# 1. Clone or copy this folder to Pinocchio
cd ~/Projects
# (paste the soulsync folder here)

# 2. Install dependencies
cd soulsync
npm install

# 3. Configure environment
cp .env.local.example .env.local
# Edit .env.local and add your Airtable PAT

# 4. Run dev server
npm run dev
# → http://localhost:3000
```

---

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_AIRTABLE_BASE_ID` | Anne OS base ID — already set to `app0QFzXHkZ6MeiO1` |
| `AIRTABLE_API_KEY` | Your Airtable Personal Access Token |

> **Local dev:** You can use `NEXT_PUBLIC_AIRTABLE_API_KEY` for convenience.  
> **Production:** Move to a server-side env var and proxy through `/src/app/api/` route handlers so the key never reaches the browser.

Get your PAT at [airtable.com/create/tokens](https://airtable.com/create/tokens).  
Needs **read/write** scope on the **Anne OS** base.

---

## Project structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout — sidebar + main
│   ├── globals.css         # All shared styles (nav, tabs, cards, buttons)
│   ├── page.tsx            # Today (home)
│   ├── projects/page.tsx   # 14 real projects — Blinklife card grid
│   ├── loops/page.tsx      # Open Loops — live Airtable CRUD
│   ├── actions/page.tsx    # Action Items — live Airtable CRUD
│   ├── sessions/page.tsx   # Sessions — live Airtable read
│   ├── people/page.tsx     # People — live Airtable read
│   ├── tools/page.tsx      # Tools Generator — copy block for n8n
│   ├── prompt/page.tsx     # System Prompt viewer
│   └── settings/page.tsx   # API key + base config
├── components/
│   ├── Sidebar.tsx         # Left nav — exact Blinklife style
│   └── ui/index.tsx        # Shared: PageHeader, TabBar, Modal, Field, Empty, etc.
└── lib/
    ├── airtable.ts         # Fetch helper + TypeScript types
    ├── projects.ts         # Static project data
    └── toolsBlock.ts       # Anne's TOOLS prompt block
```

---

## Deploy to Vercel

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy from the project root
vercel

# Follow prompts:
# - Project name: soulsync
# - Framework: Next.js (auto-detected)
# - Add env vars in Vercel dashboard: AIRTABLE_API_KEY
```

Production URL target: `soulsync.vercel.app`

---

## Anne's Tools — the one step that makes her autonomous

After deploying, go to **Tools Generator** in the sidebar:
1. Copy the `## TOOLS` block
2. Open n8n → Anne workflow → AI Agent node
3. Paste it at the end of the System Prompt
4. Save + re-activate

That's what gives Anne the ability to create and update Airtable records without you touching it.

---

## Merging into Tammy's Hub (later)

When SoulSync stabilizes, move pages into `tammy-hub`:

```bash
# Copy pages
cp -r soulsync/src/app/loops    tammy-hub/src/app/anne/loops
cp -r soulsync/src/app/actions  tammy-hub/src/app/anne/actions
# etc.

# Copy lib
cp soulsync/src/lib/airtable.ts  tammy-hub/src/lib/airtable.ts
```

SoulSync becomes `/anne/*` inside Tammy's Hub. Same code, new home.
