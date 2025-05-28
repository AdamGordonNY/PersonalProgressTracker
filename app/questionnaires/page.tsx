import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { QuestionnaireDashboard } from "../../components/questionairre/questionnaire-dashboard";

export default async function QuestionnairesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto p-6">
      <QuestionnaireDashboard />
    </div>
  );
}
