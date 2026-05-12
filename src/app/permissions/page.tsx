"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import Loader from "@/app/components/Loader";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { IPermission } from "@/types";

export default function Permission() {
  const { data: session } = useSession();
  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("api/permissions");
        const data = await res.json();
        setPermissions(data);
      } catch (error) {
        console.error("Error fetching Permissions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeletePermission = async () => {
    if (!permissionToDelete) return;

    try {
      const response = await fetch(`/api/deletePermission/${permissionToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPermissions((prev) =>
          prev.filter((permission) => permission._id !== permissionToDelete)
        );
        toast.success("Permission deleted");
      } else {
        await response.json();
        toast.error("Failed to delete permission");
      }
    } catch (error) {
      console.error("Error deleting Permission:", error);
      toast.error("An error occurred while deleting Permission");
    } finally {
      setIsModalOpen(false);
      setPermissionToDelete(null);
    }
  };

  const openDeleteModal = (permissionId: string) => {
    setPermissionToDelete(permissionId);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Permissions</h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage system permissions required for role assignments.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            {session?.user?.permissions?.includes("permission-create") && (
              <Link href={"/permissions/create"}>
                <button className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create New Permission
                </button>
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : permissions.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
            <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">No permissions found</h3>
            <p className="mt-1 text-sm text-slate-500">Get started by creating a new permission.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Permission Name
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {permissions.map((permission) => (
                    <tr key={permission._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{permission.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          {session?.user?.permissions?.includes("permission-update") && (
                            <Link href={`/permissions/update/${permission.slug}`}>
                              <button className="cursor-pointer text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors border border-emerald-200">
                                Update
                              </button>
                            </Link>
                          )}
                          {session?.user?.permissions?.includes("permission-delete") && (
                            <button
                              onClick={() => openDeleteModal(permission._id)}
                              className="cursor-pointer text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-md transition-colors border border-rose-200"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Delete Permission"
        message="Are you sure you want to delete this permission? This action cannot be undone."
        onConfirm={handleDeletePermission}
        onCancel={() => {
          setIsModalOpen(false);
          setPermissionToDelete(null);
        }}
        confirmText="Delete"
      />
    </div>
  );
}
