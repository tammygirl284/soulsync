"use client";
// src/app/listener/page.tsx

import { useState, useEffect, useRef, useCallback } from "react";

type Source    = "Microphone" | "Mic + Computer";
type Mode      = "Listen Only" | "Listen & Comment";
type Frequency = "30s" | "1m" | "2m" | "5m" | "10m";
type State     = "idle" | "connecting" | "recording";

interface ChatMessage {
  role: "anne" | "user";
  text: string;
  time: string;
}

const BAR_COUNT = 60;

function now() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// ── Waveform ──────────────────────────────────────────────────────────────────

function Waveform({ active, progress }: { active: boolean; progress: number }) {
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => i);
  const filled = Math.floor((progress / 100) * BAR_COUNT);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 3,
      height: 80,
      padding: "0 4px",
    }}>
      {bars.map(i => {
        const isPast   = i < filled;
        const isCursor = i === filled;
        const seed     = Math.sin(i * 2.3 + 1) * 0.5 + 0.5;
        const baseH    = 12 + seed * 52;

        return (
          <div
            key={i}
            style={{
              flex: 1,
              borderRadius: 2,
              background: isPast ? "#7c3aed" : isCursor ? "#2563eb" : "#e5e7eb",
              height: active && isPast
                ? undefined
                : `${baseH}%`,
              minHeight: 4,
              animation: active && isPast
                ? `wave-${(i % 5) + 1} 0.8s ease-in-out infinite alternate`
                : "none",
              animationDelay: `${(i % 5) * 0.12}s`,
            }}
          />
        );
      })}

      <style>{`
        @keyframes wave-1 { from { height: 20% } to { height: 70% } }
        @keyframes wave-2 { from { height: 30% } to { height: 85% } }
        @keyframes wave-3 { from { height: 15% } to { height: 60% } }
        @keyframes wave-4 { from { height: 40% } to { height: 90% } }
        @keyframes wave-5 { from { height: 25% } to { height: 75% } }
      `}</style>
    </div>
  );
}

// ── Timer ─────────────────────────────────────────────────────────────────────

