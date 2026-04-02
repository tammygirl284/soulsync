"use client";
// src/app/loops/page.tsx

import { useState, useEffect, useCallback } from "react";
import { apiFetch, TABLES, type AirtableList, type OpenLoopFields } from "@/lib/airtable";
import { PageHeader, TabBar, Field, Modal, ModalFooter, Empty, ErrBar, PRIORITY_DOT } from "@/components/ui";
import { useAirtableSync } from "@/hooks/useAirtableSync";

type EditForm = { name: string; priority: string; domain: string; notes: string; status: string };

export default function LoopsPage() {
  const [records, setRecords]   = useState<AirtableList<OpenLoopFields>["records"]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [modal, setModal]       = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [tab, setTab]           = useState("All");
  const [form, setForm]         = useState<EditForm>({ name: "", priority: "Medium", domain: "AI", notes: "", status: "Open" });
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await apiFetch<AirtableList<OpenLoopFields>>(TABLES.openLoops);
      setRecords(data.records || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useAirtableSync(load);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: "", priority: "Medium", domain: "AI", notes: "", status: "Open" });
    setModal(true);
  };

  const openEdit = (r: AirtableList<OpenLoopFields>["records"][0]) => {
    setEditId(r.id);
    setForm({
      name:     r.fields?.["Loop Name"] || "",
      priority: r.fields?.Priority      || "Medium",
      domain:   r.fields?.Domain        || "AI",
      notes:    r.fields?.Description   || "",
      status:   r.fields?.Status        || "Open",
    });
    setModal(true);
  };

  const markDone = async (id: string) => {
    try {
      await apiFetch(TABLES.openLoops, { recordId: id, method: "PATCH", body: { fields: { Status: "Done" } } });
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error");
    }
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const fields = { "Loop Name": form.name, Priority: form.priority, Domain: form.domain, Description: form.notes, Status: form.status };
      if (editId) {
        await apiFetch(TABLES.openLoops, { recordId: editId, method: "PATCH", body: { fields } });
      } else {
        await apiFetch(TABLES.openLoops, { method: "POST", body: { fields } });
      }
      setModal(false);
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error");
    }
    setSaving(false);
  };

  const domains = ["All", ...new Set(records.map(r => r.fields?.Domain || "").filter(Boolean))];
  const filtered = records.filter(r => tab === "All" || r.fields?.Domain === tab);
  const counts: Record<string, number> = { All: records.length };
  domains.slice(1).forEach(d => { counts[d] = records.filter(r => r.fields?.Domain === d).length; });

  return (
    <div>
      <PageHeader title="Open Loops" count={records.length} onAdd={openCreate} onRefresh={load} loading={loading} />
      {error && <ErrBar msg={error} />}

      <TabBar tabs={domains.slice(0, 7)} counts={counts} active={tab} onChange={setTab} />
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: 12, overflow: "hidden" }}>
        {filtered.length === 0 && !loading && <Empty label="No open loops" />}
        {filtered.map(r => (
          <div key={r.id} className="data-row">
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: PRIORITY_DOT[r.fields?.Priority ?? ""] || "#ddd", flexShrink: 0, marginTop: 5 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#111", marginBottom: 4 }}>{r.fields?.["Loop Name"] || "Untitled"}</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {r.fields?.Domain   && <span className="badge" style={{ background: "#eff6ff", color: "#2563eb" }}>{r.fields.Domain}</span>}
                {r.fields?.Priority && <span className="badge" style={{ background: "#f9f9f9", color: "#666" }}>{r.fields.Priority}</span>}
                {r.fields?.Status   && (
                  <span className="badge" style={{ background: r.fields.Status === "Done" ? "#f0fdf4" : "#fff7ed", color: r.fields.Status === "Done" ? "#16a34a" : "#d97706" }}>
                    {r.fields.Status}
                  </span>
                )}
                {r.fields?.Description && <span style={{ fontSize: 12, color: "#777", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{r.fields.Description}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => openEdit(r)}>
                Edit
              </button>
              {r.fields?.Status !== "Done" && (
                <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => markDone(r.id)}>
                  Done
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={editId ? "Edit Loop" : "New Open Loop"} onClose={() => setModal(false)}>
          <Field label="Name *">
            <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Set up Telegram bot for Anne" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <Field label="Priority">
              <select className="input-field" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {["Urgent", "High", "Medium", "Low", "Normal"].map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Domain">
              <select className="input-field" value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })}>
                {["AI", "AI Business", "Thai Moon", "National Grid", "Family", "Health", "Finance", "Vision", "Personal"].map(d => <option key={d}>{d}</option>)}
              </select>
            </Field>
          </div>
          {editId && (
            <Field label="Status" style={{ marginTop: 12 }}>
              <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {["Open", "In Progress", "Done"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          )}
          <Field label="Notes" style={{ marginTop: 12 }}>
            <textarea className="input-field" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional context..." />
          </Field>
          <ModalFooter onClose={() => setModal(false)} onSave={save} saving={saving} label={editId ? "Save Changes" : "Create Loop"} />
        </Modal>
      )}
    </div>
  );
}
