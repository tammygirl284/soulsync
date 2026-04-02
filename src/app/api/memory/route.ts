// src/app/api/memory/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';

const MEMORY_PATH = process.env.MEMORY_PATH ??
  '/Users/pinocchiocusanno/Projects/Anne/memory.json';

export async function GET() {
  try {
    const raw = fs.readFileSync(MEMORY_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json(
      { error: 'Memory file not found' },
      { status: 404 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    fs.writeFileSync(MEMORY_PATH, JSON.stringify(body, null, 2));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Write failed' },
      { status: 500 }
    );
  }
}
