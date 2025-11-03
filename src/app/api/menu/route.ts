import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SiteMenu } from "@/models/SiteMenu";
import { toErrorLike } from '@/lib/errors';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    let doc = await SiteMenu.findOne({ singleton: "SITE_MENU" }).lean();
    if (!doc) {
      doc = (await SiteMenu.create({ singleton: "SITE_MENU" })).toObject();
    }
    return NextResponse.json({ ok: true, item: doc });
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error("GET /api/menu error:", e);
    return NextResponse.json({ 
      ok: false, 
      error: "INTERNAL_ERROR",
      details: e.message,
      code: e.code,
      meta: e.meta
    }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const updated = await SiteMenu.findOneAndUpdate(
      { singleton: "SITE_MENU" },
      { $set: { navbar: body.navbar, footer: body.footer } },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({ ok: true, item: updated });
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error("PUT /api/menu error:", e);
    return NextResponse.json({ 
      ok: false, 
      error: "INTERNAL_ERROR",
      details: e.message,
      code: e.code,
      meta: e.meta
    }, { status: 500 });
  }
}
