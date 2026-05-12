import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import Event from "@/models/event";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDatabase();

  try {
    const { id } = await context.params;
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json({ error: "No Event" }, { status: 400 });
    }

    // //Checking duplicate event description
    // const existingEvent = await Event.findOne({
    //   description: description,
    //   _id: { $ne: id },
    // });

    // if (existingEvent) {
    //   return NextResponse.json(
    //     { error: "Event already exists" },
    //     { status: 400 }
    //   );
    // }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { description: description },
      { new: true }
    );

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Event updated",
    });
  } catch (err) {
    console.error("Error updating Event:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
