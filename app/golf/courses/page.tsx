import GolfDashboard from "@/components/golf-logger/golf-dashboard";
import CourseDashboard from "@/components/golf-logger/indepth-analysis";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function CoursePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { features: true },
  });

  const golfRounds = await db.golfRound.findMany({
    where: { userId },
    include: {
      course: true,
      holes: {
        include: {
          shots: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });

  return (
    <CourseDashboard
      initialRounds={golfRounds!.map((round) => ({
        ...round,
        course: round.course === null ? undefined : round.course,
      }))}
    />
  );
}