function useTimer(running: boolean) {
  const [secs, setSecs] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSecs(s => s + 1), 1000);
    } else {
      if (ref.current) clearInterval(ref.current);
      setSecs(0);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const m = String(Math.floor(secs / 60)).padStart(1, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ListenerPage() {
  const [state, setState]         = useState<State>("idle");
  const [source, setSource]       = useState<Source>("Mic + Computer");
  const [mode, setMode]           = useState<Mode>("Listen & Comment");
  const [frequency, setFrequency] = useState<Frequency>("1m");
  const [progress, setProgress]   = useState(0);
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [input, setInput]         = useState("");
  const chatRef                   = useRef<HTMLDivElement>(null);
  const timer                     = useTimer(state === "recording");

  // Simulate progress when recording
  useEffect(() => {
    if (state !== "recording") { setProgress(0); return; }
    const id = setInterval(() => setProgress(p => Math.min(p + 0.15, 100)), 300);
    return () => clearInterval(id);
  }, [state]);

  // Auto-scroll chat
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleStart = useCallback(() => {
    setState("connecting");
    setTimeout(() => {
      setState("recording");
      if (mode === "Listen & Comment") {
        setMessages([{
          role: "anne",
          text: "Got it — I'm all ears. Just say \"Hey Anne\" whenever something lands, and I'll jump in with my take. Let's see what's happening.",
          time: now(),
        }]);
      }
    }, 1800);
  }, [mode]);

  const handleStop = useCallback(() => {
    setState("idle");
    setProgress(0);
    setMessages([]);
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() || state !== "recording") return;
    const userMsg: ChatMessage = { role: "user", text: input.trim(), time: now() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages(m => [...m, {
        role: "anne",
        text: "I heard that. Give me a moment to process what was said in context — I'll surface the key insight shortly.",
        time: now(),
      }]);
    }, 1200);
  }, [input, state]);

  // ── Layout: bleeds out of main padding ──────────────────────────────────────
  return (
    <div style={{
      margin: "-32px -36px -48px",
      height: "100vh",
      display: "flex",
      overflow: "hidden",
      background: "#fff",
    }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: "0 0 57%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #efefef",
        overflow: "hidden",
      }}>

        {/* Top bar — recording only */}
        {state === "recording" && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 20px",
            borderBottom: "1px solid #efefef",
            flexWrap: "wrap",
          }}>
            {/* Recording indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginRight: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ef4444", display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: 13.5, fontWeight: 500 }}>Recording</span>
              <span style={{ fontSize: 13, color: "#888", fontVariantNumeric: "tabular-nums" }}>{timer}</span>
            </div>

            {/* Source selector */}
            <div style={{ display: "flex", gap: 1, background: "#f3f4f6", borderRadius: 7, padding: 2 }}>
              {(["Microphone", "Mic + Computer"] as Source[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSource(s)}
                  style={{
                    fontSize: 12, padding: "4px 10px", borderRadius: 5, border: "none", cursor: "pointer",
                    background: source === s ? "#fff" : "transparent",
                    color: source === s ? "#111" : "#666",
                    fontFamily: "inherit",
                    boxShadow: source === s ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    fontWeight: source === s ? 500 : 400,
                  }}
                >{s}</button>
              ))}
            </div>

            {/* AI label */}
            <div style={{
              fontSize: 12.5, fontWeight: 500, padding: "4px 10px",
              background: "#f3f4f6", borderRadius: 6, color: "#333",
            }}>
              Anne
            </div>

            {/* Mode toggle */}
            <div style={{ display: "flex", gap: 1, background: "#f3f4f6", borderRadius: 7, padding: 2 }}>
              {(["Listen Only", "Listen & Comment"] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    fontSize: 12, padding: "4px 10px", borderRadius: 5, border: "none", cursor: "pointer",
                    background: mode === m ? "#fff" : "transparent",
                    color: mode === m ? "#111" : "#666",
                    fontFamily: "inherit",
                    boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    fontWeight: mode === m ? 500 : 400,
                    whiteSpace: "nowrap",
                  }}
                >{m}</button>
              ))}
            </div>

            {/* Frequency */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
              <span style={{ fontSize: 12, color: "#888" }}>Frequency:</span>
              {(["30s", "1m", "2m", "5m", "10m"] as Frequency[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  style={{
                    fontSize: 12, padding: "3px 8px", border: "none", cursor: "pointer",
                    background: frequency === f ? "#111" : "transparent",
                    color: frequency === f ? "#fff" : "#666",
                    borderRadius: 5, fontFamily: "inherit",
                    fontWeight: frequency === f ? 500 : 400,
                  }}
                >{f}</button>
              ))}
            </div>
          </div>
        )}

        {/* Center content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 40px" }}>

          {/* IDLE state */}
          {state === "idle" && (
            <div style={{ textAlign: "center", maxWidth: 420 }}>
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 10 }}>
                Ready to Listen
              </div>
              <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6, marginBottom: 32 }}>
                Start a listening session and Anne will hear what you hear — meetings, seminars, conversations.
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
                {(["Microphone", "Mic + Computer"] as Source[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setSource(s)}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "10px 18px", borderRadius: 10,
                      border: `1.5px solid ${source === s ? "#2563eb" : "#e5e7eb"}`,
                      background: source === s ? "#eff6ff" : "#fff",
                      color: source === s ? "#2563eb" : "#444",
                      fontSize: 13.5, fontWeight: 500, cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {s === "Microphone" ? "🎙" : "🖥"} {s}
                  </button>
                ))}
              </div>
              {source === "Mic + Computer" && (
                <div style={{ fontSize: 12.5, color: "#999", lineHeight: 1.6, marginBottom: 28 }}>
                  You&apos;ll be asked to share a screen or tab. Audio from Zoom, YouTube, and other apps will be captured alongside your microphone.
                </div>
              )}
              <button
                className="nb"
                onClick={handleStart}
                style={{ fontSize: 14, padding: "11px 32px" }}
              >
                Start listening
              </button>
            </div>
          )}

          {/* CONNECTING state */}
          {state === "connecting" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 12 }}>
                Ready to Listen
              </div>
              <button
                disabled
                style={{
                  fontSize: 14, padding: "11px 32px",
                  background: "#f3f4f6", border: "none", borderRadius: 10,
                  color: "#999", cursor: "not-allowed", fontFamily: "inherit",
                }}
              >
                Connecting…
              </button>
            </div>
          )}

          {/* RECORDING state */}
          {state === "recording" && (
            <div style={{ width: "100%", maxWidth: 560 }}>
              <Waveform active progress={progress} />
            </div>
          )}
        </div>

        {/* Bottom controls — recording only */}
        {state === "recording" && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 20, padding: "20px 0 28px",
            borderTop: "1px solid #f3f4f6",
          }}>
            {/* Pause */}
            <button
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "#f3f4f6", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}
              title="Pause"
            >⏸</button>

            {/* Screenshot */}
            <button
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "#f3f4f6", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}
              title="Screenshot"
            >📷</button>

            {/* Stop */}
            <button
              onClick={handleStop}
              style={{
                width: 54, height: 54, borderRadius: "50%",
                background: "#ef4444", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, color: "#fff",
              }}
              title="Stop recording"
            >■</button>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL — Anne chat ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Chat header */}
        <div style={{
          padding: "14px 20px",
          borderBottom: "1px solid #efefef",
          fontSize: 14, fontWeight: 500, color: "#333",
        }}>
          Anne
        </div>

        {/* Messages */}
        <div
          ref={chatRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {messages.length === 0 && (
            <div style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              color: "#bbb", fontSize: 13.5, textAlign: "center",
            }}>
              {state === "idle"
                ? "Start a listening session, then chat here."
                : "Connecting Anne…"}
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ maxWidth: "85%" }}>
              <div style={{
                background: msg.role === "anne" ? "#fff" : "#eff6ff",
                border: `1px solid ${msg.role === "anne" ? "#efefef" : "#bfdbfe"}`,
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 13.5,
                lineHeight: 1.6,
                color: "#111",
              }}>
                {msg.text}
              </div>
              <div style={{ fontSize: 11.5, color: "#bbb", marginTop: 4, paddingLeft: 4 }}>
                {msg.time}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid #efefef",
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}>
          <button style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 18, color: "#ccc", padding: "0 4px", flexShrink: 0,
          }}>📎</button>
          <input
            className="input-field"
            placeholder="Type a message…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            disabled={state !== "recording"}
            style={{ flex: 1 }}
          />
          <button
            onClick={handleSend}
            disabled={state !== "recording" || !input.trim()}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 18, color: input.trim() && state === "recording" ? "#2563eb" : "#ccc",
              padding: "0 4px", flexShrink: 0,
            }}
          >➤</button>
        </div>
      </div>
    </div>
  );
}
