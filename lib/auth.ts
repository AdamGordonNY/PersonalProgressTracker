import { PrismaClient } from "@prisma/client";
import { decrypt } from "./encryption";
// lib/microsoft-auth.ts
import { getMicrosoftToken, setMicrosoftToken } from "./encryption";

export async function getValidMicrosoftToken(userId: string) {
  try {
    const token = await getMicrosoftToken(userId);

    if (!token) return null;

    // Verify token expiration
    const tokenData = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );

    if (tokenData.exp * 1000 < Date.now()) {
      // Refresh token logic
      const newToken = await refreshMicrosoftToken(userId);
      await setMicrosoftToken(userId, newToken);
      return newToken;
    }

    return token;
  } catch (error) {
    console.error("Token validation failed:", error);
    return null;
  }
}
export async function refreshMicrosoftToken(refreshToken: string) {
  const response = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    }
  );
  return response.json();
}

// Token expiration check
export function isTokenExpired(token: string) {
  try {
    const { exp } = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

const prisma = new PrismaClient();

export async function getGoogleTokens(userId: string) {
  try {
    const tokens = await prisma.userGoogleToken.findUnique({
      where: { userId },
      select: {
        accessToken: true,
        refreshToken: true,
        expiresAt: true,
      },
    });

    if (!tokens) {
      throw new Error("No Google tokens found for user");
    }

    return {
      accessToken: decrypt(tokens.accessToken),
      refreshToken: decrypt(tokens.refreshToken),
      expiresAt: tokens.expiresAt,
    };
  } catch (error) {
    console.error("Error retrieving Google tokens:", error);
    throw new Error("Failed to retrieve Google tokens");
  }
}

export async function getMicrosoftTokens(userId: string) {
  try {
    const tokens = await prisma.userMicrosoftToken.findUnique({
      where: { userId },
      select: {
        accessToken: true,
        refreshToken: true,
        expiresAt: true,
      },
    });

    if (!tokens) {
      throw new Error("No Microsoft tokens found for user");
    }

    return {
      accessToken: decrypt(tokens.accessToken),
      refreshToken: decrypt(tokens.refreshToken),
      expiresAt: tokens.expiresAt,
    };
  } catch (error) {
    console.error("Error retrieving Microsoft tokens:", error);
    throw new Error("Failed to retrieve Microsoft tokens");
  }
}
