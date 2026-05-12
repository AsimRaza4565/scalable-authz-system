import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import Role from "@/models/role";

export async function GET() {
  try {
    await connectDatabase();
    const roles = await Role.find();
    return NextResponse.json(roles);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch Roles" },
      { status: 500 }
    );
  }
}
