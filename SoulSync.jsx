cimport { useState, useEffect, useCallback } from "react";

// ── Config ───────────────────────────────────────────────────────────────────
const BASE_ID = "app0QFzXHkZ6MeiO1";
const TABLES  = { openLoops:"Open Loops", actionItems:"Action Items", sessions:"Sessions", people:"People" };

async function atFetch(apiKey, table, opts = {}) {
  const { recordId, method = "GET", body, fields } = opts;
  let url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`;
  if (recordId) url += `/${recordId}`;
  if (fields) { const p = new URLSearchParams(); fields.forEach(f => p.append("fields[]", f)); url += "?" + p; }
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`Airtable ${res.status}`);
  return res.json();
}

// ── Data ─────────────────────────────────────────────────────────────────────
const PROJECTS = [
  { id:1,  emoji:"🤖", name:"Anne OS Build",       category:"AI",      desc:"Chief of Staff agent on Pinocchio — Airtable brain, Telegram, auto-logging.", tasks:"3 of 8 tasks", status:"Active"  },
  { id:2,  emoji:"🍜", name:"Thai Moon Ops",        category:"Income",  desc:"Live revenue dashboard, payroll, Toast exports, manager hub.",                tasks:"2 of 5 tasks", status:"Active"  },
  { id:3,  emoji:"🏢", name:"National Grid",        category:"Income",  desc:"BCB learning series, contract commercials work with Bryan.",                  tasks:"1 of 3 tasks", status:"Active"  },
  { id:4,  emoji:"🧠", name:"Book Project",         category:"Vision",  desc:"Humanity co-existing with AI — Know, Learn, Work, Connect framework.",       tasks:"0 of 4 tasks", status:"Active"  },
  { id:5,  emoji:"🏡", name:"Ocean Edge STR",       category:"Income",  desc:"Short-term rental managed by 5-Star Co-Host (Jen & Jhegs).",                 tasks:"0 of 2 tasks", status:"Active"  },
  { id:6,  emoji:"🏒", name:"Dante Athletics",      category:"Family",  desc:"AAA hockey goaltender + baseball. Arm injury care pathway.",                 tasks:"1 of 3 tasks", status:"Active"  },
  { id:7,  emoji:"🎮", name:"Luke Projects",        category:"Family",  desc:"Roblox project, creative interests, online school research.",                 tasks:"0 of 2 tasks", status:"Active"  },
  { id:8,  emoji:"💪", name:"Health & Fitness",     category:"Health",  desc:"Yoga, Body Combat, Body Pump, kickboxing, meditation, macros.",               tasks:"0 of 2 tasks", status:"Active"  },
  { id:9,  emoji:"🌐", name:"Tammy's Hub",          category:"Vision",  desc:"tammy-hub.vercel.app — centralized Next.js life dashboard.",                 tasks:"1 of 1 tasks", status:"Active"  },
  { id:10, emoji:"📚", name:"Mindvalley Learning",  category:"Vision",  desc:"AI leadership, personal dev. Mentor: Vishen Lakhiani.",                      tasks:"0 of 3 tasks", status:"Active"  },
  { id:11, emoji:"💰", name:"Wealth Command",       category:"Finance", desc:"Net worth, investments, real estate, income, documents.",                    tasks:"0 of 2 tasks", status:"Active"  },
  { id:12, emoji:"🔧", name:"Pinocchio Infra",      category:"AI",      desc:"Mac Mini M4 — n8n, OpenClaw, Claude Code, Google OAuth, automations.",       tasks:"2 of 4 tasks", status:"Active"  },
  { id:13, emoji:"🌊", name:"BCB Series",           category:"Income",  desc:"Beyond Contract Basics at National Grid. Session 2 in planning.",            tasks:"1 of 3 tasks", status:"On Hold" },
  { id:14, emoji:"🎓", name:"Online School Search", category:"Family",  desc:"Excel High School for Dante. ASU Prep + FIRST Robotics for Luke.",           tasks:"0 of 2 tasks", status:"On Hold" },
];

const AVATAR_BG = { AI:"#dbeafe", Income:"#dcfce7", Vision:"#ede9fe", Family:"#fce7f3", Health:"#fef9c3", Finance:"#d1fae5" };
const PRIORITY_DOT = { High:"#ef4444", Medium:"#f59e0b", Low:"#22c55e" };

const TOOLS_BLOCK = `## TOOLS — What Anne Can Do

You have access to Airtable tools connected to the Anne OS base (app0QFzXHkZ6MeiO1).
Use them autonomously. Do not ask for permission. Just act, then report what you did.

### Tables & When to Use Each

**Open Loops** — unresolved items needing follow-up
- CREATE when Tammy mentions something to track or resolve later
- READ before planning sessions to surface what's open
- UPDATE Status → "Done" when resolved
Fields: Name, Priority (High/Medium/Low), Domain, Status (Open/Done), Notes

**Action Items** — concrete next steps
- CREATE immediately when a task is identified
- READ to surface what's due or overdue
- UPDATE Status as tasks progress
Fields: Title, Priority (High/Medium/Low), Status (To Do/In Progress/Done/Blocked), Project, Due Date (YYYY-MM-DD)

**Sessions** — log of every Anne ↔ Tammy session
- CREATE at session start; UPDATE at end with summary

**People** — relationship map
- READ before meetings; UPDATE notes after key interactions

### Autonomous Behavior Rules
1. Act first, report after. Create/update silently, then confirm.
2. Capture everything. "I need to..." = action item. Create it.
3. No confirmation theater. Never ask "Should I create a record?"
4. Surface proactively. At session start, flag High priority open items.
5. Close loops. When resolved, update Status to Done.
6. Date format: always YYYY-MM-DD.
7. Priority default: Medium if unclear.`;

// ── Nav ───────────────────────────────────────────────────────────────────────
const NAV = [
  { section:"Core", items:[
    { id:"today",    label:"Today"     },
    { id:"areas",    label:"Life Areas"},
  ]},
  { section:"Work", items:[
    { id:"tasks",    label:"Tasks"     },
    { id:"projects", label:"Projects"  },
    { id:"notes",    label:"Notes"     },
    { id:"pages",    label:"Pages"     },
    { id:"listener", label:"Listener"  },
    { id:"calendar", label:"Calendar"  },
  ]},
  { section:"AI", items:[
    { id:"loops",    label:"Open Loops"    },
    { id:"actions",  label:"Action Items"  },
    { id:"sessions", label:"Sessions"      },
    { id:"people",   label:"People"        },
    { id:"tools",    label:"Tools Generator"},
    { id:"prompt",   label:"System Prompt" },
    { id:"settings", label:"Settings"      },
  ]},
];

// ── Nav icons — exact Blinklife style ─────────────────────────────────────────
function NavIcon({ id, active }) {
  const c = active ? "#000" : "#666";
  const s = { width:15, height:15, display:"block", flexShrink:0 };
  const icons = {
    today:    <svg style={s} viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke={c} strokeWidth="1.2"/><path d="M7.5 5v3l2 1.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    areas:    <svg style={s} viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke={c} strokeWidth="1.2"/><circle cx="7.5" cy="7.5" r="2.5" stroke={c} strokeWidth="1.2"/></svg>,
    tasks:    <svg style={s} viewBox="0 0 15 15" fill="none"><path d="M3 5.5h9M3 8h9M3 10.5h6" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    projects: <svg style={s} viewBox="0 0 15 15" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke={c} strokeWidth="1.2"/><rect x="8" y="2" width="5" height="5" rx="1" stroke={c} strokeWidth="1.2"/><rect x="2" y="8" width="5" height="5" rx="1" stroke={c} strokeWidth="1.2"/><rect x="8" y="8" width="5" height="5" rx="1" stroke={c} strokeWidth="1.2"/></svg>,
    notes:    <svg style={s} viewBox="0 0 15 15" fill="none"><rect x="2.5" y="1.5" width="10" height="12" rx="1.5" stroke={c} strokeWidth="1.2"/><path d="M5 5.5h5M5 8h5M5 10.5h3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    pages:    <svg style={s} viewBox="0 0 15 15" fill="none"><rect x="2.5" y="1.5" width="10" height="12" rx="1.5" stroke={c} strokeWidth="1.2"/><path d="M5 5.5h5M5 8h3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    listener: <svg style={s} viewBox="0 0 15 15" fill="none"><path d="M5 7.5a2.5 2.5 0 005 0V6a2.5 2.5 0 00-5 0v1.5z" stroke={c} strokeWidth="1.2"/><path d="M7.5 10v2.5M6 12.5h3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    calendar: <svg style={s} viewBox="0 0 15 15" fill="none"><rect x="2" y="3" width="11" height="10" rx="1.5" stroke={c} strokeWidth="1.2"/><path d="M5 2v2M10 2v2M2 6.5h11" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    loops:    <svg style={s} viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5a5 5 0 0010 0 5 5 0 00-10 0" stroke={c} strokeWidth="1.2"/><path d="M10 3l2.5 2.5L10 8" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    actions:  <svg style={s} viewBox="0 0 15 15" fill="none"><rect x="2" y="2" width="11" height="11" rx="1.5" stroke={c} strokeWidth="1.2"/><path d="M5 7.5l2 2 3.5-3.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    sessions: <svg style={s} viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5" stroke={c} strokeWidth="1.2"/><path d="M7.5 5v3l2 1.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    people:   <svg style={s} viewBox="0 0 15 15" fill="none"><circle cx="6" cy="5.5" r="2" stroke={c} strokeWidth="1.2"/><path d="M2.5 12c0-2 1.6-3.5 3.5-3.5s3.5 1.5 3.5 3.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><circle cx="11" cy="5.5" r="1.5" stroke={c} strokeWidth="1.2"/><path d="M13 12c0-1.5-1-2.7-2.5-3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    tools:    <svg style={s} viewBox="0 0 15 15" fill="none"><path d="M3.5 11.5l1.5-.5 5-5-.5-.5-5 5-1 1z" stroke={c} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 3.5l1-.5 1 1-1 1-1-1z" fill={c}/></svg>,
    prompt:   <svg style={s} viewBox="0 0 15 15" fill="none"><rect x="2" y="2" width="11" height="11" rx="1.5" stroke={c} strokeWidth="1.2"/><path d="M5 5.5h5M5 8h5M5 10.5h3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    settings: <svg style={s} viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="2" stroke={c} strokeWidth="1.2"/><path d="M7.5 2v1M7.5 12v1M2 7.5h1M12 7.5h1M3.5 3.5l.7.7M10.8 10.8l.7.7M3.5 11.5l.7-.7M10.8 4.2l.7-.7" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  };
  return icons[id] || null;
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function SoulSync() {
  const [nav, setNav]       = useState("projects");
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("ss_key") || "");
  const saveKey = k => { sessionStorage.setItem("ss_key", k); setApiKey(k); };

  const pages = {
    today:    <PlaceholderPage title="Today" note="Calendar integration coming — wire Google Calendar MCP" />,
    areas:    <PlaceholderPage title="Life Areas" note="Coming soon" />,
    tasks:    <PlaceholderPage title="Tasks" note="Coming soon" />,
    projects: <ProjectsPage />,
    notes:    <PlaceholderPage title="Notes" note="Coming soon" />,
    pages:    <PlaceholderPage title="Pages" note="Coming soon" />,
    listener: <PlaceholderPage title="Listener" note="Coming soon" />,
    calendar: <PlaceholderPage title="Calendar" note="Coming soon" />,
    loops:    <LoopsPage    apiKey={apiKey} />,
    actions:  <ActionsPage  apiKey={apiKey} />,
    sessions: <SessionsPage apiKey={apiKey} />,
    people:   <PeoplePage   apiKey={apiKey} />,
    tools:    <ToolsPage />,
    prompt:   <PromptPage />,
    settings: <SettingsPage apiKey={apiKey} onSave={saveKey} />,
  };

  return (
    <div style={{display:"flex",height:"100vh",fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",background:"#fff",overflow:"hidden",fontSize:14,color:"#111"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#eee;border-radius:2px;}

        /* Nav items — exact Blinklife */
        .ni{display:flex;align-items:center;gap:9px;padding:5px 10px;border-radius:6px;cursor:pointer;color:#444;font-size:13.5px;transition:color .1s;user-select:none;position:relative;}
        .ni:hover{color:#000;}
        .ni.on{color:#000;font-weight:500;}
        .ni.on::before{content:'';position:absolute;left:-14px;top:50%;transform:translateY(-50%);width:3px;height:20px;background:#2563eb;border-radius:0 3px 3px 0;}

        /* Tabs — exact Blinklife underline style */
        .tb{display:flex;align-items:center;gap:5px;padding:9px 2px;border:none;background:transparent;font-family:inherit;font-size:13.5px;color:#555;cursor:pointer;border-bottom:2px solid transparent;margin-right:20px;transition:color .12s,border-color .12s;}
        .tb:hover{color:#000;}
        .tb.on{color:#000;font-weight:500;border-bottom-color:#000;}
        .tc{font-size:12.5px;color:#999;}
        .tb.on .tc{color:#555;}

        /* Cards */
        .proj-card{background:#fff;border:1px solid #efefef;border-radius:12px;padding:22px 20px 16px;cursor:pointer;transition:box-shadow .15s,border-color .15s;position:relative;min-height:210px;display:flex;flex-direction:column;}
        .proj-card:hover{border-color:#e0e0e0;box-shadow:0 3px 14px rgba(0,0,0,0.06);}
        .del{position:absolute;bottom:14px;right:16px;font-size:12px;color:#d0d0d0;display:none;cursor:pointer;}
        .proj-card:hover .del{display:block;}

        /* Row items for Airtable data */
        .row{display:flex;align-items:flex-start;gap:12px;padding:13px 16px;border-bottom:1px solid #f7f7f7;transition:background .1s;}
        .row:last-child{border-bottom:none;}
        .row:hover{background:#fafafa;}

        /* Shared */
        .badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:5px;font-size:11.5px;font-weight:500;}
        .btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;border:none;transition:opacity .12s;}
        .btn:hover{opacity:.85;}.btn:disabled{opacity:.4;cursor:not-allowed;}
        .btn-blue{background:#2563eb;color:#fff;}
        .btn-ghost{background:#f3f4f6;color:#555;}
        .input{width:100%;border:1px solid #e8e8e8;border-radius:8px;padding:9px 12px;font-size:13.5px;font-family:inherit;outline:none;transition:border-color .12s;color:#111;background:#fff;}
        .input:focus{border-color:#2563eb;}
        .sel{width:100%;border:1px solid #e8e8e8;border-radius:8px;padding:9px 12px;font-size:13.5px;font-family:inherit;outline:none;background:#fff;color:#111;}
        .lbl{font-size:12px;font-weight:500;color:#555;margin-bottom:5px;}
        .dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:4px;}
        .code{background:#f8f8f8;border:1px solid #efefef;border-radius:10px;padding:18px;font-family:'DM Mono',monospace;font-size:12px;line-height:1.75;color:#333;white-space:pre-wrap;overflow-x:auto;}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:center;z-index:100;}
        .modal{background:#fff;border-radius:14px;padding:26px;width:480px;max-width:92vw;box-shadow:0 20px 60px rgba(0,0,0,0.12);}
        .nb{display:flex;align-items:center;gap:7px;background:#2563eb;color:#fff;border:none;border-radius:9px;padding:9px 18px;font-size:13.5px;font-weight:500;cursor:pointer;font-family:inherit;}
        .nb:hover{background:#1d4ed8;}.nb:disabled{opacity:.4;cursor:not-allowed;}
        textarea.input{resize:vertical;min-height:80px;}
        .si{border:none;background:transparent;outline:none;font-family:inherit;font-size:13.5px;color:#111;width:100%;}
        .si::placeholder{color:#c5c5c5;}
        .chat-btn{display:flex;align-items:center;gap:8px;background:#111;color:#fff;border:none;border-radius:22px;padding:10px 16px;font-size:13.5px;font-weight:500;cursor:pointer;font-family:inherit;width:100%;}
      `}</style>

      {/* ── SIDEBAR — exact Blinklife ── */}
      <aside style={{width:210,flexShrink:0,display:"flex",flexDirection:"column",padding:"20px 14px 18px",overflowY:"auto"}}>

        {/* Wordmark — plain text like Blinklife, no box */}
        <div style={{display:"flex",alignItems:"center",gap:7,paddingLeft:6,marginBottom:26}}>
          <span style={{fontSize:16,fontWeight:600,letterSpacing:"-0.03em",color:"#111"}}>soulsync</span>
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
            <circle cx="5" cy="5" r="4" fill="#2563eb"/>
            <circle cx="11" cy="5" r="4" fill="#93c5fd"/>
          </svg>
          {apiKey && <div style={{marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:"#22c55e",flexShrink:0}} title="Anne connected"/>}
        </div>

        {/* Nav sections */}
        {NAV.map(s => (
          <div key={s.section} style={{marginBottom:20}}>
            <div style={{fontSize:11.5,fontWeight:600,color:"#777",letterSpacing:"0.05em",padding:"0 10px",marginBottom:3}}>{s.section}</div>
            {s.items.map(it => (
              <div key={it.id} className={`ni${nav===it.id?" on":""}`} onClick={()=>setNav(it.id)}>
                <NavIcon id={it.id} active={nav===it.id}/>
                {it.label}
              </div>
            ))}
          </div>
        ))}

        {/* Chat button — exact Blinklife */}
        <div style={{marginTop:"auto"}}>
          <button className="chat-btn">
            <div style={{width:22,height:22,background:"#444",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0}}>TC</div>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 2h10a.5.5 0 01.5.5v6a.5.5 0 01-.5.5H5L1.5 11.5V2z" fill="white" opacity="0.7"/></svg>
            Chat
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{flex:1,overflowY:"auto",padding:"32px 36px 48px",background:"#fafafa"}}>
        {pages[nav] || pages.projects}
      </main>
    </div>
  );
}

