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

export async function POST(req: Request) {
  await connectDatabase();

  try {
    const body = await req.json();
    const { roleId, permissionIds } = body;

    if (!roleId || !Array.isArray(permissionIds)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const uniquepermissionIds = await normalizePermissionIds(permissionIds);

    // Removing existing permissions
    const deleteResult = await RolePermission.deleteMany({
      roleId: roleId,
      permissionId: { $nin: uniquepermissionIds },
    });

    if (uniquepermissionIds.length === 0) {
      return NextResponse.json(
        { message: "No Permissions for the role" },
        { status: 200 }
      );
    }

    const operation = uniquepermissionIds.map((permissionId) => ({
      //performing multiple operations using bulkwrite
      updateOne: {
        filter: { roleId, permissionId },
        update: { $setOnInsert: { roleId, permissionId } },
        upsert: true,
      },
    }));

    const upsertResult = await RolePermission.bulkWrite(operation, {
      ordered: false,
    });

    return NextResponse.json(
      {
        message: "Permissions updated successfully",
        // deletedCount: deleteResult.deletedCount,
        upsertResult,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in POST /api/rolePermission:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
