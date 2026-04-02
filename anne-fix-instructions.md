# Anne Memory Fix — VS Code Instructions

**What this fixes:** Anne currently starts every conversation blank with no memory between sessions. Airtable write failures block her from logging. This document walks through the exact file changes to make in VS Code to implement file-based memory on Pinocchio.

---

## What This Fixes

| Problem | Now | After Fix |
|---|---|---|
| Memory between sessions | None — starts blank | Full JSON loaded every conversation |
| Airtable write failures | Blocks Anne | Irrelevant — Anne writes locally |
| SoulSync data | Empty | Synced hourly from memory.json |
| Anne knowing open loops | Never | Every single conversation |
| Setup complexity | High — fragile Airtable tool calls | Two file nodes in n8n |

---

## The New Architecture

```
OLD: Telegram → AI Agent → (tries Airtable, fails) → Reply

NEW: Telegram → Read memory.json → AI Agent → Write memory.json → Reply
     (separately, every hour) Sync job: memory.json → Airtable → SoulSync
```

Anne writes to a local JSON file on Pinocchio — always works, zero API failures. A separate n8n job syncs that file to Airtable once an hour. SoulSync reads from Airtable as before. Anne's job is to think and respond. The sync job's job is to keep everything updated. They never interfere.

---

## Files You're Creating or Editing

| File | Action | Step |
|---|---|---|
| `src/lib/memory.ts` | CREATE | Step 2 |
| `src/app/api/memory/route.ts` | CREATE | Step 3 |
| `.env.local` | EDIT | Step 4 |
| `src/components/Sidebar.tsx` | EDIT | Step 5 |
| `src/app/memory/page.tsx` | CREATE | Step 6 |

---

## Step 1 — Confirm memory.json on Pinocchio

VS Code doesn't touch this file — it lives on Pinocchio. Confirm it exists before wiring n8n.

Open Terminal and run:

```bash
cat ~/Projects/Anne/memory.json
```

You should see the JSON schema VS Code created. If it's missing:

```bash
mkdir -p ~/Projects/Anne && touch ~/Projects/Anne/memory.json
```

---

## Step 2 — Create src/lib/memory.ts

This file gives SoulSync typed access to the memory schema.

**File path:** `soulsync/src/lib/memory.ts`

```typescript
// src/lib/memory.ts
// TypeScript types for Anne's memory.json schema

export interface Commitment {
  id: string;
  what: string;
  made_on: string | null;
  due: string | null;
  status: 'open' | 'done' | 'cancelled';
  last_surfaced: string | null;
  anne_note: string;
}

export interface ShortTermItem {
  id: string;
  what: string;
  domain: string;
  priority: 'High' | 'Medium' | 'Low';
  due: string | null;
  status: 'open' | 'done';
}

export interface WatchItem {
  id: string;
  what: string;
  domain: string;
  last_moved: string | null;
  anne_note: string;
}

export interface AnneMemory {
  version: string;
  last_updated: string | null;
  tammy_state: {
    last_known_mood: string | null;
    last_known_energy: string | null;
    last_interaction: string | null;
    session_count: number;
    stress_signals: string[];
    notes: string | null;
  };
  commitments: Commitment[];
  watching: WatchItem[];
  short_term: ShortTermItem[];
  flags: Record<string, boolean | string | null>;
  last_session: {
    date: string | null;
    summary: string | null;
    key_decisions: string[];
    domains_covered: string[];
    mood: string | null;
    energy: string | null;
  };
}
```

---

## Step 3 — Create Memory API Route

Add a Next.js API route that reads and writes `memory.json` from Pinocchio's filesystem. SoulSync pages call this endpoint to display Anne's live memory.

**File path:** `soulsync/src/app/api/memory/route.ts`

```typescript
// src/app/api/memory/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';

const MEMORY_PATH = process.env.MEMORY_PATH ??
  '/Users/pinocchiocusanno/Projects/Anne/memory.json';

export async function GET() {
  try {
    const raw = fs.readFileSync(MEMORY_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json(
      { error: 'Memory file not found' },
      { status: 404 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    fs.writeFileSync(MEMORY_PATH, JSON.stringify(body, null, 2));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Write failed' },
      { status: 500 }
    );
  }
}
```

