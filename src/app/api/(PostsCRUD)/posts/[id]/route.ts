import { NextResponse, NextRequest } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import Post from "@/models/post";
import "@/models/user";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDatabase();
    const post = await Post.findById(id).populate("author", "name");

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
