// src/hooks/useAirtableSync.ts
// Polls /api/last-updated every 10s. When the timestamp changes (webhook fired),
// calls onRefresh() so the page re-fetches from Airtable.

import { useEffect, useRef } from "react";

export function useAirtableSync(onRefresh: () => void) {
  const tsRef       = useRef<number>(0);
  const refreshRef  = useRef(onRefresh);
  refreshRef.current = onRefresh;

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/last-updated");
        const { ts } = await res.json() as { ts: number };
        if (ts > 0 && ts > tsRef.current) {
          const isFirstLoad = tsRef.current === 0;
          tsRef.current = ts;
          if (!isFirstLoad) refreshRef.current();
        } else if (tsRef.current === 0) {
          tsRef.current = ts;
        }
      } catch { /* ignore network errors */ }
    };

    check(); // run once immediately to set baseline
    const id = setInterval(check, 10_000);
    return () => clearInterval(id);
  }, []);
}
