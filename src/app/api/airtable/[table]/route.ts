// src/app/api/airtable/[table]/route.ts
// Server-side proxy — keeps AIRTABLE_API_KEY out of the browser.

import { NextRequest, NextResponse } from "next/server";

const BASE_ID  = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID ?? "app0QFzXHkZ6MeiO1";
const API_KEY  = process.env.AIRTABLE_API_KEY!;

function atUrl(table: string, recordId?: string | null) {
  let url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`;
  if (recordId) url += `/${recordId}`;
  return url;
}

function authHeaders() {
  return { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  const { searchParams } = req.nextUrl;
  const fwd = new URLSearchParams();
  if (searchParams.get("filterByFormula")) fwd.set("filterByFormula", searchParams.get("filterByFormula")!);
  searchParams.getAll("fields[]").forEach(f => fwd.append("fields[]", f));
  const qs = [...fwd].length ? "?" + fwd.toString() : "";
  const res = await fetch(atUrl(table) + qs, { headers: authHeaders(), cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  const body = await req.json();
  const res = await fetch(atUrl(table), { method: "POST", headers: authHeaders(), body: JSON.stringify(body) });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  const recordId = req.nextUrl.searchParams.get("recordId");
  const body = await req.json();
  const res = await fetch(atUrl(table, recordId), { method: "PATCH", headers: authHeaders(), body: JSON.stringify(body) });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
