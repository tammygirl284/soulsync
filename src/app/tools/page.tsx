"use client";
// src/app/tools/page.tsx

import { useState } from "react";
import { TOOLS_BLOCK } from "@/lib/toolsBlock";

export default function ToolsPage() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(TOOLS_BLOCK).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.025em", marginBottom: 4 }}>Tools Generator</h1>
          <p style={{ fontSize: 13.5, color: "#777", lineHeight: 1.5 }}>
            Copy this block and paste it at the end of Anne&apos;s system prompt in n8n. This is what makes her autonomous.
          </p>
        </div>
        <button className="nb" style={{ flexShrink: 0 }} onClick={copy}>
          {copied ? "Copied!" : "Copy block"}
        </button>
      </div>

      <div className="code-block">{TOOLS_BLOCK}</div>

      {/* How to apply */}
      <div style={{ marginTop: 14, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "14px 18px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginBottom: 6 }}>How to apply in n8n</div>
        <ol style={{ fontSize: 13, color: "#78350f", lineHeight: 2, paddingLeft: 18 }}>
          <li>Open n8n → Anne workflow → AI Agent node</li>
          <li>Find the System Prompt / Instructions text field</li>
          <li>Scroll to the bottom of the existing text</li>
          <li>Paste this block after the last line</li>
          <li>Save and re-activate the workflow</li>
        </ol>
      </div>

      {/* Long-term fix */}
      <div style={{ marginTop: 10, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "14px 18px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1e40af", marginBottom: 4 }}>Long-term fix — auto-sync from file</div>
        <p style={{ fontSize: 13, color: "#1d4ed8", lineHeight: 1.7 }}>
          Add a <strong>Read Binary File</strong> node at the start of your n8n workflow reading{" "}
          <code style={{ background: "#dbeafe", padding: "1px 5px", borderRadius: 3, fontSize: 11 }}>
            /Users/tammy/Projects/Anne/ANNE_CONTEXT.md
          </code>.
          Pipe its output as the system prompt. Every edit to the file is live in Anne immediately — no more manual copy-paste.
        </p>
      </div>
    </div>
  );
}
