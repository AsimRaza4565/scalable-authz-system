import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import UserRole from "@/models/userRole";

export async function POST(req: Request) {
  await connectDatabase();

  try {
    const body = await req.json();
    const { userId, roleIds } = body;

    if (!userId || !Array.isArray(roleIds)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const uniqueRoleIds = Array.from(new Set(roleIds.map((r) => String(r)))); //Set remove duplicates

    // Removing existing roles
    const deleteResult = await UserRole.deleteMany({
      userId: userId,
      roleId: { $nin: uniqueRoleIds },
    });

    if (uniqueRoleIds.length === 0) {
      return NextResponse.json(
        { message: "No Roles for the user" },
        { status: 200 }
      );
    }

    const operation = uniqueRoleIds.map((roleId) => ({
      //performing multiple operations using bulkwrite
      updateOne: {
        filter: { userId, roleId },
        update: { $setOnInsert: { userId, roleId } },
        upsert: true,
      },
    }));

    const upsertResult = await UserRole.bulkWrite(operation, {
      ordered: false,
    });

    return NextResponse.json(
      {
        message: "Roles updated successfully",
        // deletedCount: deleteResult.deletedCount,
        upsertResult,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in POST /api/userRole:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
