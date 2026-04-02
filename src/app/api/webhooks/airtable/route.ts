// src/app/api/webhooks/airtable/route.ts
// Receives Airtable webhook pings and writes a timestamp to Vercel KV.

import { NextResponse } from "next/server";

export async function POST() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import("@vercel/kv");
    await kv.set("soulsync:last_updated", Date.now());
  }
  return NextResponse.json({ ok: true });
}
