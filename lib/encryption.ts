import "server-only";
import { createClient } from "redis";

// Redis Client Setup with lazy connection
const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
});

redisClient.on("error", (err) => console.error("Redis Error:", err));

// Connection handling with error checking
export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      console.log("Connected to Redis successfully");
    } catch (error) {
      console.error("Redis connection error:", error);
      throw new Error("Failed to connect to Redis");
    }
  }
};

export { redisClient };

// Microsoft Token Specific Functions
export const setMicrosoftToken = async (userId: string, token: string) => {
  try {
    await connectRedis();
    const encryptedToken = await encrypt(token);
    await redisClient.set(`ms-token:${userId}`, encryptedToken, {
      EX: 3600, // Expire after 1 hour (matching typical token expiry)
    });
  } catch (error) {
    console.error("Failed to store Microsoft token:", error);
    throw new Error("Failed to store Microsoft token");
  }
};

export const getMicrosoftToken = async (userId: string) => {
  try {
    await connectRedis();
    const encryptedToken = await redisClient.get(`ms-token:${userId}`);

    if (!encryptedToken) return null;

    return await decrypt(encryptedToken);
  } catch (error) {
    console.error("Failed to retrieve Microsoft token:", error);
    throw new Error("Failed to retrieve Microsoft token");
  }
};

// Generic Redis Helpers (modified for better error handling)
export const setRedisKey = async (key: string, value: string, ttl?: number) => {
  try {
    await connectRedis();
    const options = ttl ? { EX: ttl } : undefined;
    return await redisClient.set(key, value, options);
  } catch (error) {
    console.error("Redis set operation failed:", error);
    throw new Error("Failed to set Redis key");
  }
};

export const getRedisKey = async (key: string) => {
  try {
    await connectRedis();
    return await redisClient.get(key);
  } catch (error) {
    console.error("Redis get operation failed:", error);
    throw new Error("Failed to get Redis key");
  }
};

// Encryption Functions (optimized)
const ALGORITHM = "AES-GCM";
const IV_LENGTH = 12;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function encrypt(text: string): Promise<string> {
  try {
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(process.env.ENCRYPTION_KEY!.padEnd(32)),
      ALGORITHM,
      false,
      ["encrypt"]
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      keyMaterial,
      encoder.encode(text)
    );

    return JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
    });
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
}

export async function decrypt(ciphertext: string): Promise<string> {
  try {
    const { iv, data } = JSON.parse(ciphertext);
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(process.env.ENCRYPTION_KEY!.padEnd(32)),
      ALGORITHM,
      false,
      ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: new Uint8Array(iv) },
      keyMaterial,
      new Uint8Array(data)
    );

    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}