import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FeatureSelection } from "@/components/onboarding/feature-selection";
import { db } from "@/lib/db";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user has already completed onboarding
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { onboardingCompleted: true },
  });

  // If onboarding is completed, redirect to dashboard
  if (user?.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <Suspense
            fallback={
              <div className="space-y-8">
                <div className="text-center">
                  <Skeleton className="h-12 w-12 mx-auto rounded-full" />
                  <Skeleton className="h-8 w-80 mx-auto mt-2" />
                  <Skeleton className="h-4 w-96 mx-auto mt-2" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-md" />
                  ))}
                </div>
                <div className="flex justify-between mt-8">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-40" />
                </div>
              </div>
            }
          >
            <FeatureSelection userId={userId} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
