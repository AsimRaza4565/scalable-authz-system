import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import UserRole from "@/models/userRole";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDatabase();
    const { id } = await params;

    const user = await User.findOne({ _id: id });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userRole = await UserRole.findOne({ userId: id }).populate("roleId");

    let roleData;
    if (userRole && userRole.roleId) {
      roleData = {
        _id: userRole.roleId._id,
        name: userRole.roleId.name,
        slug: userRole.roleId.slug,
      };
    }

    // Returning all data
    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      roleId: roleData ? roleData._id : null,
      role: roleData,
    });
  } catch (error) {
    console.error("Error fetching user by id");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
