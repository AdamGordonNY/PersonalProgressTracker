import { Client } from "@microsoft/microsoft-graph-client";
import { auth } from "@clerk/nextjs/server";
import { getMicrosoftTokens } from "@/lib/auth";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const token = await getMicrosoftTokens(userId);
    const client = Client.init({
      authProvider: (done) => {
        done(null, token.accessToken);
      },
    });

    const items = await client.api("/me/drive/root/children").get();

    return NextResponse.json(items);
  } catch (error) {
    console.error("OneDrive API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { itemId } = await request.json();
    const token = await getMicrosoftTokens(userId);
    const client = Client.init({
      authProvider: (done) => {
        done(null, token.accessToken);
      },
    });

    const item = await client.api(`/me/drive/items/${itemId}`).get();

    return NextResponse.json(item);
  } catch (error) {
    console.error("OneDrive API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
