import { NextRequest, NextResponse } from "next/server";
import { Announcement } from "@/models/Announcement";
import { connectDB } from "@/lib/db";
import { pickAnnImage } from "@/lib/pickSrc";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  await connectDB();
  const items = await Announcement.find({}).sort({ createdAt: -1 }).limit(10).lean();
  const mapped = items.map((it: any) => ({
    _id: it._id,
    title: it.title,
    fields: {
      imageFilename: it.imageFilename,
      filename: it.filename,
      image: it.image,
      featuredImage: it.featuredImage,
      featuredImageUrl: it.featuredImageUrl,
      coverImage: it.coverImage,
      cover: it.cover,
      photo: it.photo,
      media: it.media,
    },
    computedSrc: pickAnnImage(it),
  }));
  return NextResponse.json({ ok: true, items: mapped });
}
