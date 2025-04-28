import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parse = z.object({ profile_id: z.coerce.number().optional() }).safeParse({ profile_id: searchParams.get('profile_id') });
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }
  const { profile_id } = parse.data;
  let rows;
  if (profile_id !== undefined) {
    rows = db.prepare(
      `SELECT strftime('%H', created_at) as hour,
              COUNT(*) as total,
              SUM(success) as success,
              ROUND(CASE WHEN COUNT(*)>0 THEN SUM(success)*1.0/COUNT(*) END, 2) as success_rate
       FROM messages
       WHERE profile_id = ?
       GROUP BY hour
       ORDER BY hour`
    ).all(profile_id);
  } else {
    rows = db.prepare(
      `SELECT strftime('%H', created_at) as hour,
              COUNT(*) as total,
              SUM(success) as success,
              ROUND(CASE WHEN COUNT(*)>0 THEN SUM(success)*1.0/COUNT(*) END, 2) as success_rate
       FROM messages
       GROUP BY hour
       ORDER BY hour`
    ).all();
  }
  return NextResponse.json(rows);
}