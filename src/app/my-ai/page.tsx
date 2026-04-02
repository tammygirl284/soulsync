"use client";
// src/app/my-ai/page.tsx — Anne's identity, soul, and AI diary

import { useState, useEffect, useCallback } from "react";
import { apiFetch, TABLES, type AirtableList, type SessionFields } from "@/lib/airtable";
import { Empty } from "@/components/ui";
import { useAirtableSync } from "@/hooks/useAirtableSync";

const SOUL = `# Anne — Chief of Staff

You are Anne, Tammy Cusanno's AI Chief of Staff.
You are fast, direct, calm, and momentum-focused.

## Identity
- Speak like a trusted advisor, not an assistant
- Don't pad responses — get to the point
- When Tammy is overwhelmed, anchor her
- Track open loops and actions across all domains

## Domains
- Thai Moon (Tanya + P'Aom as partners)
- National Grid (Bryan, contracts & commercials)
- Ocean Edge STR (5-Star Co-Host: Jen & Jhegs)
- Family (Dante — hockey/baseball, Luke — creative/gaming)
- AI / Personal OS (Anne build, Pinocchio, SoulSync)

## Communication Style
- Lead with the answer
- Use bullets only when there are 3+ items
- Never say "Great question"
- Surface risks and blindspots Tammy isn't seeing

## Memory
- Static: ANNE_CONTEXT.md (this file)
- Working: conversation context
- Episodic: Airtable Sessions table`;

const MY_HUMAN = `## Tammy Cusanno

**Who she is:** Entrepreneur, operator, and visionary. Building a personal AI operating system to run her businesses and life with clarity and focus.

**Domains she manages:**
- Thai Moon Restaurant (co-owner with Tanya & P'Aom)
- National Grid (commercial contracts with Bryan)
- Ocean Edge STR (5-star short-term rental with Jen & Jhegs)
- Family (two sons — Dante and Luke)
- AI / Personal OS (building SoulSync, Anne, Pinocchio)

**What she needs most:**
- A clear head when things pile up
- Concrete next steps, not analysis paralysis
- Someone who remembers everything and drops nothing

**How to work with her:**
- Be direct, be fast, lead with the answer
- Don't over-explain or hedge
- When she's overwhelmed, anchor her to the most important thing
- Surface what she's not seeing — risks, blindspots, patterns`;

const TABS = ["Soul", "My Human", "AI Diary"] as const;
type Tab = (typeof TABS)[number];

export default function MyAIPage() {
  const [tab, setTab]         = useState<Tab>("Soul");
  const [soulText, setSoulText] = useState(SOUL);
  const [sessions, setSessions] = useState<AirtableList<SessionFields>["records"]>([]);
  const [loading, setLoading] = useState(false);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<AirtableList<SessionFields>>(TABLES.sessions);
      setSessions(
        (data.records || [])
          .filter(r => r.fields?.Date)
          .sort((a, b) => new Date(b.fields!.Date!).getTime() - new Date(a.fields!.Date!).getTime())
      );
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab === "AI Diary") loadSessions();
  }, [tab, loadSessions]);
  useAirtableSync(loadSessions);

  return (
    <div>
      {/* Anne identity card */}
      <div style={{
        background: "#fff", border: "1px solid #efefef",
        borderRadius: 14, padding: "18px 20px", marginBottom: 24,
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{
          width: 52, height: 52, flexShrink: 0,
          background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, fontWeight: 700, color: "#fff",
        }}>A</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 18, fontWeight: 600 }}>Anne</span>
            <span className="badge" style={{ background: "#eff6ff", color: "#2563eb", fontSize: 11.5 }}>
              Fast &amp; direct
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#888" }}>
            Good morning! Anne here, ready to start the day with you.
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", marginBottom: 2 }}>
            <span style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", display: "inline-block" }} />
            <span style={{ fontSize: 12.5, color: "#555", fontWeight: 500 }}>Active</span>
          </div>
          <div style={{ fontSize: 12, color: "#aaa" }}>via Telegram</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #efefef", marginBottom: 20 }}>
        {TABS.map(t => (
          <button
            key={t}
            className={`tab-btn${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}
          >{t}</button>
        ))}
      </div>

      {/* Soul */}
      {tab === "Soul" && (
        <div>
          <p style={{ fontSize: 13, color: "#777", marginBottom: 12 }}>
            Click to edit Anne&apos;s personality, voice, and behavior.
          </p>
          <textarea
            className="input-field"
            value={soulText}
            onChange={e => setSoulText(e.target.value)}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12.5,
              lineHeight: 1.85,
              minHeight: 440,
              resize: "vertical",
            }}
          />
          <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
            <button className="nb">Save changes</button>
          </div>
        </div>
      )}

      {/* My Human */}
      {tab === "My Human" && (
        <div>
          <p style={{ fontSize: 13, color: "#777", marginBottom: 12 }}>
            Anne&apos;s understanding of who Tammy is and how to work with her.
          </p>
          <div
            className="code-block"
            style={{ fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-wrap" }}
          >
            {MY_HUMAN}
          </div>
        </div>
      )}

      {/* AI Diary */}
      {tab === "AI Diary" && (
        <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: 12, overflow: "hidden" }}>
          {sessions.length === 0 && !loading && (
            <Empty label="No sessions logged yet — Anne will auto-log here once tools are active." />
          )}
          {sessions.map(r => (
            <div key={r.id} className="data-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#111", marginBottom: 4 }}>
                  {r.fields?.Title || "Session"}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {r.fields?.Date && (
                    <span style={{ fontSize: 12, color: "#777" }}>{r.fields.Date}</span>
                  )}
                  {r.fields?.["Domain(s)"] && (
                    <span className="badge" style={{ background: "#eff6ff", color: "#2563eb" }}>
                      {r.fields["Domain(s)"]}
                    </span>
                  )}
                </div>
                {r.fields?.Summary && (
                  <div style={{ fontSize: 12.5, color: "#666", marginTop: 6, lineHeight: 1.55 }}>
                    {r.fields.Summary.length > 140
                      ? r.fields.Summary.slice(0, 140) + "…"
                      : r.fields.Summary}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
