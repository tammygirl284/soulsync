"use client";
// src/app/settings/page.tsx

import { useState, useEffect } from "react";
import { atFetch, TABLES, BASE_ID } from "@/lib/airtable";
import { Field } from "@/components/ui";

export default function SettingsPage() {
  const [key, setKey]         = useState("");
  const [msg, setMsg]         = useState("");
  const [ok, setOk]           = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => { setKey(sessionStorage.getItem("ss_key") || ""); }, []);

  const test = async () => {
    if (!key.trim()) return;
    setTesting(true); setMsg("");
    try {
      const data = await atFetch<{ records: unknown[] }>(TABLES.openLoops, { apiKey: key, fields: ["Name"] });
      setMsg(`✓ Connected — ${data.records?.length ?? 0} records in Open Loops`);
      setOk(true);
    } catch (e: unknown) {
      setMsg("✗ " + (e instanceof Error ? e.message : "Connection failed"));
      setOk(false);
    }
    setTesting(false);
  };

  const save = () => {
    sessionStorage.setItem("ss_key", key);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.025em", marginBottom: 20 }}>Settings</h1>

      {/* API Key card */}
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: 12, padding: "20px", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Airtable API Key</div>
        <Field label="Personal Access Token">
          <input
            className="input-field"
            type="password"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="patXXXXXXXXXXXXXX"
          />
        </Field>
        <div style={{ fontSize: 12, color: "#aaa", marginTop: 6, marginBottom: 14 }}>
          Get yours at{" "}
          <a href="https://airtable.com/create/tokens" target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>
            airtable.com/create/tokens
          </a>{" "}
          — needs read/write scope on the Anne OS base.
        </div>

        {msg && (
          <div style={{
            fontSize: 13, color: ok ? "#16a34a" : "#ef4444",
            padding: "8px 12px", background: ok ? "#f0fdf4" : "#fef2f2",
            borderRadius: 7, marginBottom: 12,
          }}>
            {msg}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={test} disabled={testing}>
            {testing ? "Testing…" : "Test connection"}
          </button>
          <button className="btn btn-blue" onClick={save}>
            {saved ? "Saved!" : "Save key"}
          </button>
        </div>
      </div>

      {/* Base config card */}
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: 12, padding: "20px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Base configuration</div>
        <div style={{ fontSize: 13, color: "#666", lineHeight: 2 }}>
          <div>
            <strong>Base ID:</strong>{" "}
            <code style={{ background: "#f3f4f6", padding: "1px 6px", borderRadius: 4, fontSize: 11 }}>{BASE_ID}</code>
          </div>
          {Object.entries(TABLES).map(([k, v]) => (
            <div key={k}>
              <strong>{k}:</strong>{" "}
              <code style={{ background: "#f3f4f6", padding: "1px 6px", borderRadius: 4, fontSize: 11 }}>{v}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Production note */}
      <div style={{ marginTop: 14, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginBottom: 4 }}>Before going to production</div>
        <p style={{ fontSize: 13, color: "#78350f", lineHeight: 1.7 }}>
          Move the API key to a server-side env var (<code style={{ fontSize: 11 }}>AIRTABLE_API_KEY</code> in Vercel, no{" "}
          <code style={{ fontSize: 11 }}>NEXT_PUBLIC_</code> prefix) and proxy all Airtable calls through{" "}
          <code style={{ fontSize: 11 }}>/src/app/api/</code> route handlers. This keeps your key out of the browser.
        </p>
      </div>
    </div>
  );
}
