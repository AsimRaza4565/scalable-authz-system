import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import RolePermission from "@/models/rolePermission";

// Getting roles and their permissions
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
      return NextResponse.json(
        { error: "Role has no permission" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      rolePermissions.map((roles) => ({
        roleId: roles.roleId, //will return all documents with this role Id
        permissionId: roles.permissionId,
      }))
    );
  } catch (error) {
    console.error("Error fetching role Permissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
