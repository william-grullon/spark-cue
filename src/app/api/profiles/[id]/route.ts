import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const row = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
  if (!row) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  const profile = { ...row, pictures: JSON.parse(row.pictures) };
  return NextResponse.json(profile);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { name, bio, location, pictures, avatar_url } = await request.json();
  db.prepare(
    `UPDATE profiles SET name=?, bio=?, location=?, pictures=?, avatar_url=? WHERE id=?`
  ).run(name, bio || null, location || null, JSON.stringify(pictures), avatar_url || null, id);
  const updated = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
  return NextResponse.json({ ...updated, pictures: JSON.parse(updated.pictures) });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const deleted = db.prepare('DELETE FROM profiles WHERE id = ?').run(id);
  return NextResponse.json({ success: deleted.changes > 0 });
}