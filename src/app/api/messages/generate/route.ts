import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { generateOrFallback } from "@/utils/messageGenerator";

export async function POST(request: NextRequest) {
  const schema = z.object({ profile_id: z.number(), persona: z.string() });
  const body = await request.json();
  const parse = schema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { profile_id, persona } = parse.data;
  const row = db.prepare("SELECT * FROM profiles WHERE id = ?").get(profile_id);
  if (!row) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  const profile = { ...row, pictures: JSON.parse(row.pictures) };
  const { message, source } = await generateOrFallback(profile, persona);
  return NextResponse.json({ message, source, persona });
}
