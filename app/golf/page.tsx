import GolfDashboard from "@/components/golf-logger/golf-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

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
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-4">
          <div className="h-10 w-64 rounded-md bg-muted mb-6"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-md" />
            ))}
          </div>
          <div className="mt-8">
            <div className="h-8 w-96 rounded-md bg-muted mb-4"></div>
            <Skeleton className="h-[600px] rounded-md" />
          </div>
        </div>
      }
    >
      <GolfDashboard />
    </Suspense>
  );
}
