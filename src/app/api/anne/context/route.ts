// src/app/api/anne/context/route.ts
// Returns Anne's live context block — open loops, recent sessions, open actions.
// Called by n8n before each AI Agent response to inject fresh Airtable state.
//
// Optional auth: set ANNE_CONTEXT_SECRET env var, then pass x-anne-secret header.

import { NextResponse } from "next/server";
import { atFetch, type AirtableList, type OpenLoopFields, type ActionItemFields, type SessionFields } from "@/lib/airtable";

const API_KEY = process.env.AIRTABLE_API_KEY!;
const SECRET  = process.env.ANNE_CONTEXT_SECRET;

const DOMAIN_EMOJI: Record<string, string> = {
  "Thai Moon":     "🍜",
  "National Grid": "⚡",
  "Family":        "👨‍👩‍👧‍👦",
  "AI":            "🤖",
  "AI Business":   "🤖",
  "Health":        "💪",
  "Finance":       "💰",
  "Vision":        "🧠",
  "Ocean Edge":    "🏖️",
  "Personal":      "✨",
};

function domainEmoji(domain?: string) {
  return DOMAIN_EMOJI[domain ?? ""] ?? "🔧";
}

export async function GET(req: Request) {
  if (SECRET) {
    const provided = req.headers.get("x-anne-secret");
    if (provided !== SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const [loopsData, actionsData, sessionsData] = await Promise.all([
      atFetch<AirtableList<OpenLoopFields>>("Open Loops", {
        apiKey: API_KEY,
        filterFormula: `NOT(OR({Status}="Done",{Status}="Dropped",{Status}="Resolved"))`,
        fields: ["Loop Name", "Priority", "Domain", "Status", "Description", "Anne's Watch Note"],
      }),
      atFetch<AirtableList<ActionItemFields>>("Action Items", {
        apiKey: API_KEY,
        filterFormula: `NOT(OR({Status}="Done",{Status}="Dropped"))`,
        fields: ["Task", "Priority", "Domain", "Due Date", "Status"],
      }),
      atFetch<AirtableList<SessionFields>>("Sessions", {
        apiKey: API_KEY,
        fields: ["Title", "Date", "Summary", "Domain(s)", "Key Decisions"],
      }),
    ]);

    const loops   = loopsData.records ?? [];
    const actions = actionsData.records ?? [];
    const sessions = (sessionsData.records ?? [])
      .filter(r => r.fields?.Date)
      .sort((a, b) => new Date(b.fields!.Date!).getTime() - new Date(a.fields!.Date!).getTime())
      .slice(0, 5);

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const lines: string[] = [`## ANNE LIVE CONTEXT — ${today}`, ""];

    // Open Loops
    lines.push(`### OPEN LOOPS (${loops.length})`);
    if (loops.length === 0) {
      lines.push("None.");
    } else {
      for (const r of loops) {
        const f = r.fields;
        let line = `${domainEmoji(f?.Domain)} [${f?.Priority ?? "—"}] ${f?.["Loop Name"] ?? "Untitled"}`;
        if (f?.Status && f.Status !== "Open") line += ` (${f.Status})`;
        if (f?.Description) line += ` — ${f.Description}`;
        if (f?.["Anne's Watch Note"]) line += ` | Watch: ${f["Anne's Watch Note"]}`;
        lines.push(line);
      }
    }
    lines.push("");

    // Open Action Items
    lines.push(`### OPEN ACTION ITEMS (${actions.length})`);
    if (actions.length === 0) {
      lines.push("None.");
    } else {
      for (const r of actions) {
        const f = r.fields;
        let line = `${domainEmoji(f?.Domain)} [${f?.Priority ?? "—"}] ${f?.Task ?? "Untitled"}`;
        if (f?.["Due Date"]) line += ` — due ${f["Due Date"]}`;
        if (f?.Status && f.Status !== "Open") line += ` (${f.Status})`;
        lines.push(line);
      }
    }
    lines.push("");

    // Recent Sessions
    lines.push(`### RECENT SESSIONS`);
    if (sessions.length === 0) {
      lines.push("No sessions logged yet.");
    } else {
      for (const r of sessions) {
        const f = r.fields!;
        lines.push(`📅 ${f.Date} — ${f.Title ?? "Session"}${f["Domain(s)"] ? ` [${f["Domain(s)"]}]` : ""}`);
        if (f.Summary) {
          const snip = f.Summary.length > 250 ? f.Summary.slice(0, 250) + "…" : f.Summary;
          lines.push(`   ${snip}`);
        }
        if (f["Key Decisions"]) {
          const snip = f["Key Decisions"].length > 150 ? f["Key Decisions"].slice(0, 150) + "…" : f["Key Decisions"];
          lines.push(`   Decisions: ${snip}`);
        }
        lines.push("");
      }
    }

    const contextBlock = lines.join("\n");

    return new Response(contextBlock, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
