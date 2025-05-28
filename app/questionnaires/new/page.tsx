import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { QuestionnaireBuilder } from "@/components/questionairre/questionnaire-builder";

export default async function NewQuestionnairePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto p-6">
      <QuestionnaireBuilder />
    </div>
  );
}
