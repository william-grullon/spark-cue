import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profile_id');
  let rows;
  if (profileId) {
    rows = db.prepare(
      `SELECT strftime('%H', created_at) as hour,
              COUNT(*) as total,
              SUM(success) as success,
              ROUND(CASE WHEN COUNT(*)>0 THEN SUM(success)*1.0/COUNT(*) END, 2) as success_rate
       FROM messages
       WHERE profile_id = ?
       GROUP BY hour
       ORDER BY hour`
    ).all(Number(profileId));
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