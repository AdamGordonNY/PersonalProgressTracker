import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { FeedDetail } from "@/components/feed-manager/feed-detail";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { userId } = await auth();
  if (!userId) return { title: "Feed Not Found" };

  try {
    const feed = await db.feed.findUnique({
      where: { id: params.id, userId },
    });

    if (!feed) return { title: "Feed Not Found" };

    return {
      title: feed.title || "RSS Feed",
      description: `Content from ${feed.url}`,
    };
  } catch (error) {
    return { title: "RSS Feed" };
  }
}

export default async function FeedPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) notFound();

  try {
    const feed = await db.feed.findUnique({
      where: { id: params.id, userId },
      include: {
        entries: {
          orderBy: { published: "desc" },
          take: 30,
        },
      },
    });

    if (!feed) notFound();

    // Convert dates to ISO strings for serialization
    const serializableFeed = {
      ...feed,
      createdAt: feed.createdAt.toISOString(),
      updatedAt: feed.updatedAt.toISOString(),
      lastChecked: feed.lastChecked.toISOString(),
      entries: feed.entries.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
        published: entry.published.toISOString(),
      })),
    };

    return <FeedDetail feed={serializableFeed} />;
  } catch (error) {
    console.error("Error fetching feed:", error);
    return (
      <div className="container mx-auto p-4">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>There was a problem loading this feed. Please try again later.</p>
        </div>
      </div>
    );
  }
}
