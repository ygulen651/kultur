import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { Readable } from "node:stream";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "no_file" }, { status: 400 });
    }

    const nodeStream = Readable.fromWeb(file.stream() as any);

    const result: any = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "sendika/videos",
          chunk_size: 6_000_000,
        },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      nodeStream.pipe(upload);
    });

    return NextResponse.json({ ok: true, item: result });
  } catch (e: any) {
    console.error("VIDEO_UPLOAD_ERROR:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "upload_failed" },
      { status: 500 }
    );
  }
}
