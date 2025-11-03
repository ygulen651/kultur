import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose from 'mongoose';
import { Announcement } from '@/models/Announcement'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  await connectDB();
  const dbName = mongoose.connection?.db?.databaseName || null
  const total = await Announcement.countDocuments().catch(() => -1)
  const published = await Announcement.countDocuments({ publishedAt: { $ne: null } }).catch(() => -1)
  const samples = await Announcement.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .select({ title: 1, publishedAt: 1 })
    .lean()

  return NextResponse.json({
    ok: true,
    dbName,
    totalCount: total,
    publishedCount: published,
    samples
  })
}
