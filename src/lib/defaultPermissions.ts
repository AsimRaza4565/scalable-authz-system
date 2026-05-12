import Permission from "@/models/permission";
import Role from "@/models/role";
import RolePermission from "@/models/rolePermission";
import { connectDatabase } from "./mongodb";

const defaultPermissions = [
  { name: "user create", slug: "user-create" },
  { name: "user read", slug: "user-read" },
  { name: "user update", slug: "user-update" },
  { name: "user delete", slug: "user-delete" },
  { name: "post create", slug: "post-create" },
  { name: "post read", slug: "post-read" },
  { name: "post update", slug: "post-update" },
  { name: "post delete", slug: "post-delete" },
  { name: "event create", slug: "event-create" },
  { name: "event read", slug: "event-read" },
  { name: "event update", slug: "event-update" },
  { name: "event delete", slug: "event-delete" },
  { name: "role create", slug: "role-create" },
  { name: "role read", slug: "role-read" },
  { name: "role update", slug: "role-update" },
  { name: "role delete", slug: "role-delete" },
  { name: "permission create", slug: "permission-create" },
  { name: "permission read", slug: "permission-read" },
  { name: "permission update", slug: "permission-update" },
  { name: "permission delete", slug: "permission-delete" },
];

let defaultPermissionsSeedPromise: Promise<void> | null = null;

export async function ensureDefaultPermissions() {
  if (!defaultPermissionsSeedPromise) {
    defaultPermissionsSeedPromise = (async () => {
      await connectDatabase();

      // Seed permissions
      await Permission.bulkWrite(
        defaultPermissions.map(({ name, slug }) => ({
          updateOne: {
            filter: { slug },
            update: { $setOnInsert: { name, slug } },
            upsert: true,
          },
        }))
      );

      // Seed admin and viewer roles
      const defaultRoles = [
        { name: "admin", slug: "admin" },
        { name: "viewer", slug: "viewer" },
      ];

      await Role.bulkWrite(
        defaultRoles.map(({ name, slug }) => ({
          updateOne: {
            filter: { slug },
            update: { $setOnInsert: { name, slug } },
            upsert: true,
          },
        }))
      );

      // Fetch admin role to assign permissions
      const adminRole = await Role.findOne({ slug: "admin" });
      if (adminRole) {
        // Fetch all permissions to link
        const allPermissions = await Permission.find({
          slug: { $in: defaultPermissions.map(p => p.slug) }
        });

        // Assign to admin role if missing
        await RolePermission.bulkWrite(
          allPermissions.map((permission) => ({
            updateOne: {
              filter: { roleId: adminRole._id, permissionId: permission._id },
              update: { $setOnInsert: { roleId: adminRole._id, permissionId: permission._id } },
              upsert: true,
            },
          }))
        );
      }
    })().catch((error) => {
      defaultPermissionsSeedPromise = null;
      throw error;
    });
  }

  return defaultPermissionsSeedPromise;
}
