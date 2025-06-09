import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { QuestionnaireBuilder } from "@/components/questionairre/questionnaire-builder";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export default async function NewQuestionnairePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto p-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <Skeleton className="h-64 rounded-md" />
                <Skeleton className="h-96 rounded-md" />
              </div>
              <Skeleton className="h-[500px] rounded-md" />
            </div>
          </div>
        }
      >
        <QuestionnaireBuilder />
      </Suspense>
    </div>
  );
}
