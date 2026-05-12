import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import UserRole from "@/models/userRole";

// Getting user and their roles
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDatabase();

  try {
    const { id } = await context.params;

    const userRoles = await UserRole.find({ userId: id }).populate("roleId");

    if (!userRoles || userRoles.length === 0) {
      return NextResponse.json({ error: "User has no role" }, { status: 404 });
    }

    return NextResponse.json(
      userRoles.map((roles) => ({
        userId: roles.userId, //will return all documents with this user Id
        roleId: roles.roleId,
      }))
    );
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
