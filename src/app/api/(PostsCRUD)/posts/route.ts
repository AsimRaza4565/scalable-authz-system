import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import Post from "@/models/post";
import "@/models/user"; // Ensure User model is loaded for population

export async function GET() {
  try {
    await connectDatabase();
    const posts = await Post.find().sort({ createdAt: -1 }).populate("author", "name");
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
