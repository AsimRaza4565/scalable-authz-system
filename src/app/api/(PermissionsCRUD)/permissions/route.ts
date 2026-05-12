import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import Permission from "@/models/permission";

export async function GET() {
  try {
    await connectDatabase();
    const permisssions = await Permission.find();
    return NextResponse.json(permisssions);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch Permisssions" },
      { status: 500 }
    );
  }
}
