import { createClient } from "redis";

// Create Redis client
const getRedisClient = () => {
  const client = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        // Exponential backoff
        return Math.min(retries * 50, 3000);
      },
    },
  });

  // Handle errors
  client.on("error", (err) => {
    console.error("Redis client error:", err);
  });

  return client;
};

let redisClient: ReturnType<typeof createClient> | null = null;

// Get or initialize Redis client
export async function getRedis() {
  if (!redisClient) {
    redisClient = getRedisClient();
    await redisClient.connect();
  }
  console.log("Using Redis client:", redisClient);
  return redisClient;
}

// Rate limiting helper function
export async function rateLimiter(
  key: string,
  limit: number = 5,
  expiry: number = 60
): Promise<boolean> {
  const client = await getRedis();

  try {
    const current = (await client.get(key)) || "0";
    const count = parseInt(current, 10);

    if (count >= limit) {
      return false;
    }

    await client.set(key, (count + 1).toString(), {
      EX: expiry,
      NX: count === 0,
    });

    return true;
  } catch (error) {
    console.error("Rate limiter error:", error);
    // Default to allowing the request in case of Redis errors
    return true;
  }
}
export const redis = createClient({
  url: process.env.REDIS_URL!,
});

redis.on("error", (err) => console.error("Redis error:", err));
redis.connect();
