import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PostureDashboard } from "@/components/posture-reminder/posture-dashboard";

export const metadata: Metadata = {
  title: "Posture Reminder | ContentBoard",
  description: "Track and improve your posture while working",
};

export default async function PosturePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <PostureDashboard />;
}
