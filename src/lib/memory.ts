// src/lib/memory.ts
// TypeScript types for Anne's memory.json schema

export interface Commitment {
  id: string;
  what: string;
  made_on: string | null;
  due: string | null;
  status: 'open' | 'done' | 'cancelled';
  last_surfaced: string | null;
  anne_note: string;
}

export interface ShortTermItem {
  id: string;
  what: string;
  domain: string;
  priority: 'High' | 'Medium' | 'Low';
  due: string | null;
  status: 'open' | 'done';
}

export interface WatchItem {
  id: string;
  what: string;
  domain: string;
  last_moved: string | null;
  anne_note: string;
}

export interface AnneMemory {
  version: string;
  last_updated: string | null;
  tammy_state: {
    last_known_mood: string | null;
    last_known_energy: string | null;
    last_interaction: string | null;
    session_count: number;
    stress_signals: string[];
    notes: string | null;
  };
  commitments: Commitment[];
  watching: WatchItem[];
  short_term: ShortTermItem[];
  flags: Record<string, boolean | string | null>;
  last_session: {
    date: string | null;
    summary: string | null;
    key_decisions: string[];
    domains_covered: string[];
    mood: string | null;
    energy: string | null;
  };
}
