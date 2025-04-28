import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    // Ensure params is properly awaited
    const { params } = await context;
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid id format" }, { status: 400 });
    }

    const row = db.prepare("SELECT * FROM profiles WHERE id = ?").get(id);
    if (!row) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const profile = { ...row, pictures: JSON.parse(row.pictures) };
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    // Ensure params is properly awaited
    const { params } = await context;
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid id format" }, { status: 400 });
    }

    // validate body
    const schema = z.object({
      name: z.string(),
      bio: z.string().optional(),
      location: z.string().optional(),
      pictures: z.array(z.object({ description: z.string() })),
      avatar_url: z.string().optional(),
    });

    const body = await request.json();
    const parse = schema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, bio, location, pictures, avatar_url } = parse.data;
    db.prepare(
      `UPDATE profiles SET name=?, bio=?, location=?, pictures=?, avatar_url=? WHERE id=?`
    ).run(
      name,
      bio || null,
      location || null,
      JSON.stringify(pictures),
      avatar_url || null,
      id
    );

    const updated = db.prepare("SELECT * FROM profiles WHERE id = ?").get(id);
    return NextResponse.json({
      ...updated,
      pictures: JSON.parse(updated.pictures),
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    // Ensure params is properly awaited
    const { params } = await context;
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid id format" }, { status: 400 });
    }

    // Create a database transaction to ensure all operations complete together
    const transaction = db.transaction(() => {
      // First delete all messages associated with this profile
      const deletedMessages = db.prepare("DELETE FROM messages WHERE profile_id = ?").run(id);
      console.log(`Deleted ${deletedMessages.changes} messages for profile ${id}`);

      // Then delete the profile
      const deletedProfile = db.prepare("DELETE FROM profiles WHERE id = ?").run(id);
      return deletedProfile.changes > 0;
    });

    // Execute the transaction
    const success = transaction();

    return NextResponse.json({ success });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }
}
