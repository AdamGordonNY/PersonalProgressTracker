import GolfDashboard from "@/components/golf-logger/golf-dashboard";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function GolfPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { features: true },
  });

  const features = (user?.features as Record<string, boolean>) || {};

  if (!features.golf_tracker) {
    redirect("/dashboard");
  }
  return <GolfDashboard />;
}
