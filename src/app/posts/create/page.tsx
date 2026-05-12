"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function CreatePost() {
  const [postTitle, setPostTitle] = useState("");
  const [content, setContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();

  const handlePostCreate = async (e) => {
    e.preventDefault();

    if (!postTitle || !content || isCreating) return;

    setIsCreating(true);

    try {
      const response = await fetch("/api/createPost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: postTitle, content: content }),
      });

      if (response.ok) {
        router.push("/posts");
        toast.success("Post created");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("An error occurred while creating post");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Create New Post
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Write and publish a new post
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <form onSubmit={handlePostCreate} className="space-y-6" noValidate>
            
            <div>
              <label htmlFor="postTitle" className="block text-sm font-medium text-slate-700">
                Title
              </label>
              <div className="mt-1">
                <input
                  id="postTitle"
                  name="postTitle"
                  type="text"
                  required
                  placeholder="Enter Post Title"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="postContent" className="block text-sm font-medium text-slate-700">
                Content
              </label>
              <div className="mt-1">
                <textarea
                  id="postContent"
                  name="postContent"
                  rows={4}
                  required
                  placeholder="Write your post content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all resize-none"
                />
              </div>
            </div>

            <div className="pt-2 mb-2">
              <button
                type="submit"
                disabled={!postTitle || !content || isCreating}
                className="cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Publishing..." : "Publish Post"}
              </button>
            </div>
            
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => router.back()}
                className="cursor-pointer text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel and return
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
