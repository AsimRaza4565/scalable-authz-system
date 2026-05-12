"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import { toast } from "react-toastify";
import Loader from "@/app/components/Loader";
import { IUser, IRole } from "@/types";

export default function AssignRoles() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [roles, setRoles] = useState<IRole[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [originalRoles, setOriginalRoles] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await fetch("api/users");
        const rolesData = await fetch("api/roles");
        setUsers(await usersData.json());
        setRoles(await rolesData.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetching user's roles
  useEffect(() => {
    if (!selectedUser) return;

    const fetchUserRoles = async () => {
      try {
        const res = await fetch(`/api/userRole/${selectedUser._id}`);

        if (res.ok) {
          const data = await res.json();

          let userRoleIds; //or userRoleIds = []

          if (Array.isArray(data)) {
            userRoleIds = data.map((item) => item.roleId?._id);
          } else if (data.roleId) {
            // for single roleId
            userRoleIds = [data.roleId._id || data.roleId];
          } else if (data.roleIds) {
            // If data has roleIds array
            userRoleIds = data.roleIds;
          }

          setSelectedRoles(userRoleIds);
          setOriginalRoles(userRoleIds);
        } else {
          setSelectedRoles([]);
          setOriginalRoles([]);
        }
      } catch (error) {
        console.error("Error fetching user roles:", error);
        setSelectedRoles([]);
        setOriginalRoles([]);
      }
    };

    fetchUserRoles();
  }, [selectedUser]);

  // Handling role toggle
  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  // Handling role update
  const handleRoleUpdate = async () => {
    if (!selectedUser || isUpdating) return;

    setIsUpdating(true);

    try {
      const response = await fetch("/api/userRole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser._id,
          roleIds: selectedRoles,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setOriginalRoles([...selectedRoles]);
        toast.success("Roles updated successfully!");
      } else {
        const error = await response.json();
        console.error("Role update failed:", error);
        toast.error("Failed to update roles");
      }
    } catch (error) {
      console.error("Error updating roles:", error);
      toast.error("An error occurred while updating roles");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <Navbar />

      {loading ? (
        <Loader />
      ) : (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assign Roles</h1>
          <p className="mt-2 text-sm text-slate-500">
            Select a user from the directory to manage their access roles.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users list - Master View */}
          <div className="flex flex-col">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-800">User Directory</h2>
              </div>
              <ul className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {users.map((user) => {
                  const isSelected = selectedUser?._id === user._id;
                  return (
                    <li
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      className={`cursor-pointer px-6 py-4 transition-all duration-200 ${
                        isSelected
                          ? "bg-indigo-50 border-l-4 border-indigo-600"
                          : "hover:bg-slate-50 border-l-4 border-transparent"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`font-semibold ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                          {user.name}
                        </span>
                        <span className={`text-sm mt-1 ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`}>
                          {user.email}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Roles config - Detail View */}
          <div className="flex flex-col">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-800">Assigned Roles</h2>
              </div>
              
              <div className="p-6">
                {!selectedUser ? (
                  <div className="text-center py-10">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
                      <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-900">No User Selected</p>
                    <p className="text-sm text-slate-500 mt-1">Select a user to manage their roles.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <p className="text-sm text-slate-500 mb-4 pb-4 border-b border-slate-100">
                      Managing roles for <span className="font-semibold text-slate-900">{selectedUser.name}</span>
                    </p>
                    <div className="mb-6 max-h-[300px] overflow-y-auto pr-2">
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {roles.map((role) => (
                          <li key={role._id}>
                            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                              <input
                                type="checkbox"
                                value={role._id}
                                checked={selectedRoles.includes(role._id)}
                                onChange={() => handleRoleToggle(role._id)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                              />
                              <span className="text-sm font-medium text-slate-700">{role.name}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={handleRoleUpdate}
                      disabled={isUpdating}
                      className={` cursor-pointer w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        !isUpdating
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-indigo-400 cursor-not-allowed"
                      }`}
                    >
                      {isUpdating ? "Saving Changes..." : "Save Assignments"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      )}
    </div>
  );
}
