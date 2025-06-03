import GolfDashboard from "@/components/golf-logger/golf-dashboard";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function GolfPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <GolfDashboard />;
}
