import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import RolePermission from "@/models/rolePermission";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDatabase();

  try {
    const { id } = await context.params;

    const rolePermissions = await RolePermission.find({ roleId: id }).populate(
      "permissionId"
    );

    if (!rolePermissions || rolePermissions.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(
      rolePermissions.map((rp) => ({
        roleId: rp.roleId,
        permissionId: rp.permissionId, // This will be populated with permission object {_id, name}
      }))
    );
  } catch (err) {
    console.error("Error fetching role permissions:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
