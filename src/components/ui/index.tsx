"use client";
// src/components/ui/index.tsx — shared primitives

import { ReactNode } from "react";

// ── Page header ───────────────────────────────────────────────────────────────
export function PageHeader({
  title, count, onAdd, onRefresh, loading, noKey,
}: {
  title: string; count?: number;
  onAdd?: () => void; onRefresh?: () => void;
  loading?: boolean; noKey?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
      <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.025em" }}>
        {title}
        {!!count && count > 0 && (
          <span style={{ fontSize: 16, color: "#bbb", fontWeight: 400, marginLeft: 6 }}>{count}</span>
        )}
      </h1>
      <div style={{ display: "flex", gap: 8 }}>
        {onRefresh && (
          <button className="btn btn-ghost" onClick={onRefresh} disabled={loading || noKey}>
            {loading ? "Loading…" : "Refresh"}
          </button>
        )}
        {onAdd && (
          <button className="nb" onClick={onAdd} disabled={noKey}>
            + Add new
          </button>
        )}
      </div>
    </div>
  );
}

// ── Tab bar ───────────────────────────────────────────────────────────────────
export function TabBar({
  tabs, counts, active, onChange,
}: {
  tabs: string[]; counts: Record<string, number>;
  active: string; onChange: (t: string) => void;
}) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid #efefef", marginBottom: 16 }}>
      {tabs.map(t => (
        <button
          key={t}
          className={`tab-btn${active === t ? " active" : ""}`}
          onClick={() => onChange(t)}
        >
          {t} <span className="tab-count">{counts[t] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

// ── Form field wrapper ────────────────────────────────────────────────────────
export function Field({ label, children, style }: { label: string; children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <div className="field-label">{label}</div>
      {children}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: 22, lineHeight: 1 }}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Modal footer ──────────────────────────────────────────────────────────────
export function ModalFooter({ onClose, onSave, saving, label }: {
  onClose: () => void; onSave: () => void; saving: boolean; label: string;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
      <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      <button className="btn btn-blue" onClick={onSave} disabled={saving}>
        {saving ? "Saving…" : label}
      </button>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function Empty({ label }: { label: string }) {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center", color: "#777", fontSize: 14 }}>
      {label}
    </div>
  );
}

// ── Error bar ─────────────────────────────────────────────────────────────────
export function ErrBar({ msg }: { msg: string }) {
  return (
    <div style={{
      background: "#fef2f2", border: "1px solid #fecaca",
      borderRadius: 8, padding: "10px 14px", marginBottom: 14,
      fontSize: 13, color: "#ef4444",
    }}>
      {msg}
    </div>
  );
}

// ── Key prompt ────────────────────────────────────────────────────────────────
export function KeyPrompt() {
  return (
    <div style={{
      background: "#eff6ff", border: "1px solid #bfdbfe",
      borderRadius: 10, padding: "14px 18px",
      fontSize: 13, color: "#1d4ed8",
    }}>
      Add your Airtable API key in <strong>Settings</strong> to connect Anne&apos;s live data.
    </div>
  );
}

// ── Priority dot ──────────────────────────────────────────────────────────────
export const PRIORITY_DOT: Record<string, string> = {
  High:   "#ef4444",
  Medium: "#f59e0b",
  Low:    "#22c55e",
};
