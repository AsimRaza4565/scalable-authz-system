import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import User from "@/models/user";

export async function GET() {
  try {
    await connectDatabase();
    const users = await User.find();
    return NextResponse.json(users);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch Users" },
      { status: 500 }
    );
  }
}
