import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PostureDashboard } from "@/components/posture-reminder/posture-dashboard";
import { db } from "@/lib/db";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

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
  console.log(user);
  const features = (user?.features as Record<string, boolean>) || {};
  if (!features.posture_reminder) {
    redirect("/dashboard");
  }
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-md" />
            ))}
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-80 rounded-md" />
              <Skeleton className="h-80 rounded-md" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96 rounded-md" />
              <Skeleton className="h-64 rounded-md" />
            </div>
          </div>
        </div>
      }
    >
      <PostureDashboard />
    </Suspense>
  );
}
