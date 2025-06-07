import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/dashboard";
import { createOrUpdateUserToken } from "@/actions/user";

export default async function DashboardPage() {
  const { userId, sessionClaims } = await auth();
  console.log(sessionClaims);
  if (!userId) {
    redirect("/sign-in");
  }

  return <Dashboard userId={userId} />;
}
