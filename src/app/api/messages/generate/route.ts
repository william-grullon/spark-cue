import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateOrFallback } from '@/utils/messageGenerator';

export async function POST(request: NextRequest) {
  const { profile_id, persona } = await request.json();
  const row = db.prepare('SELECT * FROM profiles WHERE id = ?').get(profile_id);
  if (!row) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }
  const profile = { ...row, pictures: JSON.parse(row.pictures) };
  const { message, source } = await generateOrFallback(profile, persona);
  return NextResponse.json({ message, source, persona });
}