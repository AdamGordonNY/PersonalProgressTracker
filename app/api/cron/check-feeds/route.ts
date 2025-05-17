import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Parser from "rss-parser";
import { Resend } from "resend";
import { kv } from "@vercel/kv";
import { SHA256 } from "crypto-js";

export const runtime = "edge";

const parser = new Parser();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const feeds = await db.feed.findMany({
      include: { user: true },
    });

    for (const feed of feeds) {
      try {
        const response = await fetch(feed.url);
        const xml = await response.text();
        const hash = SHA256(xml).toString();

        if (hash !== feed.lastHash) {
          const parsedFeed = await parser.parseString(xml);
          const newEntries = parsedFeed.items.map((item) => ({
            title: item.title || "Untitled",
            content: item.content || item.contentSnippet || "",
            url: item.link || "",
            published: new Date(item.pubDate || Date.now()),
            feedId: feed.id,
          }));

          await db.entry.createMany({ data: newEntries });
          await db.feed.update({
            where: { id: feed.id },
            data: { lastHash: hash, lastChecked: new Date() },
          });

          // Update badge count in KV
          const badgeKey = `user:${feed.userId}:badge`;
          await kv.incr(badgeKey);

          // Send email notification
          if (feed.user.email) {
            await resend.emails.send({
              from: "updates@yourdomain.com",
              to: feed.user.email,
              subject: `New posts from ${feed.title || "your subscription"}`,
              text: `There are new posts available from ${
                feed.title || "your subscription"
              }. Check them out!`,
            });
          }
        }
      } catch (error) {
        console.error(`Error processing feed ${feed.id}:`, error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error checking feeds:", error);
    return NextResponse.json(
      { error: "Failed to check feeds" },
      { status: 500 }
    );
  }
}
