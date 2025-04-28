import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';

export async function GET() {
  try {
    const profiles = db.prepare('SELECT * FROM profiles').all();
    // Transform all profiles to parse the pictures JSON
    const transformedProfiles = profiles.map(profile => ({
      ...profile,
      pictures: JSON.parse(profile.pictures)
    }));
    return NextResponse.json(transformedProfiles || []);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Update schema to expect array of objects with description property
  const schema = z.object({ 
    name: z.string(), 
    bio: z.string().optional(), 
    location: z.string().optional(), 
    pictures: z.array(z.object({ description: z.string() })), 
    avatar_url: z.string().optional() 
  });
  
  const body = await request.json();
  const parse = schema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  
  const { name, bio, location, pictures, avatar_url } = parse.data;
  const stmt = db.prepare(`INSERT INTO profiles (name, bio, location, pictures, avatar_url) VALUES (?, ?, ?, ?, ?)`);
  const result = stmt.run(name, bio || null, location || null, JSON.stringify(pictures), avatar_url || null);
  const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(result.lastInsertRowid);
  
  // Parse the pictures JSON string back to an array before returning
  return NextResponse.json({
    ...profile,
    pictures: JSON.parse(profile.pictures)
  }, { status: 201 });
}