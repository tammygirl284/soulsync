"use client";
// src/app/sessions/page.tsx

import { useState, useEffect, useCallback } from "react";
import { apiFetch, TABLES, type AirtableList, type SessionFields } from "@/lib/airtable";
import { PageHeader, Empty } from "@/components/ui";
import { useAirtableSync } from "@/hooks/useAirtableSync";

export default function SessionsPage() {
  const [records, setRecords] = useState<AirtableList<SessionFields>["records"]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<AirtableList<SessionFields>>(TABLES.sessions);
      setRecords(data.records || []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useAirtableSync(load);

  return (
    <div>
      <PageHeader title="Sessions" count={records.length} onRefresh={load} loading={loading} />
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: 12, overflow: "hidden" }}>
        {records.length === 0 && !loading && (
          <Empty label="No sessions logged yet — Anne will auto-log here once tools are active" />
        )}
        {records.map(r => (
          <div key={r.id} className="data-row">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#111", marginBottom: 3 }}>
                {r.fields?.Title || "Session"}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {r.fields?.Date          && <span style={{ fontSize: 12, color: "#777" }}>{r.fields.Date}</span>}
                {r.fields?.["Domain(s)"] && <span className="badge" style={{ background: "#eff6ff", color: "#2563eb" }}>{r.fields["Domain(s)"]}</span>}
              </div>
              {r.fields?.Summary && (
                <div style={{ fontSize: 12.5, color: "#666", marginTop: 6, lineHeight: 1.5 }}>
                  {r.fields.Summary.length > 120 ? r.fields.Summary.slice(0, 120) + "…" : r.fields.Summary}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
