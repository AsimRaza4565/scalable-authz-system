import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import Post from "@/models/post";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDatabase();

  try {
    const { id } = await context.params;
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "No Post" }, { status: 400 });
    }

    // //Checking duplicate post title
    // const existingPost = await Post.findOne({
    //   title: title,
    //   content: content,
    //   _id: { $ne: id },
    // });

    // if (existingPost) {
    //   return NextResponse.json(
    //     { error: "Post already exists" },
    //     { status: 400 }
    //   );
    // }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title: title, content: content },
      { new: true }
    );

    if (!updatedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Post updated",
    });
  } catch (err) {
    console.error("Error updating Post:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
