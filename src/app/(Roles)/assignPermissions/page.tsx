"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Loader from "@/app/components/Loader";
import { toast } from "react-toastify";
import { IRole, IPermission } from "@/types";

export default function AssignRoles() {
  const [roles, setRoles] = useState<IRole[]>([]);
  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  const ensureReadPermissions = (permissionIds: string[]) => {
    const permissionMap = new Map(permissions.map((permission) => [permission._id, permission]));
    const normalizedIds = new Set(permissionIds);
    const requiredReadSlugs = new Set<string>();

    permissionIds.forEach((permissionId) => {
      const slug = permissionMap.get(permissionId)?.slug;
      if (!slug || !slug.includes("-")) return;

      const slugParts = slug.split("-");
      const action = slugParts[slugParts.length - 1];
      const resource = slugParts.slice(0, -1).join("-");

      if (action !== "read") {
        requiredReadSlugs.add(`${resource}-read`);
      }
    });

    requiredReadSlugs.forEach((readSlug) => {
      const readPermission = permissions.find((permission) => permission.slug === readSlug);
      if (readPermission) {
        normalizedIds.add(readPermission._id);
      }
    });

    return Array.from(normalizedIds);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rolesData = await fetch("api/roles");
        const permissionsData = await fetch("api/permissions");
        setRoles(await rolesData.json());
        setPermissions(await permissionsData.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetching role's permissions
  useEffect(() => {
    if (!selectedRole) return;

    const fetchRolePermission = async () => {
      try {
        const res = await fetch(`/api/rolePermission/${selectedRole._id}`);

        if (res.ok) {
          const data = await res.json();

          let rolePermissionIds; //or rolePermissionIds = []

          if (Array.isArray(data)) {
            rolePermissionIds = data.map((item) => item.permissionId?._id);
          } else if (data.permissionId) {
            // for single permissionId
            rolePermissionIds = [data.permission._id || data.permissionId];
          } else if (data.permissionIds) {
            // If data has permissionIds array
            rolePermissionIds = data.permissionIds;
          }

          const normalizedRolePermissionIds = ensureReadPermissions(rolePermissionIds || []);
          setSelectedPermissions(normalizedRolePermissionIds);
          setOriginalPermissions(normalizedRolePermissionIds);
        } else {
          setSelectedPermissions([]);
          setOriginalPermissions([]);
        }
      } catch (error) {
        console.error("Error fetching role permissions:", error);
        setSelectedPermissions([]);
        setOriginalPermissions([]);
      }
    };

    fetchRolePermission();
  }, [selectedRole]);

  // Handling role toggle
  const handlePermissionToggle = (roleId: string) => {
    setSelectedPermissions((prev) => {
      let updatedPermissions: string[];

      if (prev.includes(roleId)) {
        updatedPermissions = prev.filter((id) => id !== roleId);
      } else {
        updatedPermissions = [...prev, roleId];
      }

      return ensureReadPermissions(updatedPermissions);
    });
  };

  // Handling role update
  const handleRoleUpdate = async () => {
    if (!selectedRole || isUpdating) return;

    setIsUpdating(true);

    try {
      const normalizedPermissionIds = ensureReadPermissions(selectedPermissions);

      const response = await fetch("/api/rolePermission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId: selectedRole._id,
          permissionIds: normalizedPermissionIds,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSelectedPermissions(normalizedPermissionIds);
        setOriginalPermissions([...normalizedPermissionIds]);
        toast.success("Permissions updated successfully!");
      } else {
        const error = await response.json();
        console.error("Permission update failed:", error);
        toast.error("Failed to update permissions");
      }
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("An error occurred while updating permissions");
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assign Permissions</h1>
          <p className="mt-2 text-sm text-slate-500">
            Select a role to configure its access permissions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Roles list - Master View */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-800">Role Directory</h2>
              </div>
              <ul className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {roles?.map((role) => {
                  const isSelected = selectedRole?._id === role._id;
                  return (
                    <li
                      key={role._id}
                      onClick={() => setSelectedRole(role)}
                      className={`cursor-pointer px-6 py-4 transition-all duration-200 ${
                        isSelected
                          ? "bg-indigo-50 border-l-4 border-indigo-600"
                          : "hover:bg-slate-50 border-l-4 border-transparent"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`font-semibold ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                          {role.name}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Permissions config - Detail View */}
          <div className="flex flex-col">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-800">Assigned Permissions</h2>
              </div>
              
              <div className="p-6">
                {!selectedRole ? (
                  <div className="text-center py-10">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
                      <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-900">No Role Selected</p>
                    <p className="text-sm text-slate-500 mt-1">Select a role to manage its permissions.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <p className="text-sm text-slate-500 mb-4 pb-4 border-b border-slate-100">
                      Managing permissions for <span className="font-semibold text-slate-900">{selectedRole.name}</span>
                    </p>
                    <div className="mb-6 max-h-[400px] overflow-y-auto pr-2">
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {permissions.map((permission) => (
                          <li key={permission._id}>
                            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                              <input
                                type="checkbox"
                                value={permission._id}
                                checked={selectedPermissions.includes(permission._id)}
                                onChange={() => handlePermissionToggle(permission._id)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                              />
                              <span className="text-sm font-medium text-slate-700">{permission.name}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <button
                        onClick={handleRoleUpdate}
                        disabled={isUpdating}
                        className={` cursor-pointer w-full sm:w-auto px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          !isUpdating
                            ? "bg-indigo-600 hover:bg-indigo-700"
                            : "bg-indigo-400 cursor-not-allowed"
                        }`}
                      >
                        {isUpdating ? "Saving Changes..." : "Save Assignments"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>      )}    </div>
  );
}
