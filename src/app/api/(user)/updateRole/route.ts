import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import UserRole from "@/models/userRole";

export async function POST(request: Request) {
  await connectDatabase();

  try {
    const body = await request.json();
    const { userId, roleIds } = body;

    if (!userId || !Array.isArray(roleIds)) {
      return NextResponse.json({ error: "Data missing" }, { status: 400 });
    }

    // New Roles
    const uniqueRoleIds = Array.from(new Set(roleIds.map((r) => String(r)))); //Set removes duplicates

    // const deleteResult = await UserRole.deleteMany({
    await UserRole.deleteMany({
      userId: userId,
      roleId: { $nin: uniqueRoleIds }, //deleting roles that are not in new list
    });

    if (uniqueRoleIds.length === 0) {
      return NextResponse.json({ message: "No Roles" }, { status: 200 });
    }

    const operations = uniqueRoleIds.map((roleId) => ({
      //will run on every role
      updateOne: {
        //performing multiple operations on a single collection
        filter: { userId, roleId },
        update: { $setOnInsert: { userId, roleId } }, //$setOnInsert only sets these fields if new document will be inserted/created
        upsert: true,
      },
    }));

    const Result = await UserRole.bulkWrite(operations);

    return NextResponse.json(
      {
        message: "Roles updated successfully",
        Result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/updateRole:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
