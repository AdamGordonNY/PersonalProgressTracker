import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/dashboard";

export default async function DashboardPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return <Dashboard userId={userId} />;
}