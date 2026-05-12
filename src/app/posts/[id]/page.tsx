"use client";

import Navbar from "@/app/components/Navbar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Loader from "@/app/components/Loader";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { IPost } from "@/types";

export default function SinglePost() {
  const [post, setPost] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }
        const postData = await response.json();
        setPost(postData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load post");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleDeletePost = async () => {
    if (!post) return;
    try {
      const response = await fetch(`/api/deletePost/${post._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Post deleted");
        router.push("/posts");
      } else {
        toast.error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting Post:", error);
      toast.error("An error occurred while deleting Post");
    } finally {
      setIsModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen pb-12">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8">
          <Loader />
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-slate-50 min-h-screen pb-12">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8">
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="mt-2 text-sm font-medium text-slate-900">Post not found</h3>
            <div className="mt-4">
              <Link href="/posts">
                <button className="text-indigo-600 hover:text-indigo-800 flex items-center">
                  <span>&larr;</span> Back to Posts
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
          <div className="p-8 md:p-12 flex-grow">
            <Link href="/posts" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center mb-6">
              <span className="mr-1 text-2xl pb-2">&larr;</span> Back to Posts
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
          
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 p-1 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                <svg
                  className="w-10 h-6 text-blue-700"
                  viewBox="0 0 32 28"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M16 12c3 0 5-2.5 5-5.5S19 1 16 1s-5 2.5-5 5.5 2 5.5 5 5.5zm0 2c-5 0-9 3-9 6.5V23h18v-2.5c0-3.5-4-6.5-9-6.5z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-md font-medium text-slate-700 truncate max-w-[150px]">
                  {typeof post.author === "object" && post.author?.name
                    ? post.author.name
                    : "Unknown"}
                </span>
                {post.createdAt && (
                  <span className="text-xs text-slate-500">
                    Published on {new Date(post.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              {session?.user?.permissions?.includes("post-update") && (
                <Link
                  href={`/posts/update?id=${post._id}&title=${encodeURIComponent(post.title)}&content=${encodeURIComponent(post.content)}`}
                >
                  <button className="cursor-pointer px-5 py-2 text-sm font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-sm transition-colors">
                    Edit Post
                  </button>
                </Link>
              )}
              {session?.user?.permissions?.includes("post-delete") && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="cursor-pointer px-5 py-2 text-sm font-medium rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-sm transition-colors"
                >
                  Delete Post
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Delete Post"
        message={`Are you sure you want to delete "${post.title}"? This action cannot be undone.`}
        onConfirm={handleDeletePost}
        onCancel={() => setIsModalOpen(false)}
        confirmText="Delete"
      />
    </div>
  );
}
