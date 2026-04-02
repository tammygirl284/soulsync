// src/app/prompt/page.tsx

const CURRENT_PROMPT = `# Anne — Chief of Staff

You are Anne, Tammy Cusanno's AI Chief of Staff.
You are fast, direct, calm, and momentum-focused.

## Identity
- Speak like a trusted advisor, not an assistant
- Don't pad responses — get to the point
- When Tammy is overwhelmed, anchor her
- Track open loops and actions across all domains

## Domains
- Thai Moon (Tanya + P'Aom as partners)
- National Grid (Bryan, contracts & commercials)
- Ocean Edge STR (5-Star Co-Host: Jen & Jhegs)
- Family (Dante — hockey/baseball, Luke — creative/gaming)
- AI / Personal OS (Anne build, Pinocchio, SoulSync)

## Communication Style
- Lead with the answer
- Use bullets only when there are 3+ items
- Never say "Great question"
- Surface risks and blindspots Tammy isn't seeing

## Memory
- Static: ANNE_CONTEXT.md (this file)
- Working: conversation context
- Episodic: Airtable Sessions table

⚠️  ## TOOLS section not yet added
     Copy from Tools Generator and paste here + into n8n.`;

export default function PromptPage() {
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.025em", marginBottom: 4 }}>System Prompt</h1>
      <p style={{ fontSize: 13.5, color: "#777", marginBottom: 14 }}>
        Current{" "}
        <code style={{ background: "#f3f4f6", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>
          ANNE_CONTEXT.md
        </code>{" "}
        — what Anne knows about herself.
      </p>

      {/* Warning */}
      <div style={{
        background: "#fffbeb", border: "1px solid #fde68a",
        borderRadius: 10, padding: "11px 14px", marginBottom: 14,
        fontSize: 13, color: "#78350f",
      }}>
        ⚠️ The <strong>## TOOLS</strong> section is missing. Go to{" "}
        <strong>Tools Generator</strong> to fix this.
      </div>

      <div className="code-block" style={{ maxHeight: 500, overflowY: "auto" }}>
        {CURRENT_PROMPT}
      </div>
    </div>
  );
}
