// src/app/page.tsx
export default function TodayPage() {
  const d = new Date();
  const fmt = d.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.025em", marginBottom: 4 }}>Today</h1>
      <div style={{ fontSize: 13, color: "#777", marginBottom: 24 }}>{fmt}</div>
      <div style={{
        background: "#fff", border: "1px solid #efefef",
        borderRadius: 12, padding: "48px 20px",
        textAlign: "center", color: "#777", fontSize: 14,
      }}>
        Calendar integration coming — wire Google Calendar MCP to Pinocchio
      </div>
    </div>
  );
}
