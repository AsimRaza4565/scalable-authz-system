import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import Role from "@/models/role";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDatabase();

  try {
    const { id } = await context.params;
    const { name, slug } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: "No Role" }, { status: 400 });
    }

    const existingRole = await Role.findOne({
      name: name,
      slug: slug,
      _id: { $ne: id },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: "Role already exists" },
        { status: 400 }
      );
    }

    const roleToUpdate = await Role.findById(id);
    if (!roleToUpdate) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    if (roleToUpdate.name === "admin") {
      return NextResponse.json(
        { error: "admin role cannot be updated" },
        { status: 403 }
      );
    }

    // const updatedRole = await Role.findByIdAndUpdate(
    await Role.findByIdAndUpdate(id, { name: name, slug: slug }, { new: true });

    return NextResponse.json({
      message: "Role updated",
    });
  } catch (err) {
    console.error("Error updating Role:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
