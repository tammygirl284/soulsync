"use client";
// src/app/projects/page.tsx

import { useState } from "react";
import { PROJECTS, AVATAR_BG } from "@/lib/projects";

export default function ProjectsPage() {
  const [tab, setTab] = useState("All");
  const [q, setQ]     = useState("");

  const counts = {
    All:       PROJECTS.length,
    Active:    PROJECTS.filter(p => p.status === "Active").length,
    "On Hold": PROJECTS.filter(p => p.status === "On Hold").length,
    Completed: 0,
  };

  const list = PROJECTS.filter(p =>
    (tab === "All" || p.status === tab) &&
    (!q || p.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.025em" }}>Projects</h1>
        <button className="nb">+ New Project</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #efefef", marginBottom: 20 }}>
        {(["All", "Active", "On Hold", "Completed"] as const).map(t => (
          <button
            key={t}
            className={`tab-btn${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t} <span className="tab-count">{counts[t]}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 22 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 9,
          border: "1px solid #ebebeb", borderRadius: 8,
          padding: "9px 14px", width: 290, background: "#fff",
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4" stroke="#888" strokeWidth="1.3"/>
            <path d="M9 9l2.5 2.5" stroke="#888" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            style={{ border:"none", background:"transparent", outline:"none", fontFamily:"inherit", fontSize:13.5, color:"#111", width:"100%" }}
            placeholder="Search projects..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Card grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
        {list.map(p => (
          <div key={p.id} className="proj-card">
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: AVATAR_BG[p.category] || "#f3f4f6",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, marginBottom: 14,
            }}>
              {p.emoji}
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#111", letterSpacing: "-0.01em", marginBottom: 3 }}>
              {p.name}
            </div>
            <div style={{ fontSize: 13, color: "#555", marginBottom: 10 }}>{p.category}</div>
            {p.desc && (
              <div style={{ fontSize: 12.5, color: "#555", lineHeight: 1.55, flex: 1, marginBottom: 14 }}>
                {p.desc.length > 85 ? p.desc.slice(0, 85) + "…" : p.desc}
              </div>
            )}
            <div style={{ marginTop: "auto" }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 5 }}>{p.tasks}</div>
              <span style={{ fontSize: 13, fontWeight: 500, color: p.status === "Active" ? "#16a34a" : "#d97706" }}>
                {p.status}
              </span>
            </div>
            <span className="delete-lbl">Delete</span>
          </div>
        ))}
        {list.length === 0 && (
          <div style={{ gridColumn: "1/-1", padding: "60px 0", textAlign: "center", color: "#777", fontSize: 14 }}>
            No projects found
          </div>
        )}
      </div>
    </div>
  );
}
