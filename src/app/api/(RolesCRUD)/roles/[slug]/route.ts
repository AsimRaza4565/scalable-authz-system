import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import Role from "@/models/role";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDatabase();
    const { slug } = await params;
    const role = await Role.findOne({ slug });

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error("Error fetching role by slug");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
