"use client";
// src/app/actions/page.tsx

import { useState, useEffect, useCallback } from "react";
import { apiFetch, TABLES, type AirtableList, type ActionItemFields } from "@/lib/airtable";
import { PageHeader, TabBar, Field, Modal, ModalFooter, Empty, ErrBar, PRIORITY_DOT } from "@/components/ui";
import { useAirtableSync } from "@/hooks/useAirtableSync";

export default function ActionsPage() {
  const [records, setRecords] = useState<AirtableList<ActionItemFields>["records"]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [modal, setModal]     = useState(false);
  const [tab, setTab]         = useState("All");
  const [form, setForm]       = useState({ title: "", priority: "Medium", project: "", dueDate: "", status: "Open" });
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await apiFetch<AirtableList<ActionItemFields>>(TABLES.actionItems);
      setRecords(data.records || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useAirtableSync(load);

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiFetch(TABLES.actionItems, { recordId: id, method: "PATCH", body: { fields: { Status: status } } });
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error");
    }
  };

  const create = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const fields: Record<string, string> = { Task: form.title, Priority: form.priority, Status: form.status };
      if (form.project) fields["Domain"]   = form.project;
      if (form.dueDate) fields["Due Date"] = form.dueDate;
      await apiFetch(TABLES.actionItems, { method: "POST", body: { fields } });
      setModal(false);
      setForm({ title: "", priority: "Medium", project: "", dueDate: "", status: "Open" });
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error");
    }
    setSaving(false);
  };

  const statuses = ["All", ...new Set(records.map(r => r.fields?.Status || "").filter(Boolean))];
  const filtered = records.filter(r => tab === "All" || r.fields?.Status === tab);
  const counts: Record<string, number> = { All: records.length };
  statuses.slice(1).forEach(s => { counts[s] = records.filter(r => r.fields?.Status === s).length; });

  return (
    <div>
      <PageHeader title="Action Items" count={records.length} onAdd={() => setModal(true)} onRefresh={load} loading={loading} />
      {error && <ErrBar msg={error} />}

      <TabBar tabs={statuses} counts={counts} active={tab} onChange={setTab} />
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: 12, overflow: "hidden" }}>
        {filtered.length === 0 && !loading && <Empty label="No action items" />}
        {filtered.map(r => (
          <div key={r.id} className="data-row">
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: PRIORITY_DOT[r.fields?.Priority ?? ""] || "#ddd", flexShrink: 0, marginTop: 5 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 14, fontWeight: 500, marginBottom: 4,
                color: r.fields?.Status === "Done" ? "#bbb" : "#111",
                textDecoration: r.fields?.Status === "Done" ? "line-through" : "none",
              }}>
                {r.fields?.Task || "Untitled"}
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {r.fields?.Domain       && <span className="badge" style={{ background: "#eff6ff", color: "#2563eb" }}>{r.fields.Domain}</span>}
                {r.fields?.["Due Date"] && <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 500 }}>Due {r.fields["Due Date"]}</span>}
                {r.fields?.Priority     && <span className="badge" style={{ background: "#f9f9f9", color: "#666" }}>{r.fields.Priority}</span>}
              </div>
            </div>
            <select
              className="input-field"
              style={{ width: 118, fontSize: 12, padding: "5px 8px", flexShrink: 0 }}
              value={r.fields?.Status || "Open"}
              onChange={e => updateStatus(r.id, e.target.value)}
            >
              {["Open", "In Progress", "Done", "Blocked"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title="New Action Item" onClose={() => setModal(false)}>
          <Field label="Title *">
            <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Write BCB session 2 outline" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <Field label="Priority">
              <select className="input-field" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {["High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {["Open", "In Progress", "Blocked"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <Field label="Domain">
              <input className="input-field" value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} placeholder="e.g. Anne OS" />
            </Field>
            <Field label="Due Date">
              <input className="input-field" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </Field>
          </div>
          <ModalFooter onClose={() => setModal(false)} onSave={create} saving={saving} label="Create Item" />
        </Modal>
      )}
    </div>
  );
}
