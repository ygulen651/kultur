import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set");
}

type G = typeof globalThis & {
  _mongooseConn?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

const g = global as G;

if (!g._mongooseConn) {
  g._mongooseConn = { conn: null, promise: null };
}

export async function connectDB() {
  if (g._mongooseConn!.conn) return g._mongooseConn!.conn;
  if (!g._mongooseConn!.promise) {
    g._mongooseConn!.promise = mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB || undefined,
    });
  }
  g._mongooseConn!.conn = await g._mongooseConn!.promise;
  return g._mongooseConn!.conn;
}