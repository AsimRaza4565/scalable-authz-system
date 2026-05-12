import LoginPage from "./components/LoginPage";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { connectDatabase } from "@/lib/mongodb";
import User from "@/models/user";

export default async function Home() {
  await connectDatabase();
  const totalUsers = await User.countDocuments();
  
  if (totalUsers === 0) {
    redirect("/register");
  }

  const session = await getServerSession(authOptions);
  if (session) {
    const roles = session.user?.roles || [];
    const permissions = session.user?.permissions || [];

    if (
      permissions.includes("post-read") ||
      permissions.includes("post-create") ||
      permissions.includes("post-update") ||
      permissions.includes("post-delete")
    ) {
      redirect("/posts");
    }

    if (
      permissions.includes("event-read") ||
      permissions.includes("event-create") ||
      permissions.includes("event-update") ||
      permissions.includes("event-delete")
    ) {
      redirect("/events");
    }

    if (
      permissions.includes("user-read") ||
      permissions.includes("user-create") ||
      permissions.includes("user-update") ||
      permissions.includes("user-delete")
    ) {
      redirect("/users");
    }

    if (
      permissions.includes("role-read") ||
      permissions.includes("role-create") ||
      permissions.includes("role-update") ||
      permissions.includes("role-delete") ||
      roles.includes("roles-manager")
    ) {
      redirect("/roles");
    }

    if (
      permissions.includes("permission-read") ||
      permissions.includes("permission-create") ||
      permissions.includes("permission-update") ||
      permissions.includes("permission-delete") ||
      roles.includes("permissions-manager")
    ) {
      redirect("/permissions");
    }

    redirect("/");
  }

  return <LoginPage />;
}
