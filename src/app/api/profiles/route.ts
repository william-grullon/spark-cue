import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const rows = db.prepare('SELECT * FROM profiles ORDER BY created_at DESC').all();
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const { name, bio, location, pictures, avatar_url } = await request.json();
  const stmt = db.prepare(`INSERT INTO profiles (name, bio, location, pictures, avatar_url) VALUES (?, ?, ?, ?, ?)`);
  const result = stmt.run(name, bio || null, location || null, JSON.stringify(pictures), avatar_url || null);
  const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(profile, { status: 201 });
}