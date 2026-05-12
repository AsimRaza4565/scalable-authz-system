import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import UserRole from "@/models/userRole";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDatabase();

  try {
    const { id } = await context.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    //Logout if DB has no user
    const remainingUsersCount = await User.countDocuments();

    // Deleting roles
    await UserRole.deleteMany({ userId: id });

    return NextResponse.json({
      message: "User and their roles deleted",
      shouldLogout: remainingUsersCount === 0,
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
