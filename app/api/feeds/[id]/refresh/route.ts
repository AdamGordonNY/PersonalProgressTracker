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
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Rate limiting
    const rateKey = `refresh:feed:${userId}`;
    const allowed = await rateLimiter(rateKey, 3, 60); // 3 refreshes per minute

    if (!allowed) {
      return new NextResponse("Too many requests", { status: 429 });
    }

    // Check if feed exists and belongs to user
    const feed = await db.feed.findUnique({
      where: { id: params.id, userId },
    });

    if (!feed) {
      return new NextResponse("Feed not found", { status: 404 });
    }

    // Fetch and parse the feed
    const parser = new Parser({
      customFields: {
        item: ["content:encoded", "description"],
      },
    });

    const response = await fetch(feed.url);
    const xml = await response.text();
    const hash = SHA256(xml).toString();
    const parsedFeed = await parser.parseString(xml);

    // Only update if content has changed
    if (hash !== feed.lastHash) {
      // Extract entries
      const newEntries = parsedFeed.items.map((item) => ({
        title: item.title || "Untitled",
        content:
          item.content || item["content:encoded"] || item.description || "",
        url: item.link || "",
        published: new Date(item.pubDate || item.isoDate || Date.now()),
        feedId: feed.id,
      }));

      // Update feed with new entries and metadata
      await db.feed.update({
        where: { id: feed.id },
        data: {
          title: feed.title || parsedFeed.title || "RSS Feed",
          lastHash: hash,
          lastChecked: new Date(),
          entries: {
            createMany: {
              data: newEntries,
              skipDuplicates: true,
            },
          },
        },
      });
    } else {
      // Just update the last checked time
      await db.feed.update({
        where: { id: feed.id },
        data: {
          lastChecked: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error refreshing feed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
