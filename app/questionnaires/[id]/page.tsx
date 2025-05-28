import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ResponseForm } from "@/components/questionairre/response-form";
import { getQuestionnaire } from "@/actions/questionnaire";

export default async function QuestionnairePage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const result = await getQuestionnaire(params.id);

  if ("error" in result) {
    redirect("/questionnaires");
  }

  const { questionnaire } = result;

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <ResponseForm
        questionnaireId={questionnaire.id}
        title={questionnaire.title}
        description={questionnaire.description || undefined}
        questions={questionnaire.questions}
        onComplete={() => redirect("/questionnaires")}
      />
    </div>
  );
}
