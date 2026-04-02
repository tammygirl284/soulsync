// src/app/api/last-updated/route.ts
// Returns the last webhook timestamp from KV. Browser polls this every 10s.

import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import("@vercel/kv");
    const ts = await kv.get<number>("soulsync:last_updated");
    return NextResponse.json({ ts: ts ?? 0 }, { headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json({ ts: 0 });
}
