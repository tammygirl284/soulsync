"use client";
// src/app/brain/page.tsx — Anne's knowledge brain: live context + observations

import { useState, useEffect, useCallback } from "react";
import { apiFetch, TABLES, type AirtableList, type ObservationFields } from "@/lib/airtable";
import { Empty } from "@/components/ui";
import { useAirtableSync } from "@/hooks/useAirtableSync";

const TABS = ["Live Context", "Observations"] as const;
type Tab = (typeof TABS)[number];

const CATEGORY_STYLE: Record<string, { bg: string; color: string }> = {
  Pattern:     { bg: "#eff6ff", color: "#2563eb" },
  Risk:        { bg: "#fef2f2", color: "#ef4444" },
  Opportunity: { bg: "#f0fdf4", color: "#16a34a" },
  Insight:     { bg: "#faf5ff", color: "#7c3aed" },
};

export default function BrainPage() {
  const [tab, setTab]                 = useState<Tab>("Live Context");
  const [context, setContext]         = useState<string>("");
  const [observations, setObservations] = useState<AirtableList<ObservationFields>["records"]>([]);
  const [loading, setLoading]         = useState(false);
  const [lastSync, setLastSync]       = useState<Date | null>(null);

  const loadContext = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/anne/context");
      if (res.ok) {
        setContext(await res.text());
        setLastSync(new Date());
      }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  const loadObservations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<AirtableList<ObservationFields>>(TABLES.observations);
      setObservations(data.records || []);
      setLastSync(new Date());
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  const load = useCallback(() => {
    if (tab === "Live Context") loadContext();
    else loadObservations();
  }, [tab, loadContext, loadObservations]);

  useEffect(() => { load(); }, [load]);
  useAirtableSync(load);

  const syncLabel = lastSync
    ? `Synced ${lastSync.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
    : null;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 48, height: 48, flexShrink: 0,
          background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
          borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, fontWeight: 700, color: "#fff",
        }}>A</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em" }}>Anne's Brain</div>
          <div style={{ fontSize: 13, color: "#888", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <span style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", display: "inline-block" }} />
            Active — Chief of Staff
            {syncLabel && <span style={{ color: "#ccc" }}>· {syncLabel}</span>}
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button className="btn btn-ghost" onClick={load} disabled={loading} style={{ fontSize: 13 }}>
            {loading ? "Loading…" : "Refresh"}
          </button>
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

      {/* Live Context */}
      {tab === "Live Context" && (
        <>
          {!context && !loading && (
            <Empty label="Could not load Anne's live context — check API key in Settings." />
          )}
          {context && (
            <div
              className="code-block"
              style={{ fontSize: 12.5, lineHeight: 1.85, maxHeight: "calc(100vh - 290px)", overflowY: "auto" }}
            >
              {context}
            </div>
          )}
        </>
      )}

      {/* Observations */}
      {tab === "Observations" && (
        <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: 12, overflow: "hidden" }}>
          {observations.length === 0 && !loading && (
            <Empty label="No observations yet — Anne adds these as she notices patterns over time." />
          )}
          {observations.map(r => {
            const f = r.fields;
            const cat   = f?.Category ?? "";
            const style = CATEGORY_STYLE[cat] ?? { bg: "#f3f4f6", color: "#555" };
            return (
              <div key={r.id} className="data-row">
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5, flexWrap: "wrap" }}>
                    {cat && (
                      <span className="badge" style={{ background: style.bg, color: style.color }}>{cat}</span>
                    )}
                    {f?.Domain && (
                      <span style={{ fontSize: 12, color: "#888" }}>{f.Domain}</span>
                    )}
                    {f?.Date && (
                      <span style={{ fontSize: 12, color: "#bbb", marginLeft: "auto" }}>{f.Date}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#111", marginBottom: f?.Detail ? 5 : 0 }}>
                    {f?.Observation || "—"}
                  </div>
                  {f?.Detail && (
                    <div style={{ fontSize: 12.5, color: "#666", lineHeight: 1.55 }}>
                      {f.Detail.length > 180 ? f.Detail.slice(0, 180) + "…" : f.Detail}
                    </div>
                  )}
                </div>
                {f?.Acknowledged && (
                  <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 500, flexShrink: 0, marginLeft: 12 }}>
                    ✓ Seen
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
