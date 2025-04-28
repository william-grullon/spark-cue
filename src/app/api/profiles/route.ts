import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  const schema = z.object({ name: z.string(), bio: z.string().optional(), location: z.string().optional(), pictures: z.array(z.string()), avatar_url: z.string().optional() });
  const body = await request.json();
  const parse = schema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { name, bio, location, pictures, avatar_url } = parse.data;
  const stmt = db.prepare(`INSERT INTO profiles (name, bio, location, pictures, avatar_url) VALUES (?, ?, ?, ?, ?)`);
  const result = stmt.run(name, bio || null, location || null, JSON.stringify(pictures), avatar_url || null);
  const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(profile, { status: 201 });
}