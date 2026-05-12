import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import Role from "@/models/role";
import UserRole from "@/models/userRole";
import { ensureDefaultPermissions } from "@/lib/defaultPermissions";

export async function POST(request: Request) {
  try {
    await connectDatabase();
    await ensureDefaultPermissions();

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Please fill all the field" },
        { status: 400 }
      );
    }

    // Checking duplicate email
    const UserExists = await User.findOne({ email });
    if (UserExists) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const totalUsers = await User.countDocuments();

    // Hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Inserting to database
    const user = await User.create({ name, email, password: hashedPassword });

    let role;
    //Assigning admin role to first user
    if (totalUsers === 0) {
      role = await Role.findOne({ name: "admin" });
      if (!role) {
        role = await Role.create({ name: "admin", slug: "admin" });
      }
    } else {
      role = await Role.findOne({ name: "viewer" });
      if (!role) {
        role = await Role.create({ name: "viewer", slug: "viewer" });
      }
    }

    if (!role) {
      return NextResponse.json({ error: "Failed to assign role" }, { status: 500 });
    }

    const userRole = await UserRole.create({
      userId: user._id,
      roleId: role._id,
    });

    if (!userRole) {
      NextResponse.json({ error: "You have No Role" }, { status: 303 });
    }

    return NextResponse.json({ message: "User registered" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error occurred while registering the user", error },
      { status: 500 }
    );
  }
}
