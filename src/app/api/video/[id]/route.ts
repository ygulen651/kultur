import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Video from "@/models/Video";

export const revalidate = 0;

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const item = await Video.findById(id).lean();
  if (!item) return NextResponse.json({ ok:false, error:"not_found" }, { status:404 });
  return NextResponse.json({ ok:true, item });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const body = await req.json();
  const item = await Video.findByIdAndUpdate(id, body, { new:true });
  return NextResponse.json({ ok:true, item });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  await Video.findByIdAndDelete(id);
  return NextResponse.json({ ok:true });
}
