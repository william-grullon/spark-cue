import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';

interface RequestContext {
  params: {
    id: string;
  }
}

export async function GET(request: NextRequest, context: RequestContext) {
  const idParse = z.object({ id: z.coerce.number() }).safeParse(context.params);
  if (!idParse.success) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const id = idParse.data.id;
  const row = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
  if (!row) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  const profile = { ...row, pictures: JSON.parse(row.pictures) };
  return NextResponse.json(profile);
}

export async function PUT(request: NextRequest, context: RequestContext) {
  // validate id param
  const idParse = z.object({ id: z.coerce.number() }).safeParse(context.params);
  if (!idParse.success) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const id = idParse.data.id;
  // validate body
  const schema = z.object({ name: z.string(), bio: z.string().optional(), location: z.string().optional(), pictures: z.array(z.string()), avatar_url: z.string().optional() });
  const body = await request.json();
  const parse = schema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { name, bio, location, pictures, avatar_url } = parse.data;
  db.prepare(
    `UPDATE profiles SET name=?, bio=?, location=?, pictures=?, avatar_url=? WHERE id=?`
  ).run(name, bio || null, location || null, JSON.stringify(pictures), avatar_url || null, id);
  const updated = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
  return NextResponse.json({ ...updated, pictures: JSON.parse(updated.pictures) });
}

export async function DELETE(request: NextRequest, context: RequestContext) {
  const idParse = z.object({ id: z.coerce.number() }).safeParse(context.params);
  if (!idParse.success) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const id = idParse.data.id;
  const deleted = db.prepare('DELETE FROM profiles WHERE id = ?').run(id);
  return NextResponse.json({ success: deleted.changes > 0 });
}