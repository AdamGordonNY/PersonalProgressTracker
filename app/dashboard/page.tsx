import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/dashboard";
import { createOrUpdateUserToken } from "@/actions/user";
import { db } from "@/lib/db";
import { Suspense } from "react";

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
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="w-full max-w-7xl px-4">
            <div className="h-10 w-48 rounded-md bg-muted mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-[calc(100vh-12rem)] rounded-md border bg-card animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <Dashboard userId={userId} />
    </Suspense>
  );
}
