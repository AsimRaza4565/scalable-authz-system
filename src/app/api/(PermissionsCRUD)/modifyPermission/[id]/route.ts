import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import Permission from "@/models/permission";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDatabase();

  try {
    const { id } = await context.params;
    const { name, slug } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: "No Permission" }, { status: 400 });
    }

    const existingPermission = await Permission.findOne({
      name: name,
      slug: slug,
      _id: { $ne: id },
    });

    if (existingPermission) {
      return NextResponse.json(
        { error: "Permission already exists" },
        { status: 400 }
      );
    }

    const updatedPermission = await Permission.findByIdAndUpdate(
      id,
      { name: name, slug: slug },
      { new: true }
    );

    if (!updatedPermission) {
      return NextResponse.json(
        { error: "Permission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Permission updated",
    });
  } catch (err) {
    console.error("Error updating Permission:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
