import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ResponseForm } from "@/components/questionairre/response-form";
import { getQuestionnaire } from "@/actions/questionnaire";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function QuestionnairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();

  const id = await params.then((p) => p.id);
  if (!userId) {
    redirect("/sign-in");
  }

  const result = await getQuestionnaire(id);

  if ("error" in result) {
    redirect("/questionnaires");
  }

  const { questionnaire } = result;

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-2 w-full bg-muted rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
            <div className="space-y-4 mt-8">
              <Skeleton className="h-32 rounded-md" />
              <Skeleton className="h-32 rounded-md" />
              <Skeleton className="h-32 rounded-md" />
            </div>
            <div className="flex justify-between mt-6">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        }
      >
        <ResponseForm
          questionnaireId={result.questionnaire.id}
          title={result.questionnaire.title}
          description={result.questionnaire.description || undefined}
          questions={result.questionnaire.questions}
          onComplete={() => redirect("/questionnaires")}
        />
      </Suspense>
    </div>
  );
}
