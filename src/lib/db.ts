import "server-only";
import mongoose from "mongoose";
import { env } from "@/lib/env";

// Cached connection to avoid re-connecting on every hot reload in dev
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Attach cache to global so it persists across Next.js hot reloads
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
};

global._mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cache.conn) {
    return cache.conn;
  }

  // Reuse in-flight connection promise
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(env.MONGODB_URI, {
        bufferCommands: false,
      })
      .then((m) => {
        console.log("✅ MongoDB connected");
        return m;
      })
      .catch((err) => {
        cache.promise = null; // reset so next call retries
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
