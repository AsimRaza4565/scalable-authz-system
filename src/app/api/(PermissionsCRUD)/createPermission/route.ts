import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import Permission from "@/models/permission";
export async function POST(request: Request) {
  try {
    await connectDatabase();
    const { name, slug } = await request.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Enter the Permission name and slug" },
        { status: 400 }
      );
    }
    const PermissionExists = await Permission.findOne({ name });
    if (PermissionExists) {
      return NextResponse.json(
        { error: "Permission already exists" },
        { status: 400 }
      );
    }

    // const Permission = await Permission.create({ name });
    await Permission.create({ name, slug });
    return NextResponse.json(
      { message: "Permission created" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error occurred while creating the Permission", error },
      { status: 500 }
    );
  }
}