> **Note:** This route reads from the local filesystem. It only works when SoulSync is running on Pinocchio (`localhost:3000`). On Vercel it will return 404 — that's expected. Memory display on the live site comes from the Airtable sync job, not this route.

---

## Step 4 — Update .env.local

**File path:** `soulsync/.env.local`

Add this line:

```bash
# Anne memory file — local Pinocchio path
MEMORY_PATH=/Users/pinocchiocusanno/Projects/Anne/memory.json
```

---

## Step 5 — Add Memory to SoulSync Sidebar

**File path:** `soulsync/src/components/Sidebar.tsx`

Find the `AI` section items array and add:

```typescript
{ href: '/memory', label: 'Anne Memory' },
```

The full AI section should look like this after the edit:

```typescript
{ section: 'AI', items: [
  { href: '/memory',   label: 'Anne Memory'     },  // ← ADD THIS
  { href: '/loops',    label: 'Open Loops'       },
  { href: '/actions',  label: 'Action Items'     },
  { href: '/sessions', label: 'Sessions'         },
  { href: '/people',   label: 'People'           },
  { href: '/tools',    label: 'Tools Generator'  },
  { href: '/prompt',   label: 'System Prompt'    },
  { href: '/settings', label: 'Settings'         },
]},
```

---

## Step 6 — Create Memory Page

**File path:** `soulsync/src/app/memory/page.tsx`

```typescript
"use client";
// src/app/memory/page.tsx

import { useState, useEffect } from 'react';
import type { AnneMemory } from '@/lib/memory';

const STATUS_COLOR: Record<string, string> = {
  open:      '#d97706',
  done:      '#16a34a',
  cancelled: '#9ca3af',
};

export default function MemoryPage() {
  const [mem, setMem] = useState<AnneMemory | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch('/api/memory')
      .then(r => r.json())
      .then(data => {
        if (data.error) setErr(data.error);
        else setMem(data);
      })
      .catch(() => setErr('Memory file not found — is Pinocchio running?'));
  }, []);

  if (err) return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 12 }}>Anne Memory</h1>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', fontSize: 13, color: '#ef4444' }}>
        {err}
      </div>
    </div>
  );

  if (!mem) return (
    <div style={{ padding: 32, color: '#aaa', fontSize: 14 }}>
      Loading Anne's memory...
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.025em' }}>Anne Memory</h1>
        <span style={{ fontSize: 12, color: '#aaa' }}>
          Last updated: {mem.last_updated ?? 'never'} · Sessions: {mem.tammy_state.session_count}
        </span>
      </div>

      {/* Tammy state bar */}
      {(mem.tammy_state.last_known_mood || mem.tammy_state.notes) && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: '#1d4ed8' }}>
          {mem.tammy_state.last_known_mood && <span>Mood: <strong>{mem.tammy_state.last_known_mood}</strong>  ·  </span>}
          {mem.tammy_state.last_known_energy && <span>Energy: <strong>{mem.tammy_state.last_known_energy}</strong>  ·  </span>}
          {mem.tammy_state.notes && <span>{mem.tammy_state.notes}</span>}
        </div>
      )}

      {/* Flags */}
      {Object.entries(mem.flags).some(([, v]) => v === true) && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: '#92400e' }}>
          ⚠️ Active flags: {Object.entries(mem.flags).filter(([, v]) => v === true).map(([k]) => k.replace(/_/g, ' ')).join(' · ')}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>

        {/* Commitments */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: '#111' }}>Commitments</h2>
          <div style={{ background: '#fff', border: '1px solid #efefef', borderRadius: 12, overflow: 'hidden' }}>
            {mem.commitments.length === 0 && (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#ccc', fontSize: 13 }}>No commitments</div>
            )}
            {mem.commitments.map(c => (
              <div key={c.id} className="data-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: '#111', marginBottom: 3 }}>{c.what}</div>
                  <div style={{ fontSize: 11.5, color: '#aaa' }}>{c.anne_note}</div>
                  {c.due && <div style={{ fontSize: 11.5, color: '#f59e0b', marginTop: 2 }}>Due: {c.due}</div>}
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: STATUS_COLOR[c.status] ?? '#aaa', flexShrink: 0 }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Watching */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: '#111' }}>Watching</h2>
          <div style={{ background: '#fff', border: '1px solid #efefef', borderRadius: 12, overflow: 'hidden' }}>
            {mem.watching.length === 0 && (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#ccc', fontSize: 13 }}>Nothing being watched</div>
            )}
            {mem.watching.map(w => (
              <div key={w.id} className="data-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: '#111', marginBottom: 3 }}>{w.what}</div>
                  <div style={{ fontSize: 11.5, color: '#aaa' }}>{w.anne_note}</div>
                </div>
                <span className="badge" style={{ background: '#eff6ff', color: '#2563eb', flexShrink: 0 }}>{w.domain}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Short term */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: '#111' }}>Short Term</h2>
          <div style={{ background: '#fff', border: '1px solid #efefef', borderRadius: 12, overflow: 'hidden' }}>
            {mem.short_term.length === 0 && (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#ccc', fontSize: 13 }}>No short-term items</div>
            )}
            {mem.short_term.map(s => (
              <div key={s.id} className="data-row">
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.priority === 'High' ? '#ef4444' : s.priority === 'Medium' ? '#f59e0b' : '#22c55e', flexShrink: 0, marginTop: 5 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: '#111' }}>{s.what}</div>
                  {s.due && <div style={{ fontSize: 11.5, color: '#f59e0b', marginTop: 2 }}>Due: {s.due}</div>}
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: STATUS_COLOR[s.status] ?? '#aaa', flexShrink: 0 }}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Last session */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: '#111' }}>Last Session</h2>
          <div style={{ background: '#fff', border: '1px solid #efefef', borderRadius: 12, padding: '16px 18px' }}>
            {!mem.last_session.date ? (
              <div style={{ color: '#ccc', fontSize: 13 }}>No sessions logged yet</div>
            ) : (
              <>
                <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>{mem.last_session.date}</div>
                <div style={{ fontSize: 13.5, color: '#333', lineHeight: 1.6, marginBottom: 10 }}>
                  {mem.last_session.summary}
                </div>
                {mem.last_session.key_decisions.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 4 }}>Key decisions</div>
                    {mem.last_session.key_decisions.map((d, i) => (
                      <div key={i} style={{ fontSize: 12.5, color: '#555', marginBottom: 2 }}>· {d}</div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
```

