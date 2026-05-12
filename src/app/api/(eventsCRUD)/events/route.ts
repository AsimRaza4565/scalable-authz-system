import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import Event from "@/models/event";

export async function GET() {
  try {
    await connectDatabase();
    const events = await Event.find();
    return NextResponse.json(events);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
