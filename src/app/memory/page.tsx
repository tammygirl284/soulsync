"use client";
// src/app/memory/page.tsx

import { useState, useEffect } from 'react';
import type { AnneMemory } from '@/lib/memory';

const STATUS_COLOR: Record<string, string> = {
  open:      '#d97706',
  done:      '#16a34a',
  cancelled: '#9ca3af',
};

export default function MemoryPage() {
  const [mem, setMem] = useState<AnneMemory | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch('/api/memory')
      .then(r => r.json())
      .then(data => {
        if (data.error) setErr(data.error);
        else setMem(data);
      })
      .catch(() => setErr('Memory file not found — is Pinocchio running?'));
  }, []);

  if (err) return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 12 }}>Anne Memory</h1>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', fontSize: 13, color: '#ef4444' }}>
        {err}
      </div>
    </div>
  );

  if (!mem) return (
    <div style={{ color: '#aaa', fontSize: 14 }}>Loading Anne&apos;s memory…</div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.025em' }}>Anne Memory</h1>
        <span style={{ fontSize: 12, color: '#aaa' }}>
          Last updated: {mem.last_updated ?? 'never'} · Sessions: {mem.tammy_state.session_count}
        </span>
      </div>

      {/* Tammy state bar */}
      {(mem.tammy_state.last_known_mood || mem.tammy_state.notes) && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#1d4ed8' }}>
          {mem.tammy_state.last_known_mood && <span>Mood: <strong>{mem.tammy_state.last_known_mood}</strong>&nbsp;&nbsp;·&nbsp;&nbsp;</span>}
          {mem.tammy_state.last_known_energy && <span>Energy: <strong>{mem.tammy_state.last_known_energy}</strong>&nbsp;&nbsp;·&nbsp;&nbsp;</span>}
          {mem.tammy_state.notes && <span>{mem.tammy_state.notes}</span>}
        </div>
      )}

      {/* Active flags */}
      {Object.entries(mem.flags).some(([, v]) => v === true) && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#92400e' }}>
          ⚠️ Active flags: {Object.entries(mem.flags).filter(([, v]) => v === true).map(([k]) => k.replace(/_/g, ' ')).join(' · ')}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>

        {/* Commitments */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Commitments</h2>
          <div style={{ background: '#fff', border: '1px solid #efefef', borderRadius: 12, overflow: 'hidden' }}>
            {mem.commitments.length === 0 && (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#ccc', fontSize: 13 }}>No commitments</div>
            )}
            {mem.commitments.map(c => (
              <div key={c.id} className="data-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: '#111', marginBottom: 3 }}>{c.what}</div>
                  <div style={{ fontSize: 11.5, color: '#aaa' }}>{c.anne_note}</div>
                  {c.due && <div style={{ fontSize: 11.5, color: '#f59e0b', marginTop: 2 }}>Due: {c.due}</div>}
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: STATUS_COLOR[c.status] ?? '#aaa', flexShrink: 0 }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Watching */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Watching</h2>
          <div style={{ background: '#fff', border: '1px solid #efefef', borderRadius: 12, overflow: 'hidden' }}>
            {mem.watching.length === 0 && (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#ccc', fontSize: 13 }}>Nothing being watched</div>
            )}
            {mem.watching.map(w => (
              <div key={w.id} className="data-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: '#111', marginBottom: 3 }}>{w.what}</div>
                  <div style={{ fontSize: 11.5, color: '#aaa' }}>{w.anne_note}</div>
                </div>
                <span className="badge" style={{ background: '#eff6ff', color: '#2563eb', flexShrink: 0 }}>{w.domain}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Short term */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Short Term</h2>
          <div style={{ background: '#fff', border: '1px solid #efefef', borderRadius: 12, overflow: 'hidden' }}>
            {mem.short_term.length === 0 && (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#ccc', fontSize: 13 }}>No short-term items</div>
            )}
            {mem.short_term.map(s => (
              <div key={s.id} className="data-row">
                <div style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                  background: s.priority === 'High' ? '#ef4444' : s.priority === 'Medium' ? '#f59e0b' : '#22c55e',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: '#111' }}>{s.what}</div>
                  {s.due && <div style={{ fontSize: 11.5, color: '#f59e0b', marginTop: 2 }}>Due: {s.due}</div>}
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: STATUS_COLOR[s.status] ?? '#aaa', flexShrink: 0 }}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Last session */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Last Session</h2>
          <div style={{ background: '#fff', border: '1px solid #efefef', borderRadius: 12, padding: '16px 18px' }}>
            {!mem.last_session.date ? (
              <div style={{ color: '#ccc', fontSize: 13 }}>No sessions logged yet</div>
            ) : (
              <>
                <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>{mem.last_session.date}</div>
                <div style={{ fontSize: 13.5, color: '#333', lineHeight: 1.6, marginBottom: 10 }}>
                  {mem.last_session.summary}
                </div>
                {mem.last_session.key_decisions.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 4 }}>Key decisions</div>
                    {mem.last_session.key_decisions.map((d, i) => (
                      <div key={i} style={{ fontSize: 12.5, color: '#555', marginBottom: 2 }}>· {d}</div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
