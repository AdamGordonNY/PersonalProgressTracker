import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HabitTracker } from "@/components/habits/habit-tracker";
import { db } from "@/lib/db";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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

  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-4">
          <div className="h-10 w-64 rounded-md bg-muted mb-6"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-md" />
            ))}
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-[500px] rounded-md lg:col-span-2" />
            <Skeleton className="h-[500px] rounded-md" />
          </div>
        </div>
      }
    >
      <HabitTracker />
    </Suspense>
  );
}
