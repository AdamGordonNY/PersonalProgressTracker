import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { handleUserEvent, updateUserSubscription } from "@/actions/user";
import { getMicrosoftToken, redisClient } from "@/lib/encryption";

const MAX_REQUESTS_PER_MINUTE = 100;

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Rate limiting
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

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");
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

async function handleSessionCreated(eventData: any) {
  try {
    const { user_id } = eventData;
    const user = await db.user.findUnique({
      where: { id: user_id },
      include: { UserMicrosoftToken: true },
    });

    if (!user?.UserMicrosoftToken) {
      const msToken = await getMicrosoftToken(user_id);
      console.log("Retrieved Microsoft token for user:", user_id);

      const response = NextResponse.json({ success: true });
      response.cookies.set("ms_token", msToken || "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return response;
    }

    return NextResponse.json(
      { status: "Token already exists" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Session creation failed:", error);
    return NextResponse.json(
      { error: "Session processing failed" },
      { status: 500 }
    );
  }
}

async function handleUserCreated(eventData: any) {
  try {
    const { id, email_addresses, first_name, last_name } = eventData;

    // Create user with transaction
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id,
          email: email_addresses[0]?.email_address,
          name: `${first_name || ""} ${last_name || ""}`.trim() || null,
        },
      });

      // Create default board structure
      const board = await tx.board.create({
        data: {
          title: "My First Board",
          description: "Welcome to your content board!",
          order: 0,
          userId: user.id,
        },
      });

      // Create default columns
      const columns = ["Ideas", "Research", "In Progress", "Done"].map(
        (title, index) => ({
          title,
          order: index,
          boardId: board.id,
          userId: user.id,
        })
      );

      await tx.column.createMany({ data: columns });

      return user;
    });

    await handleUserEvent(result.id, eventData);
    await updateUserSubscription(result.id, "free");

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("User creation failed:", error);
    return NextResponse.json(
      { error: "User creation failed" },
      { status: 500 }
    );
  }
}

async function handleUserUpdated(eventData: any) {
  try {
    const { id, email_addresses, first_name, last_name } = eventData;

    await db.user.update({
      where: { id },
      data: {
        email: email_addresses[0]?.email_address,
        name: `${first_name || ""} ${last_name || ""}`.trim() || null,
      },
    });

    await handleUserEvent(id, eventData);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("User update failed:", error);
    return NextResponse.json({ error: "User update failed" }, { status: 500 });
  }
}

async function handleUserDeleted(eventData: any) {
  try {
    const { id } = eventData;
    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("User deletion failed:", error);
    return NextResponse.json(
      { error: "User deletion failed" },
      { status: 500 }
    );
  }
}
