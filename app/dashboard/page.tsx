import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/dashboard";
import { createOrUpdateUserToken } from "@/actions/user";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }
  const initialData = await db.board.findMany({
    where: { userId },
    include: {
      columns: {
        include: {
          cards: {
            include: {
              keywords: true,
              attachments: true,
              factSources: true,
              Note: true,
            },
          },
        },
      },
    },
  });
  return <Dashboard userId={userId} />;
}
