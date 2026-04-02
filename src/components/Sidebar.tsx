"use client";
// src/components/Sidebar.tsx

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { section: "Core", items: [
    { href: "/",          label: "Today"          },
    { href: "/projects",  label: "Projects"       },
  ]},
  { section: "Work", items: [
    { href: "/loops",     label: "Open Loops"     },
    { href: "/actions",   label: "Action Items"   },
    { href: "/sessions",  label: "Sessions"       },
    { href: "/people",    label: "People"         },
  ]},
  { section: "AI", items: [
    { href: "/brain",     label: "Brain"          },
    { href: "/my-ai",     label: "My AI"          },
    { href: "/tools",     label: "Tools Generator"},
    { href: "/prompt",    label: "System Prompt"  },
    { href: "/settings",  label: "Settings"       },
  ]},
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 210,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      padding: "20px 14px 18px",
      overflowY: "auto",
      background: "#fff",
      borderRight: "1px solid #efefef",
    }}>
      {/* Wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, paddingLeft: 6, marginBottom: 26 }}>
        <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.03em", color: "#111" }}>
          soulsync
        </span>
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
          <circle cx="5"  cy="5" r="4" fill="#2563eb" />
          <circle cx="11" cy="5" r="4" fill="#93c5fd" />
        </svg>
      </div>

      {/* Nav sections */}
      {NAV.map(section => (
        <div key={section.section} style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: "#777",
            letterSpacing: "0.05em",
            padding: "0 10px",
            marginBottom: 3,
          }}>
            {section.section}
          </div>
          {section.items.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`ni${active ? " active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}

      {/* Chat button */}
      <div style={{ marginTop: "auto" }}>
        <button className="chat-btn">
          <div style={{
            width: 22, height: 22,
            background: "#444",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0,
          }}>
            TC
          </div>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1.5 2h10a.5.5 0 01.5.5v6a.5.5 0 01-.5.5H5L1.5 11.5V2z" fill="white" opacity="0.7" />
          </svg>
          Chat
        </button>
      </div>
    </aside>
  );
}
