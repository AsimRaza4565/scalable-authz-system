import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import Event from "@/models/event";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDatabase();

  try {
    const { id } = await context.params;

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Event deleted",
    });
  } catch (err) {
    console.error("Error deleting Event:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
