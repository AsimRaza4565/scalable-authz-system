import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import RolePermission from "@/models/rolePermission";
import Permission from "@/models/permission";

async function normalizePermissionIds(permissionIds: string[]) {
  const uniquePermissionIds = Array.from(new Set(permissionIds.map((id) => String(id))));

  if (uniquePermissionIds.length === 0) {
    return uniquePermissionIds;
  }

  const selectedPermissions = await Permission.find({
    _id: { $in: uniquePermissionIds },
  }).select("_id slug");

  const requiredReadSlugs = new Set<string>();

  selectedPermissions.forEach((permission) => {
    const slug = permission.slug;
    if (!slug || !slug.includes("-")) return;

    const slugParts = slug.split("-");
    const action = slugParts[slugParts.length - 1];
    const resource = slugParts.slice(0, -1).join("-");

    if (action !== "read") {
      requiredReadSlugs.add(`${resource}-read`);
    }
  });

  if (requiredReadSlugs.size === 0) {
    return uniquePermissionIds;
  }

  const readPermissions = await Permission.find({
    slug: { $in: Array.from(requiredReadSlugs) },
  }).select("_id");

  const normalizedPermissionIds = new Set(uniquePermissionIds);

  readPermissions.forEach((permission) => {
    normalizedPermissionIds.add(String(permission._id));
  });

  return Array.from(normalizedPermissionIds);
}

export async function POST(request: Request) {
  await connectDatabase();

  try {
    const body = await request.json();
    const { roleId, permissionIds } = body;

    if (!roleId || !Array.isArray(permissionIds)) {
      return NextResponse.json({ error: "Data missing" }, { status: 400 });
    }

    // New Permissions
    const uniquePermissionIds = await normalizePermissionIds(permissionIds);

    const deleteResult = await RolePermission.deleteMany({
      roleId: roleId,
      permissionId: { $nin: uniquePermissionIds }, //deleting roles that are not in new list
    });

    if (uniquePermissionIds.length === 0) {
      return NextResponse.json({ message: "No Permissions" }, { status: 200 });
    }

    const operations = uniquePermissionIds.map((permissionId) => ({
      //will run on every permission
      updateOne: {
        //performing multiple operations on a single collection
        filter: { roleId, permissionId },
        update: { $setOnInsert: { roleId, permissionId } }, //$setOnInsert only sets these fields if new document will be inserted/created
        upsert: true,
      },
    }));

    const Result = await RolePermission.bulkWrite(operations);

    return NextResponse.json(
      {
        message: "Permissions updated successfully",
        Result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/assignPermissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