---

## Step 7 — Test Locally

In Terminal, from `~/Projects/soulsync`:

```bash
npm run dev
```

Then open in your browser:

```
http://localhost:3000/memory
```

You should see Anne's commitments, watching items, and last session loaded from `memory.json`. If you see an error, confirm the `MEMORY_PATH` in `.env.local` matches the actual file location on Pinocchio.

---

## Step 8 — Commit and Push

```bash
cd ~/Projects/soulsync
git add .
git commit -m "add Anne memory page and API route"
git push
```

Vercel auto-deploys on push. The `/memory` page will show a friendly error on Vercel — that's expected. The live site gets memory data through the Airtable hourly sync job, not the filesystem directly.

---

## Next — Wire n8n (separate step)

VS Code work is done after Step 8. The n8n changes are separate and don't require VS Code. Go to `localhost:5678`.

| n8n change | What it does |
|---|---|
| Read File node (start of workflow) | Loads memory.json into Anne's context |
| System prompt update | Injects memory + tells Anne how to update it |
| Code node (after AI Agent) | Extracts `<memory_update>` block from response |
| IF node | Only writes if memory actually changed |
| Write File node | Saves updated memory.json to Pinocchio |
| New hourly sync workflow | Pushes memory.json → Airtable → SoulSync |

---

## Why Not Neo4j or a Vector Database?

The Airtable issue is a tooling problem, not a database problem. Anne can't write to Airtable because her n8n tool calls are misconfigured — wrong field names, missing typecast, inconsistent execution. That's a fix, not a reason to switch databases.

The right progression:

```
Now      → File-based memory (memory.json) — fixes blank sessions today
Month 2  → Airtable fixed and syncing     — SoulSync shows live data
Month 3  → Evaluate knowledge graph       — if people/relationship tracking gets complex
Month 4+ → Vector search                  — if Anne needs to recall specific past conversations
```

Neo4j and vector databases solve different problems. Neo4j is for relationship graphs — great when you need "Tammy knows Bryan who works at National Grid which has a BCB deadline." Vector databases are for semantic search — great when Anne needs to find similar past conversations. Neither fixes the problem you have right now, which is simply that Anne starts blank every session. The JSON file fixes that today.
