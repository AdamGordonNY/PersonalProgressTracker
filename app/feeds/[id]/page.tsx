import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import Parser from "rss-parser";
import { FeedDetail } from "@/components/feed-manager/feed-detail";

// Metadata generation
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
    console.error("Error generating metadata:", error);
    return { title: "RSS Feed" };
  }
}

export default async function FeedPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) notFound();

  try {
    // Fetch feed from database
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

    // Fetch fresh RSS content
    const parser = new Parser({
      customFields: {
        item: ["content:encoded", "description"],
      },
    });

    // Try to fetch the latest feed content
    let parsedFeed;
    let fetchError = null;
    try {
      parsedFeed = await parser.parseURL(feed.url);

      // If this is a new feed without a title yet, update it
      if (!feed.title && parsedFeed.title) {
        await db.feed.update({
          where: { id: feed.id },
          data: { title: parsedFeed.title },
        });
      }
    } catch (error) {
      console.error("Error parsing feed:", error);
      fetchError = "Could not fetch latest feed content";
      // We'll continue with the stored entries
    }

    return (
      <FeedDetail feed={feed} parsedFeed={parsedFeed} fetchError={fetchError} />
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
