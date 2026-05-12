import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import Permission from "@/models/permission";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDatabase();
    const { slug } = await params;
    const permission = await Permission.findOne({ slug });

    if (!permission) {
      return NextResponse.json(
        { error: "Permission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(permission);
  } catch (error) {
    console.error("Error fetching permission by slug");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
