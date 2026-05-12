"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import Loader from "@/app/components/Loader";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { IRole } from "@/types";

export default function Roles() {
  const { data: session } = useSession();

  const [roles, setRoles] = useState<IRole[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("api/roles");
        const data = await res.json();
        setRoles(data);
      } catch (error) {
        console.error("Error fetching Roles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      const response = await fetch(`/api/deleteRole/${roleToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRoles((prev) => prev.filter((role) => role._id !== roleToDelete));
        toast.success("Role deleted");
      } else {
        await response.json();
        toast.error("Failed to delete role");
      }
    } catch (error) {
      console.error("Error deleting Role:", error);
      toast.error("An error occurred while deleting Role");
    } finally {
      setIsModalOpen(false);
      setRoleToDelete(null);
    }
  };

  const openDeleteModal = (roleId: string) => {
    setRoleToDelete(roleId);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Roles</h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage the roles available in your application.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            {session?.user?.permissions?.includes("role-create") && (
              <Link href={"/roles/create"}>
                <button className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create New Role
                </button>
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : roles.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
            <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">No roles found</h3>
            <p className="mt-1 text-sm text-slate-500">Get started by creating a new role.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Role Name
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {roles.map((role) => (
                    <tr key={role._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{role.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          {session?.user?.permissions?.includes("role-update") && (
                            <Link href={`/roles/update/${role.slug}`}>
                              <button className="cursor-pointer text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors border border-emerald-200">
                                Update
                              </button>
                            </Link>
                          )}
                          {session?.user?.permissions?.includes("role-delete") && (
                            <button
                              onClick={() => openDeleteModal(role._id)}
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
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
        onConfirm={handleDeleteRole}
        onCancel={() => {
          setIsModalOpen(false);
          setRoleToDelete(null);
        }}
        confirmText="Delete"
      />
    </div>
  );
}
