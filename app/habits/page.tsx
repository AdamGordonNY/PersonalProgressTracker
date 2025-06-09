import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HabitTracker } from "@/components/habits/habit-tracker";
import { db } from "@/lib/db";

export default async function HabitsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user has the habit tracker feature enabled
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { features: true },
  });

  const features = (user?.features as Record<string, boolean>) || {};

  // Optional: Redirect if feature not enabled
  // if (!features.habit_tracker) {
  //   redirect("/dashboard");
  // }

  return <HabitTracker />;
}
