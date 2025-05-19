import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { updateUserCloudTokens, updateUserSubscription } from "@/actions/user";
export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt: WebhookEvent;

  // Verify the webhook payload
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new NextResponse("Error occured", { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const {
      id,
      email_addresses,
      external_accounts,
      external_id,
      ...attributes
    } = evt.data;
    try {
      const client = await clerkClient();
      // Get connected cloud providers

      const googleToken = await client.users.getUserOauthAccessToken(
        id,
        "google"
      );
      const microsoftToken = await client.users.getUserOauthAccessToken(
        id,
        "microsoft"
      );
      const cloudTokens: Record<string, string> = {};
      if (googleToken) {
        cloudTokens.google = googleToken.data[0]?.token;
      }
      if (microsoftToken) {
        cloudTokens.microsoft = microsoftToken.data[0]?.token;
      }
      // Extract tokens from external accounts

      // Update database with encrypted tokens
      if (Object.keys(cloudTokens).length > 0) {
        await updateUserCloudTokens(id, cloudTokens);
      }

      // Set default subscription tier
      await updateUserSubscription(id, "free");
    } catch (error) {
      console.error("Webhook processing error:", error);
    }
    await db.user.create({
      data: {
        id: id,
        email: email_addresses[0]?.email_address,
        name:
          `${attributes.first_name || ""} ${attributes.last_name || ""}`.trim() ||
          null,
      },
    });

    return NextResponse.json({ message: "User created" }, { status: 201 });
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, ...attributes } = evt.data;

    await db.user.update({
      where: { id: id },
      data: {
        email: email_addresses[0]?.email_address,
        name:
          `${attributes.first_name || ""} ${attributes.last_name || ""}`.trim() ||
          null,
      },
    });

    return NextResponse.json({ message: "User updated" }, { status: 200 });
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    await db.user.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  }

  return NextResponse.json({ message: "Webhook received" }, { status: 200 });
}
