import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FeatureSelection } from "@/components/onboarding/feature-selection";
import { db } from "@/lib/db";

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
          <FeatureSelection userId={userId} />
        </div>
      </main>
    </div>
  );
}
