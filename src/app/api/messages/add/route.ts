import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  const schema = z.object({
    profile_id: z.number(),
    source: z.string(),
    persona: z.string(),
    message: z.string(),
  });
  const body = await request.json();
  const parse = schema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { profile_id, source, persona, message } = parse.data;
  try {
    const stmt = db.prepare(`INSERT INTO messages (profile_id, source, persona, message) VALUES (?, ?, ?, ?)`);
    const result = stmt.run(profile_id, source, persona, message);
    const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error('Error inserting message:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}