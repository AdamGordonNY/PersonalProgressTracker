import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PostureDashboard } from "@/components/posture-reminder/posture-dashboard";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Posture Reminder | ContentBoard",
  description: "Track and improve your posture while working",
};

export default async function PosturePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { features: true },
  });

  const features = (user?.features as Record<string, boolean>) || {};
  if (!features.posture_reminder) {
    redirect("/dashboard");
  }
  return <PostureDashboard />;
}
