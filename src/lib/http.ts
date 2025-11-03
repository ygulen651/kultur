import type { NextRequest } from "next/server";

export function getBaseUrl(req?: NextRequest) {
  if (typeof window !== "undefined") return ""; // client'ta relative
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (!req && envUrl) return envUrl.replace(/\/$/, "");
  const proto = req?.headers.get("x-forwarded-proto") || "http";
  const host  = req?.headers.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}
