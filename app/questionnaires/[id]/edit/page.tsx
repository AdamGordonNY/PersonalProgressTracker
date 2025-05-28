import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { QuestionnaireBuilder } from "@/components/questionairre/questionnaire-builder";
import { getQuestionnaire } from "@/actions/questionnaire";

export default async function EditQuestionnairePage({
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

  return (
    <div className="container mx-auto p-6">
      <QuestionnaireBuilder
        initialData={{
          id: result.questionnaire.id,
          title: result.questionnaire.title,
          description: result.questionnaire.description || undefined,
          frequency: result.questionnaire.frequency,
          questions: result.questionnaire.questions,
        }}
      />
    </div>
  );
}
