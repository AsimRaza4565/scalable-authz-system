"use client";

import Navbar from "@/app/components/Navbar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Loader from "@/app/components/Loader";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { IPost } from "@/types";

export default function Posts() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postsData = await fetch("api/posts");
        setPosts(await postsData.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      const response = await fetch(`/api/deletePost/${postToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPosts((prev) => prev.filter((post) => post._id !== postToDelete));
        toast.success("Post deleted");
      } else {
        await response.json();
        toast.error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting Post:", error);
      toast.error("An error occurred while deleting Post");
    } finally {
      setIsModalOpen(false);
      setPostToDelete(null);
    }
  };

  const openDeleteModal = (postId: string) => {
    setPostToDelete(postId);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Posts</h1>
            <p className="mt-2 text-sm text-slate-500">
              Browse and manage published posts in the system.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            {session?.user?.permissions?.includes("post-create") && (
              <Link href={"/posts/create"}>
                <button className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create Post
                </button>
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
            <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">No posts found</h3>
            <p className="mt-1 text-sm text-slate-500">Get started by creating a new post.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {posts.map((post) => (
              <div
                key={post._id}
                className="flex flex-col h-full bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <Link href={`/posts/${post._id}`} className="p-6 flex-grow flex flex-col hover:bg-slate-50 transition-colors">
                  <h2 className="text-xl font-bold text-indigo-600 hover:text-indigo-800 mb-2 truncate" title={post.title}>
                    {post.title}
                  </h2>
                  <p className="text-slate-600 text-sm line-clamp-4 flex-grow">
                    {post.content}
                  </p>
                </Link>

                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 p-1 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                      <svg
                        className="w-8 h-6 text-blue-700"
                        viewBox="0 0 32 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M16 12c3 0 5-2.5 5-5.5S19 1 16 1s-5 2.5-5 5.5 2 5.5 5 5.5zm0 2c-5 0-9 3-9 6.5V23h18v-2.5c0-3.5-4-6.5-9-6.5z" />
                      </svg>
                    </div>
                    <span className="pt-1 text-sm font-medium text-slate-700 truncate max-w-[120px]">
                      {typeof post.author === "object" && post.author?.name
                        ? post.author.name
                        : "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-end gap-3">
                    {session?.user?.permissions?.includes("post-update") && (
                      <Link
                        href={`/posts/update?id=${post._id}&title=${encodeURIComponent(post.title)}&content=${encodeURIComponent(post.content)}`}
                      >
                        <button className="cursor-pointer text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors border border-emerald-200 text-sm font-medium">
                          Edit
                        </button>
                      </Link>
                    )}
                    {session?.user?.permissions?.includes("post-delete") && (
                      <button
                        onClick={() => openDeleteModal(post._id)}
                        className="cursor-pointer text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-md transition-colors border border-rose-200 text-sm font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        onConfirm={handleDeletePost}
        onCancel={() => {
          setIsModalOpen(false);
          setPostToDelete(null);
        }}
        confirmText="Delete"
      />
    </div>
  );
}
