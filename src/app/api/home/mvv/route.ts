// src/app/api/home/mvv/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import HomeMVV from "@/models/HomeMVV";

export const revalidate = 0; // admin tarafında cache kapalı

export async function GET() {
  try {
    await connectDB();
    const doc = await HomeMVV.findOne({ key: "mvv" }).lean();
    return NextResponse.json({ ok: true, item: doc ?? null });
  } catch (err: any) {
    console.error("GET /api/home/mvv", err?.message || err);
    return NextResponse.json({ ok: false, error: "GET_FAILED" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const payload = {
      missionTitle: String(body?.missionTitle ?? "Misyonumuz"),
      missionText: String(body?.missionText ?? ""),
      visionTitle: String(body?.visionTitle ?? "Vizyonumuz"),
      visionText: String(body?.visionText ?? ""),
      valuesTitle: String(body?.valuesTitle ?? "Değerlerimiz"),
      valuesText: String(body?.valuesText ?? ""),
    };

    const doc = await HomeMVV.findOneAndUpdate(
      { key: "mvv" },
      { $set: payload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({ ok: true, item: doc });
  } catch (err: any) {
    console.error("PUT /api/home/mvv", err?.message || err);
    return NextResponse.json({ ok: false, error: "PUT_FAILED" }, { status: 500 });
  }
}
