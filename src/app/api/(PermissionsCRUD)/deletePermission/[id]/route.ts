import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import Permission from "@/models/permission";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDatabase();

  try {
    const { id } = await context.params;

    const deletedPermission = await Permission.findByIdAndDelete(id);

    if (!deletedPermission) {
      return NextResponse.json(
        { error: "Permission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Permission deleted",
    });
  } catch (error) {
    console.error("Error deleting Permission:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
