import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import Post from "@/models/post";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import type { Types } from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    await connectDatabase();

    const session = await getServerSession(authOptions as NextAuthOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: "Enter the Title and Content" },
        { status: 400 }
      );
    }

    // Resolve the user ID from session (fall back to lookup by email)
    let authorId: string | Types.ObjectId | null = null;
    const user = session.user as { id?: string; email?: string };
    
    if (user && user.id) {
      authorId = user.id;
    } else if (user && user.email) {
      const userDoc = await User.findOne({ email: user.email }).select("_id");
      if (userDoc) authorId = userDoc._id;
    }

    if (!authorId) {
      return NextResponse.json({ error: "Unable to resolve author" }, { status: 400 });
    }

    await Post.create({ title, content, author: authorId });
    return NextResponse.json({ message: "Post created" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error occurred while creating the post", error },
      { status: 500 }
    );
  }
}
