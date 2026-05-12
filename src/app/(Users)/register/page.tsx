import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import RegisterPage from "@/app/components/RegisterPage";

export default async function Register() {
  const session = await getServerSession(authOptions);

  if (session) redirect("/posts");

  return <RegisterPage />;
}
