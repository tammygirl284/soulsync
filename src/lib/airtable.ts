// src/lib/airtable.ts
// Central Airtable fetch helper — used by all pages and API routes.

export const BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID ?? "app0QFzXHkZ6MeiO1";

export const TABLES = {
  openLoops:    "Open Loops",
  actionItems:  "Action Items",
  sessions:     "Sessions",
  people:       "People",
  observations:   "Observations",
  messageBuffer:  "Message Buffer",
} as const;

export type TableName = keyof typeof TABLES;

interface FetchOpts {
  recordId?:      string;
  method?:        "GET" | "POST" | "PATCH" | "DELETE";
  body?:          object;
  filterFormula?: string;
  fields?:        string[];
  apiKey:         string;
}

export async function atFetch<T = unknown>(
  table: string,
  opts: FetchOpts
): Promise<T> {
  const { recordId, method = "GET", body, filterFormula, fields, apiKey } = opts;

  let url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`;
  if (recordId) url += `/${recordId}`;

  const params = new URLSearchParams();
  if (filterFormula) params.set("filterByFormula", filterFormula);
  if (fields) fields.forEach(f => params.append("fields[]", f));
  if ([...params].length) url += "?" + params.toString();

  const res = await fetch(url, {
    method,
    headers: {
      Authorization:  `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    // Don't cache Airtable responses in Next.js fetch cache
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ── Client-side fetch (calls server proxy, no API key in browser) ─────────────

interface ClientFetchOpts {
  recordId?:      string;
  method?:        "GET" | "POST" | "PATCH" | "DELETE";
  body?:          object;
  filterFormula?: string;
  fields?:        string[];
}

export async function apiFetch<T = unknown>(
  table: string,
  opts: ClientFetchOpts = {}
): Promise<T> {
  const { recordId, method = "GET", body, filterFormula, fields } = opts;
  let url = `/api/airtable/${encodeURIComponent(table)}`;
  const params = new URLSearchParams();
  if (recordId)      params.set("recordId", recordId);
  if (filterFormula) params.set("filterByFormula", filterFormula);
  if (fields)        fields.forEach(f => params.append("fields[]", f));
  if ([...params].length) url += "?" + params.toString();
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Typed record shapes ───────────────────────────────────────────────────────

export interface AirtableRecord<F = Record<string, unknown>> {
  id:          string;
  createdTime: string;
  fields:      F;
}

export interface AirtableList<F = Record<string, unknown>> {
  records: AirtableRecord<F>[];
  offset?: string;
}

export interface OpenLoopFields {
  "Loop Name"?:  string;
  Priority?:     string;
  Domain?:       string;
  Status?:       string;
  Description?:  string;
  "Anne's Watch Note"?: string;
}

export interface ActionItemFields {
  Task?:       string;
  Priority?:   string;
  Status?:     string;
  Domain?:     string;
  "Due Date"?: string;
  Notes?:      string;
}

export interface SessionFields {
  Title?:           string;
  Date?:            string;
  Summary?:         string;
  "Domain(s)"?:     string;
  "Key Decisions"?: string;
}

export interface PersonFields {
  Name?:         string;
  Role?:         string;
  Domain?:       string;
  Relationship?: string;
  Notes?:        string;
}

export interface MessageBufferFields {
  Message?:   string;
  Response?:  string;
  Timestamp?: string;
  "Chat ID"?: string;
  Logged?:    boolean;
}

export interface ObservationFields {
  Observation?:   string;
  Date?:          string;
  Category?:      string;
  Domain?:        string;
  Detail?:        string;
  Acknowledged?:  boolean;
  Outcome?:       string;
}
