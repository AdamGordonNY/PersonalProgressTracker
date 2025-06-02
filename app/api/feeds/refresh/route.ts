import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const feed = await db.feed.findUnique({
      where: { id: params.id, userId },
    });

    if (!feed) {
      return new NextResponse("Feed not found", { status: 404 });
    }

    const parser = new Parser();
    const parsedFeed = await parser.parseURL(feed.url);

    // Update feed title if available
    if (parsedFeed.title && !feed.title) {
      await db.feed.update({
        where: { id: feed.id },
        data: { title: parsedFeed.title },
      });
    }

    // Process and store entries
    for (const item of parsedFeed.items) {
      if (!item.link || !item.title) continue;

      try {
        await db.entry.upsert({
          where: {
            guid: item.guid || item.link, // Use guid or link as unique identifier
          },
          update: {
            title: item.title,
            content:
              item.content || item.contentSnippet || item.description || "",
            published: item.pubDate ? new Date(item.pubDate) : new Date(),
          },
          create: {
            title: item.title,
            content:
              item.content || item.contentSnippet || item.description || "",
            url: item.link,
            published: item.pubDate ? new Date(item.pubDate) : new Date(),
            feedId: feed.id,
            guid: item.guid || item.link,
          },
        });
      } catch (entryError) {
        console.error("Error processing entry:", entryError);
      }
    }

    // Update lastChecked timestamp
    await db.feed.update({
      where: { id: feed.id },
      data: { lastChecked: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FEED_REFRESH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
