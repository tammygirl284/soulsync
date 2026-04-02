"use client";
// src/app/people/page.tsx

import { useState, useEffect, useCallback } from "react";
import { apiFetch, TABLES, type AirtableList, type PersonFields } from "@/lib/airtable";
import { PageHeader, Empty } from "@/components/ui";
import { useAirtableSync } from "@/hooks/useAirtableSync";

const AVATAR_COLORS = ["#dbeafe","#dcfce7","#ede9fe","#fce7f3","#fef9c3","#d1fae5","#fee2e2","#e0f2fe"];

export default function PeoplePage() {
  const [records, setRecords] = useState<AirtableList<PersonFields>["records"]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<AirtableList<PersonFields>>(TABLES.people);
      setRecords(data.records || []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useAirtableSync(load);

  return (
    <div>
      <PageHeader title="People" count={records.length} onRefresh={load} loading={loading} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
        {records.length === 0 && !loading && (
          <div style={{ gridColumn: "1/-1" }}><Empty label="No people yet" /></div>
        )}
        {records.map((r, i) => {
          const name     = r.fields?.Name || "Unknown";
          const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
          return (
            <div key={r.id} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 600, color: "#444", flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#111" }}>{name}</div>
                  {r.fields?.Role && <div style={{ fontSize: 12, color: "#777" }}>{r.fields.Role}</div>}
                </div>
              </div>
              {r.fields?.Domain && (
                <div style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>{r.fields.Domain}</div>
              )}
              {r.fields?.Notes && (
                <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>
                  {r.fields.Notes.slice(0, 90)}
                  {r.fields.Notes.length > 90 ? "…" : ""}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