// ── PROJECTS — exact Blinklife card layout ────────────────────────────────────
function ProjectsPage() {
  const [tab, setTab] = useState("All");
  const [q, setQ]     = useState("");

  const counts = {
    All: PROJECTS.length,
    Active: PROJECTS.filter(p=>p.status==="Active").length,
    "On Hold": PROJECTS.filter(p=>p.status==="On Hold").length,
    Completed: 0,
  };
  const list = PROJECTS.filter(p =>
    (tab==="All" || p.status===tab) &&
    (!q || p.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
        <h1 style={{fontSize:26,fontWeight:600,letterSpacing:"-0.025em"}}>Projects</h1>
        <button className="nb">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          New Project
        </button>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"1px solid #efefef",marginBottom:20}}>
        {["All","Active","On Hold","Completed"].map(t => (
          <button key={t} className={`tb${tab===t?" on":""}`} onClick={()=>setTab(t)}>
            {t} <span className="tc">{counts[t]}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{marginBottom:22}}>
        <div style={{display:"flex",alignItems:"center",gap:9,border:"1px solid #ebebeb",borderRadius:8,padding:"9px 14px",width:290,background:"#fff"}}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="#c5c5c5" strokeWidth="1.3"/><path d="M9 9l2.5 2.5" stroke="#c5c5c5" strokeWidth="1.3" strokeLinecap="round"/></svg>
          <input className="si" placeholder="Search projects..." value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
      </div>

      {/* Card grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:14}}>
        {list.map(p => (
          <div key={p.id} className="proj-card">
            <div style={{width:40,height:40,borderRadius:"50%",background:AVATAR_BG[p.category]||"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:14}}>{p.emoji}</div>
            <div style={{fontSize:15,fontWeight:500,color:"#111",letterSpacing:"-0.01em",marginBottom:3}}>{p.name}</div>
            <div style={{fontSize:13,color:"#555",marginBottom:10}}>{p.category}</div>
            {p.desc && <div style={{fontSize:12.5,color:"#555",lineHeight:1.55,flex:1,marginBottom:14}}>{p.desc.length>85?p.desc.slice(0,85)+"…":p.desc}</div>}
            <div style={{marginTop:"auto"}}>
              <div style={{fontSize:12,color:"#666",marginBottom:5}}>{p.tasks}</div>
              <span style={{fontSize:13,fontWeight:500,color:p.status==="Active"?"#16a34a":"#d97706"}}>{p.status}</span>
            </div>
            <span className="del">Delete</span>
          </div>
        ))}
        {list.length===0 && <div style={{gridColumn:"1/-1",padding:"60px 0",textAlign:"center",color:"#ccc",fontSize:14}}>No projects found</div>}
      </div>
    </div>
  );
}

// ── OPEN LOOPS ────────────────────────────────────────────────────────────────
function LoopsPage({ apiKey }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [modal, setModal]     = useState(false);
  const [tab, setTab]         = useState("All");
  const [form, setForm]       = useState({ name:"", priority:"Medium", domain:"AI", notes:"" });
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    if (!apiKey) return;
    setLoading(true); setError("");
    try { const d = await atFetch(apiKey, TABLES.openLoops); setRecords(d.records||[]); }
    catch(e) { setError(e.message); }
    setLoading(false);
  }, [apiKey]);
  useEffect(()=>{ load(); },[load]);

  const markDone = async id => {
    try { await atFetch(apiKey, TABLES.openLoops, {recordId:id,method:"PATCH",body:{fields:{Status:"Done"}}}); load(); }
    catch(e) { alert(e.message); }
  };

  const create = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await atFetch(apiKey, TABLES.openLoops, {method:"POST",body:{fields:{Name:form.name,Priority:form.priority,Domain:form.domain,Notes:form.notes,Status:"Open"}}});
      setModal(false); setForm({name:"",priority:"Medium",domain:"AI",notes:""}); load();
    } catch(e) { alert(e.message); }
    setSaving(false);
  };

  const domains = ["All",...new Set(records.map(r=>r.fields?.Domain||"").filter(Boolean))];
  const filtered = records.filter(r=>tab==="All"||r.fields?.Domain===tab);
  const counts = {All:records.length};
  domains.slice(1).forEach(d=>{counts[d]=records.filter(r=>r.fields?.Domain===d).length;});

  return (
    <div>
      <PageHdr title="Open Loops" count={records.length} onAdd={()=>setModal(true)} onRefresh={load} loading={loading} noKey={!apiKey}/>
      {error && <ErrBar msg={error}/>}
      {!apiKey && <KeyPrompt/>}
      {apiKey && <>
        <Tabs tabs={domains.slice(0,7)} counts={counts} active={tab} onChange={setTab}/>
        <div style={{background:"#fff",border:"1px solid #efefef",borderRadius:12,overflow:"hidden"}}>
          {filtered.length===0 && !loading && <Empty label="No open loops"/>}
          {filtered.map(r => (
            <div key={r.id} className="row">
              <div className="dot" style={{background:PRIORITY_DOT[r.fields?.Priority]||"#ddd"}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:500,color:"#111",marginBottom:4}}>{r.fields?.Name||"Untitled"}</div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  {r.fields?.Domain   && <span className="badge" style={{background:"#eff6ff",color:"#2563eb"}}>{r.fields.Domain}</span>}
                  {r.fields?.Priority && <span className="badge" style={{background:"#f9f9f9",color:"#888"}}>{r.fields.Priority}</span>}
                  {r.fields?.Status   && <span className="badge" style={{background:r.fields.Status==="Done"?"#f0fdf4":"#fff7ed",color:r.fields.Status==="Done"?"#16a34a":"#d97706"}}>{r.fields.Status}</span>}
                  {r.fields?.Notes    && <span style={{fontSize:12,color:"#777",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200}}>{r.fields.Notes}</span>}
                </div>
              </div>
              {r.fields?.Status!=="Done" && (
                <button className="btn btn-ghost" style={{padding:"4px 10px",fontSize:12,flexShrink:0}} onClick={()=>markDone(r.id)}>Done</button>
              )}
            </div>
          ))}
        </div>
      </>}
      {modal && (
        <Modal title="New Open Loop" onClose={()=>setModal(false)}>
          <Field label="Name *"><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Set up Telegram bot for Anne"/></Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}>
            <Field label="Priority"><select className="sel" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>{["High","Medium","Low"].map(p=><option key={p}>{p}</option>)}</select></Field>
            <Field label="Domain"><select className="sel" value={form.domain} onChange={e=>setForm({...form,domain:e.target.value})}>{["AI","Thai Moon","National Grid","Family","Health","Finance","Vision"].map(d=><option key={d}>{d}</option>)}</select></Field>
          </div>
          <Field label="Notes" style={{marginTop:12}}><textarea className="input" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Optional context..."/></Field>
          <ModalFooter onClose={()=>setModal(false)} onSave={create} saving={saving} label="Create Loop"/>
        </Modal>
      )}
    </div>
  );
}

// ── ACTION ITEMS ──────────────────────────────────────────────────────────────
function ActionsPage({ apiKey }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [modal, setModal]     = useState(false);
  const [tab, setTab]         = useState("All");
  const [form, setForm]       = useState({ title:"", priority:"Medium", project:"", dueDate:"", status:"To Do" });
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    if (!apiKey) return;
    setLoading(true); setError("");
    try { const d = await atFetch(apiKey, TABLES.actionItems); setRecords(d.records||[]); }
    catch(e) { setError(e.message); }
    setLoading(false);
  }, [apiKey]);
  useEffect(()=>{ load(); },[load]);

  const updateStatus = async (id, status) => {
    try { await atFetch(apiKey, TABLES.actionItems, {recordId:id,method:"PATCH",body:{fields:{Status:status}}}); load(); }
    catch(e) { alert(e.message); }
  };

  const create = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const fields = {Title:form.title,Priority:form.priority,Status:form.status};
      if (form.project) fields.Project = form.project;
      if (form.dueDate) fields["Due Date"] = form.dueDate;
      await atFetch(apiKey, TABLES.actionItems, {method:"POST",body:{fields}});
      setModal(false); setForm({title:"",priority:"Medium",project:"",dueDate:"",status:"To Do"}); load();
    } catch(e) { alert(e.message); }
    setSaving(false);
  };

  const statuses = ["All","To Do","In Progress","Done","Blocked"];
  const filtered = records.filter(r=>tab==="All"||r.fields?.Status===tab);
  const counts = {All:records.length};
  statuses.slice(1).forEach(s=>{counts[s]=records.filter(r=>r.fields?.Status===s).length;});

  return (
    <div>
      <PageHdr title="Action Items" count={records.length} onAdd={()=>setModal(true)} onRefresh={load} loading={loading} noKey={!apiKey}/>
      {error && <ErrBar msg={error}/>}
      {!apiKey && <KeyPrompt/>}
      {apiKey && <>
        <Tabs tabs={statuses} counts={counts} active={tab} onChange={setTab}/>
        <div style={{background:"#fff",border:"1px solid #efefef",borderRadius:12,overflow:"hidden"}}>
          {filtered.length===0 && !loading && <Empty label="No action items"/>}
          {filtered.map(r => (
            <div key={r.id} className="row">
              <div className="dot" style={{background:PRIORITY_DOT[r.fields?.Priority]||"#ddd"}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:500,color:r.fields?.Status==="Done"?"#ccc":"#111",textDecoration:r.fields?.Status==="Done"?"line-through":"none",marginBottom:4}}>
                  {r.fields?.Title||r.fields?.Name||"Untitled"}
                </div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  {r.fields?.Project        && <span className="badge" style={{background:"#eff6ff",color:"#2563eb"}}>{r.fields.Project}</span>}
                  {r.fields?.["Due Date"]   && <span style={{fontSize:12,color:"#f59e0b",fontWeight:500}}>Due {r.fields["Due Date"]}</span>}
                  {r.fields?.Priority       && <span className="badge" style={{background:"#f9f9f9",color:"#888"}}>{r.fields.Priority}</span>}
                </div>
              </div>
              <select className="sel" style={{width:118,fontSize:12,padding:"5px 8px",flexShrink:0}}
                value={r.fields?.Status||"To Do"}
                onChange={e=>updateStatus(r.id,e.target.value)}>
                {["To Do","In Progress","Done","Blocked"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      </>}
      {modal && (
        <Modal title="New Action Item" onClose={()=>setModal(false)}>
          <Field label="Title *"><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Write BCB session 2 outline"/></Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}>
            <Field label="Priority"><select className="sel" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>{["High","Medium","Low"].map(p=><option key={p}>{p}</option>)}</select></Field>
            <Field label="Status"><select className="sel" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{["To Do","In Progress","Blocked"].map(s=><option key={s}>{s}</option>)}</select></Field>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}>
            <Field label="Project"><input className="input" value={form.project} onChange={e=>setForm({...form,project:e.target.value})} placeholder="e.g. Anne OS Build"/></Field>
            <Field label="Due Date"><input className="input" type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></Field>
          </div>
          <ModalFooter onClose={()=>setModal(false)} onSave={create} saving={saving} label="Create Item"/>
        </Modal>
      )}
    </div>
  );
}

// ── SESSIONS ──────────────────────────────────────────────────────────────────
function SessionsPage({ apiKey }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async()=>{ if(!apiKey)return; setLoading(true); try{const d=await atFetch(apiKey,TABLES.sessions);setRecords(d.records||[]);}catch(e){} setLoading(false); },[apiKey]);
  useEffect(()=>{load();},[load]);
  return (
    <div>
      <PageHdr title="Sessions" count={records.length} onRefresh={load} loading={loading} noKey={!apiKey}/>
      {!apiKey && <KeyPrompt/>}
      {apiKey && (
        <div style={{background:"#fff",border:"1px solid #efefef",borderRadius:12,overflow:"hidden"}}>
          {records.length===0&&!loading&&<Empty label="No sessions logged yet — Anne will auto-log here once tools are active"/>}
          {records.map(r=>(
            <div key={r.id} className="row">
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:500,color:"#111",marginBottom:3}}>{r.fields?.Title||r.fields?.Name||"Session"}</div>
                <div style={{display:"flex",gap:8}}>
                  {r.fields?.Date&&<span style={{fontSize:12,color:"#aaa"}}>{r.fields.Date}</span>}
                  {r.fields?.Duration&&<span className="badge" style={{background:"#eff6ff",color:"#2563eb"}}>{r.fields.Duration}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PEOPLE ────────────────────────────────────────────────────────────────────
function PeoplePage({ apiKey }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async()=>{ if(!apiKey)return; setLoading(true); try{const d=await atFetch(apiKey,TABLES.people);setRecords(d.records||[]);}catch(e){} setLoading(false); },[apiKey]);
  useEffect(()=>{load();},[load]);
  const COLORS=["#dbeafe","#dcfce7","#ede9fe","#fce7f3","#fef9c3","#d1fae5","#fee2e2","#e0f2fe"];
  return (
    <div>
      <PageHdr title="People" count={records.length} onRefresh={load} loading={loading} noKey={!apiKey}/>
      {!apiKey && <KeyPrompt/>}
      {apiKey && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:14}}>
          {records.length===0&&!loading&&<div style={{gridColumn:"1/-1"}}><Empty label="No people yet"/></div>}
          {records.map((r,i)=>{
            const name=r.fields?.Name||"Unknown";
            const ini=name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
            return(
              <div key={r.id} style={{background:"#fff",border:"1px solid #efefef",borderRadius:12,padding:"18px 20px"}}>
                <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:10}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:COLORS[i%COLORS.length],display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:600,color:"#555",flexShrink:0}}>{ini}</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:500,color:"#111"}}>{name}</div>
                    {r.fields?.Role&&<div style={{fontSize:12,color:"#aaa"}}>{r.fields.Role}</div>}
                  </div>
                </div>
                {r.fields?.["Relationship Notes"]&&<div style={{fontSize:12,color:"#aaa",lineHeight:1.5}}>{r.fields["Relationship Notes"].slice(0,90)}{r.fields["Relationship Notes"].length>90?"…":""}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── TOOLS GENERATOR ───────────────────────────────────────────────────────────
function ToolsPage() {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(TOOLS_BLOCK).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2500);}); };
  return (
    <div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,gap:16}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:600,letterSpacing:"-0.025em",marginBottom:4}}>Tools Generator</h1>
          <p style={{fontSize:13.5,color:"#aaa",lineHeight:1.5}}>Copy this block and paste it at the end of Anne's system prompt in n8n. This is what makes her autonomous.</p>
        </div>
        <button className="nb" style={{flexShrink:0}} onClick={copy}>{copied?"Copied!":"Copy block"}</button>
      </div>
      <div className="code">{TOOLS_BLOCK}</div>
      <div style={{marginTop:14,background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"14px 18px"}}>
        <div style={{fontSize:13,fontWeight:600,color:"#92400e",marginBottom:6}}>How to apply in n8n</div>
        <ol style={{fontSize:13,color:"#78350f",lineHeight:2,paddingLeft:18}}>
          <li>Open n8n → Anne workflow → AI Agent node</li>
          <li>Find the System Prompt / Instructions text field</li>
          <li>Scroll to the bottom of the existing text</li>
          <li>Paste this block after the last line</li>
          <li>Save and re-activate the workflow</li>
        </ol>
      </div>
      <div style={{marginTop:10,background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"14px 18px"}}>
        <div style={{fontSize:13,fontWeight:600,color:"#1e40af",marginBottom:4}}>Long-term fix — auto-sync from file</div>
        <p style={{fontSize:13,color:"#1d4ed8",lineHeight:1.7}}>Add a <strong>Read Binary File</strong> node at the start of your n8n workflow reading <code style={{background:"#dbeafe",padding:"1px 5px",borderRadius:3,fontSize:11}}>/Users/tammy/Projects/Anne/ANNE_CONTEXT.md</code>. Pipe its output as the system prompt. Every edit to the file is live in Anne immediately — no more manual copy-paste.</p>
      </div>
    </div>
  );
}

// ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
function PromptPage() {
  const txt=`# Anne — Chief of Staff\n\nYou are Anne, Tammy Cusanno's AI Chief of Staff.\nYou are fast, direct, calm, and momentum-focused.\n\n## Identity\n- Speak like a trusted advisor, not an assistant\n- Don't pad responses — get to the point\n- When Tammy is overwhelmed, anchor her\n- Track open loops and actions across all domains\n\n## Domains\n- Thai Moon (Tanya + P'Aom as partners)\n- National Grid (Bryan, contracts & commercials)\n- Ocean Edge STR (5-Star Co-Host: Jen & Jhegs)\n- Family (Dante — hockey/baseball, Luke — creative/gaming)\n- AI / Personal OS (Anne build, Pinocchio, SoulSync)\n\n## Communication Style\n- Lead with the answer\n- Use bullets only when there are 3+ items\n- Never say "Great question"\n- Surface risks and blindspots Tammy isn't seeing\n\n## Memory\n- Static: ANNE_CONTEXT.md (this file)\n- Working: conversation context\n- Episodic: Airtable Sessions table\n\n⚠️  ## TOOLS section not yet added\n     Copy from Tools Generator and paste here + into n8n.`;
  return (
    <div>
      <h1 style={{fontSize:26,fontWeight:600,letterSpacing:"-0.025em",marginBottom:4}}>System Prompt</h1>
      <p style={{fontSize:13.5,color:"#aaa",marginBottom:14}}>Current <code style={{background:"#f3f4f6",padding:"1px 5px",borderRadius:4,fontSize:12}}>ANNE_CONTEXT.md</code></p>
      <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"11px 14px",marginBottom:14,fontSize:13,color:"#78350f"}}>
        ⚠️ The <strong>## TOOLS</strong> section is missing. Go to <strong>Tools Generator</strong> to fix this.
      </div>
      <div className="code" style={{maxHeight:480,overflowY:"auto"}}>{txt}</div>
    </div>
  );
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
function SettingsPage({ apiKey, onSave }) {
  const [key,setKey]=useState(apiKey);
  const [msg,setMsg]=useState("");
  const [ok,setOk]=useState(false);
  const [testing,setTesting]=useState(false);
  useEffect(()=>setKey(apiKey),[apiKey]);
  const test=async()=>{
    if(!key.trim())return; setTesting(true); setMsg("");
    try{const d=await atFetch(key,TABLES.openLoops,{fields:["Name"]});setMsg(`✓ Connected — ${d.records?.length||0} records in Open Loops`);setOk(true);}
    catch(e){setMsg("✗ "+e.message);setOk(false);}
    setTesting(false);
  };
  return (
    <div style={{maxWidth:520}}>
      <h1 style={{fontSize:26,fontWeight:600,letterSpacing:"-0.025em",marginBottom:20}}>Settings</h1>
      <div style={{background:"#fff",border:"1px solid #efefef",borderRadius:12,padding:"20px",marginBottom:14}}>
        <div style={{fontSize:14,fontWeight:600,marginBottom:14}}>Airtable API Key</div>
        <Field label="Personal Access Token"><input className="input" type="password" value={key} onChange={e=>setKey(e.target.value)} placeholder="patXXXXXXXXXXXXXX"/></Field>
        <div style={{fontSize:12,color:"#bbb",marginTop:6,marginBottom:14}}>Get yours at <span style={{color:"#2563eb",cursor:"pointer"}} onClick={()=>window.open("https://airtable.com/create/tokens","_blank")}>airtable.com/create/tokens</span> — needs read/write on Anne OS base.</div>
        {msg&&<div style={{fontSize:13,color:ok?"#16a34a":"#ef4444",padding:"8px 12px",background:ok?"#f0fdf4":"#fef2f2",borderRadius:7,marginBottom:12}}>{msg}</div>}
        <div style={{display:"flex",gap:10}}>
          <button className="btn btn-ghost" onClick={test} disabled={testing}>{testing?"Testing…":"Test connection"}</button>
          <button className="btn btn-blue" onClick={()=>onSave(key)}>Save key</button>
        </div>
      </div>
      <div style={{background:"#fff",border:"1px solid #efefef",borderRadius:12,padding:"20px"}}>
        <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>Base configuration</div>
        <div style={{fontSize:13,color:"#888",lineHeight:2}}>
          <div><strong>Base ID:</strong> <code style={{background:"#f3f4f6",padding:"1px 6px",borderRadius:4,fontSize:11}}>{BASE_ID}</code></div>
          {Object.entries(TABLES).map(([k,v])=><div key={k}><strong>{k}:</strong> <code style={{background:"#f3f4f6",padding:"1px 6px",borderRadius:4,fontSize:11}}>{v}</code></div>)}
        </div>
      </div>
    </div>
  );
}

// ── PLACEHOLDER ───────────────────────────────────────────────────────────────
function PlaceholderPage({ title, note }) {
  return (
    <div>
      <h1 style={{fontSize:26,fontWeight:600,letterSpacing:"-0.025em",marginBottom:20}}>{title}</h1>
      <div style={{background:"#fff",border:"1px solid #efefef",borderRadius:12,padding:"48px 20px",textAlign:"center",color:"#777",fontSize:14}}>{note}</div>
    </div>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────
function PageHdr({ title, count, onAdd, onRefresh, loading, noKey }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
      <h1 style={{fontSize:26,fontWeight:600,letterSpacing:"-0.025em"}}>{title}{count>0&&<span style={{fontSize:16,color:"#ccc",fontWeight:400,marginLeft:6}}>{count}</span>}</h1>
      <div style={{display:"flex",gap:8}}>
        {onRefresh&&<button className="btn btn-ghost" onClick={onRefresh} disabled={loading||noKey}>
          {loading?"Loading…":"Refresh"}
        </button>}
        {onAdd&&<button className="nb" disabled={noKey}>+ Add new</button>}
      </div>
    </div>
  );
}
function Tabs({ tabs, counts, active, onChange }) {
  return (
    <div style={{display:"flex",borderBottom:"1px solid #efefef",marginBottom:16}}>
      {tabs.map(t=><button key={t} className={`tb${active===t?" on":""}`} onClick={()=>onChange(t)}>{t} <span className="tc">{counts[t]||0}</span></button>)}
    </div>
  );
}
function Field({ label, children, style }) { return <div style={style}><div className="lbl">{label}</div>{children}</div>; }
function ModalFooter({ onClose, onSave, saving, label }) {
  return (
    <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:18}}>
      <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      <button className="btn btn-blue" onClick={onSave} disabled={saving}>{saving?"Saving…":label}</button>
    </div>
  );
}
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
          <div style={{fontSize:16,fontWeight:600}}>{title}</div>
          <button style={{background:"none",border:"none",cursor:"pointer",color:"#bbb",fontSize:22,lineHeight:1}} onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Empty({ label }) { return <div style={{padding:"40px 20px",textAlign:"center",color:"#777",fontSize:14}}>{label}</div>; }
function ErrBar({ msg }) { return <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#ef4444"}}>{msg}</div>; }
function KeyPrompt() { return <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"14px 18px",fontSize:13,color:"#1d4ed8"}}>Add your Airtable API key in <strong>Settings</strong> to connect Anne's live data.</div>; }
