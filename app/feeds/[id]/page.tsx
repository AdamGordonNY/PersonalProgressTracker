import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { FeedDetail } from "@/components/feed-manager/feed-detail";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return { title: "Feed Not Found" };

  try {
    const feed = await db.feed.findUnique({
      where: { id: id, userId },
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

export default async function FeedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) notFound();
  const { id } = await params;
  try {
    const feed = await db.feed.findUnique({
      where: { id: id, userId },
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

    return (
      <Suspense
        fallback={
          <div className="container mx-auto p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <div>
                  <Skeleton className="h-8 w-64 rounded-md" />
                  <Skeleton className="h-4 w-96 rounded-md mt-1" />
                </div>
              </div>
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-md" />
              ))}
            </div>
          </div>
        }
      >
        <FeedDetail feed={serializableFeed} />
      </Suspense>
    );
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
