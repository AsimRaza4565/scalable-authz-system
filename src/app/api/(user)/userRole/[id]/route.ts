import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import UserRole from "@/models/userRole";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDatabase();

  try {
    const { id } = await context.params;

    const userRoles = await UserRole.find({ userId: id }).populate("roleId");

    if (!userRoles || userRoles.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(
      userRoles.map((ur) => ({
        userId: ur.userId,
        roleId: ur.roleId, // This will be populated with role object {_id, name}
      }))
    );
  } catch (err) {
    console.error("Error fetching user roles:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
