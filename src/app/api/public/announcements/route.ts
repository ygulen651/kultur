import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Announcement from "@/models/Announcement";

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const items = await Announcement.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ ok: true, items, total: items.length })
  } catch (e: any) {
    console.error('GET /api/public/announcements error:', e)
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}
