import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { RoundDetail } from "@/components/golf-logger/round-detail";
import { getRound } from "@/actions/golf";

export default async function RoundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }
  const id = await params.then((p) => p.id);
  const result = await getRound(id!);

  if ("error" in result) {
    notFound();
  }

  return <RoundDetail round={result.round} />;
}
