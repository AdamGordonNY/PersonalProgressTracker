import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import {
  handleSessionCreated,
  handleUserCreated,
  handleUserDeleted,
  handleUserUpdated,
} from "@/actions/user";
import { redisClient } from "@/lib/encryption";

const MAX_REQUESTS_PER_MINUTE = 100;

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Rate limiting
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    const ip = headers().get("x-forwarded-for");
    const rateKey = `rate-limit:${ip}`;
    const count = await redisClient.incr(rateKey);
    if (count === 1) await redisClient.expire(rateKey, 60);
    if (count > MAX_REQUESTS_PER_MINUTE) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Header validation
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing Svix headers");
      return NextResponse.json("Missing required headers", { status: 400 });
    }

    // Process payload
    const payload = await req.json();
    console.log("Webhook received:", JSON.stringify(payload, null, 2));

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET! || "");
    const evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    console.log(`Processing event: ${evt.type}`);

    // Handle specific event types
    switch (evt.type) {
      case "session.created":
        return handleSessionCreated(evt.data);

      case "user.created":
        return handleUserCreated(evt.data);

      case "user.updated":
        return handleUserUpdated(evt.data);

      case "user.deleted":
        return handleUserDeleted(evt.data);

      default:
        console.warn(`Unhandled event type: ${evt.type}`);
        return NextResponse.json(
          { error: "Unhandled event type" },
          { status: 501 }
        );
    }
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
}
