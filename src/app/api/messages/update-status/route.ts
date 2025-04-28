import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  const schema = z.object({ id: z.number(), action: z.enum(['sent', 'responded']) });
  const body = await request.json();
  const parse = schema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { id, action } = parse.data;
  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
  if (!msg) return NextResponse.json({ error: 'Message not found' }, { status: 404 });

  if (action === 'sent') {
    db.prepare('UPDATE messages SET sent_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
  } else if (action === 'responded') {
    // set responded_at and compute latency in seconds
    db.prepare(
      `UPDATE messages
       SET responded_at = CURRENT_TIMESTAMP,
           response_latency = (strftime('%s', CURRENT_TIMESTAMP) - strftime('%s', created_at)),
           success = 1
       WHERE id = ?`
    ).run(id);
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const updated = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
  return NextResponse.json(updated);
}