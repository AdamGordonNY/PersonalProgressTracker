import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import Parser from "rss-parser";
import { SHA256 } from "crypto-js";
import { rateLimiter } from "@/lib/redis";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Rate limiting
    const rateKey = `refresh:feed:${userId}`;
    const allowed = await rateLimiter(rateKey, 3, 60);
    if (!allowed) {
      return new NextResponse("Too many requests", { status: 429 });
    }

    // Check if feed exists
    const feed = await db.feed.findUnique({
      where: { id: params.id, userId },
    });
    if (!feed) {
      return new NextResponse("Feed not found", { status: 404 });
    }

    // Fetch and parse the feed
    const parser = new Parser({
      customFields: {
        item: ["content:encoded", "description", "guid"],
      },
    });

    const response = await fetch(feed.url);
    const xml = await response.text();
    const hash = SHA256(xml).toString();
    const parsedFeed = await parser.parseString(xml);

    // Only update if content has changed
    if (hash !== feed.lastHash) {
      // Prepare entries with proper GUID handling
      const entriesToCreate = parsedFeed.items.map((item) => {
        // Generate unique GUID if not provided
        const guid = item.guid || SHA256(item.link! || item.title!).toString();

        return {
          title: item.title || "Untitled",
          content:
            item.content || item["content:encoded"] || item.description || "",
          url: item.link || "",
          published: new Date(item.pubDate || item.isoDate || Date.now()),
          guid, // Essential for duplicate prevention
        };
      });

      // Transaction to update feed and create entries
      await db.$transaction([
        // Update feed metadata
        db.feed.update({
          where: { id: feed.id },
          data: {
            title: feed.title || parsedFeed.title || "RSS Feed",
            lastHash: hash,
            lastChecked: new Date(),
          },
        }),

        // Create new entries using upsert
        ...entriesToCreate.map((entry) =>
          db.entry.upsert({
            where: { guid: entry.guid },
            update: {
              title: entry.title,
              content: entry.content,
              url: entry.url,
              published: entry.published,
            },
            create: {
              ...entry,
              feedId: feed.id,
            },
          })
        ),
      ]);
    } else {
      // Update last checked time only
      await db.feed.update({
        where: { id: feed.id },
        data: { lastChecked: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error refreshing feed:", {
      message: error instanceof Error ? error.message : String(error),
      feedId: params.id,
      userId: userId,
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
