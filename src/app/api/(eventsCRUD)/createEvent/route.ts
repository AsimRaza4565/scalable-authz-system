import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import Event from "@/models/event";

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: "Enter the Description" },
        { status: 400 }
      );
    }

    // //Checking duplicate events
    // const eventExists = await Event.findOne({ description });
    // if (eventExists) {
    //   return NextResponse.json(
    //     { error: "Event already exists" },
    //     { status: 400 }
    //   );
    // }

    // const event = await Event.create({ description });
    await Event.create({ description });
    return NextResponse.json({ message: "Event created" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error occurred while creating the event", error },
      { status: 500 }
    );
  }
}
