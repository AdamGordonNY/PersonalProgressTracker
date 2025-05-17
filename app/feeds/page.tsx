import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FeedManager } from "@/components/feed-manager/feed-manager";

export default async function FeedsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <FeedManager />;
}
