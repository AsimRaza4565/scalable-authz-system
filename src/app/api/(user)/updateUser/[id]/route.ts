import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import UserRole from "@/models/userRole";
import Role from "@/models/role";
import { error } from "console";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDatabase();

  try {
    const { id } = await context.params;
    const { name, email, password, roleId } = await request.json();

    if (!name || !email || !roleId) {
      return NextResponse.json(
        { error: "Fill all the fields" },
        { status: 400 }
      );
    }

    //Checking duplicate user email
    const existingUser = await User.findOne({
      email: email,
      _id: { $ne: id },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const updateData = { name, email, password, roleId };

    // Hashing the password
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const role = await Role.findById(roleId);
    if (!role)
      return NextResponse.json({ error: "Invalid roleId" }, { status: 400 });

    // Checking current userRole
    const currentUserRoles = await UserRole.find({ userId: id });

    if (
      currentUserRoles.length === 1 &&
      String(currentUserRoles[0].roleId) === String(roleId)
    ) {
      // nothing will change
    } else {
      // Removing all old mappings and create the new one
      await UserRole.deleteMany({ userId: id });
      await UserRole.create({ userId: id, roleId: role._id });
    }

    return NextResponse.json({
      message: "User updated",
    });
  } catch (err) {
    console.error("Error updating User:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
