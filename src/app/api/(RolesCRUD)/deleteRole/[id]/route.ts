import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import Role from "@/models/role";
import UserRole from "@/models/userRole";
import RolePermission from "@/models/rolePermission";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDatabase();

  try {
    const { id } = await context.params;

    const roleToDelete = await Role.findById(id);
    if (!roleToDelete) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    if (roleToDelete.name === "admin") {
      return NextResponse.json(
        { error: "admin role cannot be deleted" },
        { status: 403 }
      );
    }

    // Deleting users with this role
    await UserRole.deleteMany({ roleId: id });

    // Deleting permissions with this role
    await RolePermission.deleteMany({ roleId: id });

    // const deletedRole = await Role.findByIdAndDelete(id);
    await Role.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Role deleted",
    });
  } catch (err) {
    console.error("Error deleting Role:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
